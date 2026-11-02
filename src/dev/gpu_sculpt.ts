// THE SCULPTED FIGURES' RAY MARCH ON THE GRAPHICS CHIP (the art chat's helper, 1 Nov 2026; docs/mockups/gpu_sculpt/README.md).
//
// The owner, 31 Oct 2026, of the Warlock, the Tinkerer and the Brawler: "He needs to be able to be played by anyone, what are
// we talking about". A frame of theirs is a figure sculpted in distance fields (dev/sculpt.ts) and drawn by sending a ray
// through each pixel; the march is most of a frame's time, and no way was found to make it cheaper on the CPU with the
// pixels the same (docs/cheap_heroes.md). Of three ways on, he picked, 1 Nov: "Use the phone's graphics chip (Recommended)",
// offered as the same sculpted look painted many times faster, a pixel here and there perhaps different, shown to him side
// by side first.
//
// WHAT IS DONE HERE, AND ONLY THIS: the heavy, purely numeric part of `draw` (dev/sculpt.ts): every pixel's ray marched
// through the same solids with the same blends, the same step rule and the same stopping distance; at the point met, the
// way the skin faces (the same six sums), its creases (the same two) and the solid nearest (whose part it is). All that
// decides the look (colour, the materials' own painters, the tone ramps, cleaning, marks, ink, the edge of light) stays on
// the CPU, in `draw`, unchanged, and is handed the same numbers. Where the chip's 32-bit sums land a ray a hair from where
// the CPU's 64-bit sums do, a pixel at an edge or a tone boundary may come out the other way: nothing else differs.
//
// THE SWITCH, `GPU_SCULPT.on`, IS OFF: `draw` then marches on the CPU exactly as it did (every frame the same to the bit:
// tests/gpu_sculpt.test.ts). On, `draw` asks `gpuMarch` first; where there is no WebGL2, or the context is lost, or a
// shader will not build, or the readback fails, `gpuMarch` says so, the CPU marches that frame as before, and the chip is
// not asked again in this page or worker.
//
// HOW THE CHIP GIVES THE SAME NUMBERS. `Field` (dev/sculpt.ts) asks, at each point, every solid of every material in order,
// passing over one whose bounding ball is further than what it has found (by its blend); `Fast` gives the very same numbers
// asking only the solids of a small cell of space that can matter there. Here space round the figure is cut into cells
// too (`Grid`), and each cell keeps the solids that `Field`, at some point of the cell, could look at; every solid left out
// is one `Field` passes over at every point of the cell, PROVED (`cull`): what `Field` has found when it comes to a solid is
// never more than the furthest that some solid before it (of its own material, or of a material before, one not carved
// there) can be from a point of the cell, so a solid whose ball is further than that by its blend is passed over at every
// point. The chip then does what `Field` does, solid by solid, over the cell's list. `listMarch` is the same march in the
// CPU's own 64-bit numbers: it gives every frame to the bit (tests/gpu_sculpt.test.ts), which proves the lists; the chip
// differs from it only by its 32-bit sums.

import type { V3 } from '../art/skeleton';
import type { Prim } from './sculpt';

/** The switch: march the sculpted figures on the graphics chip where there is one (off: the CPU, exactly as before). */
export const GPU_SCULPT = { on: false };

/**
 * For the checks only: 'gpu' (the chip), or 'emulate' (`listMarch`, the chip's march in the CPU's own numbers); and what
 * has happened (frames marched on the chip, on the CPU after the chip failed, and why it failed).
 */
export const GPU_SCULPT_TEST = {
  mode: 'gpu' as 'gpu' | 'emulate' | 'count' | 'compare',
  marched: 0,
  fellBack: 0,
  why: '' as string,
  /** Time in the last frames' parts, in thousandths of a second (lists, upload, march and readback, shading). */
  ms: { lists: 0, upload: 0, march: 0, shade: 0 },
  /** Wait for each pass to time it alone (slower: for the checks and the test page's split). */
  profile: false,
  /** Ask the chip for its own pass times where the browser can (EXT_disjoint_timer_query_webgl2): `chipTimes`. */
  timer: false,
  /** (TRIED, NOT KEPT, in the CPU's numbers only: the way the skin faces from four sums, not six) */
  tetra: false,
  /**
   * Use a chip that is the CPU pretending to be one (SwiftShader, llvmpipe), or one slower than the CPU: for the checks and
   * the test page only. The game never does: there it would paint his frames many times slower.
   */
  allowSlow: false,
  /** How the chip was found, the first time it was asked for: its name; how long the small figure took on it and here. */
  seen: { name: '', chipMs: 0, cpuMs: 0 },
  /** (for the checks: read back every cell's list) */
  masks: false,
  maskData: null as null | { all: Uint32Array[]; order: number[]; nCells: number },
  /** (for the checks: told each stage as it passes) */
  log: null as null | ((s: string) => void),
  /** The cells' size: pixels square, lengths deep (as `Stage.near` measures). */
  cell: { ts: 8, dt: 8 },
};

/**
 * ROUND 2's savings (the art chat's helper, 1 Nov 2026; docs/mockups/gpu_sculpt/README.md, "Round 2"), each on a switch of its
 * own; all off, the chip marches exactly as in round 1 (the test page's ROUND 1).
 */
export const GPU_ROUND2 = {
  /** The first pass works out a solid's bound only where it can lower what is found (the very same lists). */
  cullSkip: true,
  /** A ray that passes no cell in which a skin can be met is not marched (it would meet nothing: the very same pictures). */
  raySkip: true,
  /**
   * NOT KEPT (off): every cell in which no skin can be met is passed over, the march going on past it. Fewer steps, but each ray
   * then comes to the skin by other steps than the CPU's, and stops a hair from where it does: more pixels a tone off.
   */
  hop: false,
  /**
   * NOT KEPT (off) either: the same for the biggest figures only (more than `HOP_SOLIDS` solids: the demon, and the man
   * changing into it), where the march costs the most. On the sample of round 2 one frame of the demon from behind differed
   * from the CPU's on more than half a percent of its pixels (all tone but a few ink), and seven more over 0.4%.
   */
  hopBig: false,
  /** The solids' table sent into a texture kept from frame to frame, and the readback into buffers kept (no new ones a frame). */
  keep: true,
  /**
   * The march's bands sent to the chip in one go (no flush between them), so the chip keeps its targets for the whole march
   * instead of storing and loading them again for each band (a chip that paints in tiles, as a phone's does). On a chip that is
   * the CPU pretending (only ever used by the checks), each band is still sent alone, so no one wait runs long.
   */
  oneGo: true,
};
/** A figure of more solids than this is one of the biggest (`GPU_ROUND2.hopBig`): the demon has some 480, the man 105. */
export const HOP_SOLIDS = 250;
/** Does a figure of `n` solids have its cells in which no skin can be met passed over? */
function hopsFor(n: number): boolean {
  return GPU_ROUND2.hop || (GPU_ROUND2.hopBig && n > HOP_SOLIDS);
}
/** How near a skin can be in a cell for it to be marched (the march stops at 0.02; the rest a margin for the chip's sums). */
const NEAR = 0.05;

/** What `draw` hands over for each pixel that meets the figure (as `marchFast` does). */
export type Shade = (x: number, y: number, t: number, q: V3, n: V3, m: number, open: number, prim: number) => void;
/** The pixels to march, and how near and far the solids reach. */
export interface MarchBox {
  xs: number;
  xe: number;
  ys: number;
  ye: number;
  zNear: number;
  zFar: number;
}
/** What a solid has worked out once, as `Field` keeps it (dev/sculpt.ts `Ready`). */
interface ReadyLike {
  p: Prim;
  bc: V3;
  br: number;
  ua?: readonly [V3, V3, V3];
  ul?: V3;
  ba?: V3;
  bb?: number;
}
/** The field, as `Field` keeps it: its solids in order, and each material's (and its carves). */
export interface FieldLike {
  rs: readonly ReadyLike[];
  byMat: readonly (readonly ReadyLike[])[];
  carves: readonly (readonly ReadyLike[])[];
}
/** The camera, as the stage has it (art/skin.ts `Stage.seen`). */
export interface Seen {
  seen(v: V3): V3;
}

// ---------------------------------------------------------------------------------------------
// THE SOLIDS, LAID OUT FLAT (the very numbers `Fast` keeps, dev/sculpt.ts, in the same order)

const KC = 0;
const KE = 1;
const KB = 2;
const KT = 3;
const GS = 40;

interface Solids {
  n: number;
  nm: number;
  kind: Uint8Array;
  mat: Int32Array;
  carve: Uint8Array;
  blend: Float64Array;
  br: Float64Array;
  bc: Float64Array;
  farC: Float64Array;
  /**
   * How fast its distance can change from point to point, at most (a rod's, a block's, a sheet's, and its cuts'); for a ball,
   * how much its three lines stretch a length (`sig`), and its least and most half-lengths: its distance, as `dist` has it,
   * is never more than its most half-length times how far out of it a point is along its own half-lengths, less one.
   */
  lip: Float64Array;
  uMin: Float64Array;
  uMax: Float64Array;
  /** It is cut. */
  cut: Uint8Array;
  g: Float64Array;
  cut0: Int32Array;
  cut1: Int32Array;
  cutv: Float64Array;
  /** Each material's solids and carves, by number, in `Field`'s order. */
  prims: Int32Array[];
  carves: Int32Array[];
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (x: V3, y: V3): V3 => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
const triSg = (v: number): number => (v > 0 ? 1 : v < 0 ? -1 : 0);

function solidsOf(f: FieldLike): Solids {
  const rs = f.rs;
  const n = rs.length;
  const nm = f.byMat.length;
  const S: Solids = {
    n,
    nm,
    kind: new Uint8Array(n),
    mat: new Int32Array(n),
    carve: new Uint8Array(n),
    blend: new Float64Array(n),
    br: new Float64Array(n),
    bc: new Float64Array(n * 3),
    farC: new Float64Array(n),
    lip: new Float64Array(n),
    uMin: new Float64Array(n),
    uMax: new Float64Array(n),
    cut: new Uint8Array(n),
    g: new Float64Array(n * GS),
    cut0: new Int32Array(n),
    cut1: new Int32Array(n),
    cutv: new Float64Array(0),
    prims: [],
    carves: [],
  };
  const cuts: number[] = [];
  const index = new Map<ReadyLike, number>();
  rs.forEach((r, i) => {
    index.set(r, i);
    const p = r.p;
    S.kind[i] = p.k === 'cone' ? KC : p.k === 'ell' ? KE : p.k === 'box' ? KB : KT;
    S.mat[i] = p.mat;
    S.carve[i] = p.carve ? 1 : 0;
    S.blend[i] = p.blend;
    S.br[i] = r.br;
    S.bc[i * 3] = r.bc[0];
    S.bc[i * 3 + 1] = r.bc[1];
    S.bc[i * 3 + 2] = r.bc[2];
    S.farC[i] = p.blend + 0.01 + r.br;
    S.cut[i] = p.cuts && p.cuts.length ? 1 : 0;
    const o = i * GS;
    const g = S.g;
    if (p.k === 'cone') {
      const ba = r.ba as V3;
      g.set([p.a[0], p.a[1], p.a[2], ba[0], ba[1], ba[2], r.bb as number, p.ra, p.rb - p.ra, Math.min(p.ra, p.rb), Math.max(p.ra, p.rb), p.b[0], p.b[1], p.b[2]], o);
      const L = Math.sqrt(r.bb as number);
      S.lip[i] = L > 0 ? 1 + Math.abs(p.rb - p.ra) / L : 1;
    } else if (p.k === 'tri') {
      const ba = sub(p.b, p.a);
      const cb = sub(p.c, p.b);
      const ac = sub(p.a, p.c);
      const nor = cross(ba, ac);
      g.set([...p.a, ...p.b, ...p.c, ...ba, ...cb, ...ac, ...nor, ...cross(ba, nor), ...cross(cb, nor), ...cross(ac, nor), Math.sqrt(dot(nor, nor) || 1e-9), dot(ba, ba) || 1e-9, dot(cb, cb) || 1e-9, dot(ac, ac) || 1e-9, p.thick], o);
      S.lip[i] = 1;
    } else {
      const ua = r.ua as readonly [V3, V3, V3];
      const ul = r.ul as V3;
      let most = 0;
      for (let a = 0; a < 3; a++) {
        let off = 0;
        for (let b = 0; b < 3; b++) if (b !== a) off += Math.abs(dot(ua[a], ua[b]));
        most = Math.max(most, dot(ua[a], ua[a]) + off);
      }
      const rr = Math.min(p.k === 'box' ? p.round : 0, ul[0], ul[1], ul[2]);
      g.set([p.c[0], p.c[1], p.c[2], ...ua[0], ...ua[1], ...ua[2], ul[0], ul[1], ul[2], p.k === 'box' ? rr : Math.min(ul[0], ul[1], ul[2])], o);
      S.lip[i] = Math.sqrt(most) * (1 + 1e-9);
      S.uMin[i] = Math.min(ul[0], ul[1], ul[2]);
      S.uMax[i] = Math.max(ul[0], ul[1], ul[2]);
    }
    S.cut0[i] = cuts.length / 4;
    if (p.cuts) for (const c of p.cuts) {
      cuts.push(c.n[0], c.n[1], c.n[2], c.o);
      if (p.k !== 'ell') S.lip[i] = Math.max(S.lip[i], Math.hypot(c.n[0], c.n[1], c.n[2]));
    }
    S.lip[i] *= 1 + 1e-9;
    S.cut1[i] = cuts.length / 4;
  });
  S.cutv = new Float64Array(cuts);
  for (let m = 0; m < nm; m++) {
    S.prims.push(Int32Array.from(f.byMat[m].map((r) => index.get(r) as number)));
    S.carves.push(Int32Array.from(f.carves[m].map((r) => index.get(r) as number)));
  }
  return S;
}

/** Can the chip be trusted with this figure (every number of it a number)? */
function soundOf(S: Solids): boolean {
  for (const a of [S.g, S.bc, S.br, S.blend, S.cutv]) for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) return false;
  return true;
}

/** `Field`'s distance of a point from one solid (dev/sculpt.ts `dist`, as `Fast.dist` has it): the same sums in the same order. */
function distOf(S: Solids, i: number, x: number, y: number, z: number): number {
  const g = S.g;
  const o = i * GS;
  let d: number;
  const k = S.kind[i];
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
    let td: number;
    if (s1 + s2 + s3 >= 2) td = Math.abs(g[o + 18] * pa0 + g[o + 19] * pa1 + g[o + 20] * pa2) / g[o + 30];
    else td = Math.sqrt(Math.min(seg2(g[o + 9], g[o + 10], g[o + 11], g[o + 31], pa0, pa1, pa2), seg2(g[o + 12], g[o + 13], g[o + 14], g[o + 32], pb0, pb1, pb2), seg2(g[o + 15], g[o + 16], g[o + 17], g[o + 33], pc0, pc1, pc2)));
    d = td - g[o + 34];
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
  const c1 = S.cut1[i];
  if (c1 > 0) {
    const cv = S.cutv;
    for (let c = S.cut0[i] * 4; c < c1 * 4; c += 4) d = Math.max(d, x * cv[c] + y * cv[c + 1] + z * cv[c + 2] - cv[c + 3]);
  }
  return d;
}
function seg2(e0: number, e1: number, e2: number, ee: number, w0: number, w1: number, w2: number): number {
  const t = Math.max(0, Math.min(1, (e0 * w0 + e1 * w1 + e2 * w2) / ee));
  const x = e0 * t - w0;
  const y = e1 * t - w1;
  const z = e2 * t - w2;
  return x * x + y * y + z * z;
}

// ---------------------------------------------------------------------------------------------
// THE CELLS, AND THE SOLIDS EACH MUST KEEP (proved)

/** What a bound is allowed for the slips of its own sums, and the chip's: lengths of a figure are tens, cells several. */
const MARGIN = 1e-3;

/** A run of lists: each list a run of material segments (material, first entry, solids, carves), each entry a solid. */
class Lists {
  segs = new Int32Array(1024);
  /** Per segment: the most `Field` can have found when it comes to the material, anywhere the list holds. */
  segCap = new Float64Array(256);
  ents = new Int32Array(4096);
  /** Per entry: the most `Field` can have found when it comes to the solid, from the solids of its material before it. */
  entU = new Float64Array(4096);
  ns = 0;
  ne = 0;
  keepBounds: boolean;
  constructor(keepBounds: boolean) {
    this.keepBounds = keepBounds;
  }
  reset(): void {
    this.ns = 0;
    this.ne = 0;
  }
  ent(j: number, u: number): void {
    if (this.ne >= this.ents.length) {
      const a = new Int32Array(this.ents.length * 2);
      a.set(this.ents);
      this.ents = a;
      if (this.keepBounds) {
        const b = new Float64Array(this.ents.length);
        b.set(this.entU);
        this.entU = b;
      }
    }
    if (this.keepBounds) this.entU[this.ne] = u;
    this.ents[this.ne++] = j;
  }
  seg(m: number, start: number, np: number, nc: number, cap: number): void {
    if (this.ns * 4 + 4 > this.segs.length) {
      const a = new Int32Array(this.segs.length * 2);
      a.set(this.segs);
      this.segs = a;
      if (this.keepBounds) {
        const b = new Float64Array(this.segs.length / 4);
        b.set(this.segCap);
        this.segCap = b;
      }
    }
    const o = this.ns * 4;
    this.segs[o] = m;
    this.segs[o + 1] = start;
    this.segs[o + 2] = np;
    this.segs[o + 3] = nc;
    if (this.keepBounds) this.segCap[this.ns] = cap;
    this.ns++;
  }
}

/** The list of every solid, in `Field`'s order (materials with none left out), nothing known of where it holds. */
function fullList(S: Solids, out: Lists): { s0: number; ns: number } {
  const s0 = out.ns;
  for (let m = 0; m < S.nm; m++) {
    const P = S.prims[m];
    if (!P.length) continue;
    const C = S.carves[m];
    const start = out.ne;
    for (let k = 0; k < P.length; k++) out.ent(P[k], Infinity);
    for (let k = 0; k < C.length; k++) out.ent(C[k], Infinity);
    out.seg(m, start, P.length, C.length, Infinity);
  }
  return { s0, ns: out.ns - s0 };
}

/**
 * THE MOST WHAT `Field` HAS FOUND CAN BE, ONCE IT HAS COME PAST SOLID `j`, anywhere within `rho` of (cx, cy, cz) (`dc` its
 * ball's middle's distance from there): if it looked at it, no more than its distance there; if it passed over it, less
 * than how far its ball is (less its blend), else it would have looked.
 */
function upperOf(S: Solids, j: number, cx: number, cy: number, cz: number, rho: number, dc: number): number {
  let up: number;
  if (S.kind[j] === KE) {
    // a ball: never more than how far the point is from its middle along its own lines, nor than its most half-length
    // times how far out of it the point is, less one (which grows no faster than its stretch over its least half-length)
    const g = S.g;
    const o = j * GS;
    const v0 = cx - g[o];
    const v1 = cy - g[o + 1];
    const v2 = cz - g[o + 2];
    const x0 = (v0 * g[o + 3] + v1 * g[o + 4] + v2 * g[o + 5]) / g[o + 12];
    const y0 = (v0 * g[o + 6] + v1 * g[o + 7] + v2 * g[o + 8]) / g[o + 13];
    const z0 = (v0 * g[o + 9] + v1 * g[o + 10] + v2 * g[o + 11]) / g[o + 14];
    const k0 = Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0) * (1 + 1e-9) + (S.lip[j] * rho) / S.uMin[j];
    up = Math.min(S.lip[j] * (dc + rho), Math.max(0, S.uMax[j] * (k0 - 1)));
    const cv = S.cutv;
    for (let c = S.cut0[j] * 4; c < S.cut1[j] * 4; c += 4) up = Math.max(up, cx * cv[c] + cy * cv[c + 1] + cz * cv[c + 2] - cv[c + 3] + Math.hypot(cv[c], cv[c + 1], cv[c + 2]) * rho);
  } else up = distOf(S, j, cx, cy, cz) + S.lip[j] * rho;
  return Math.max(up, dc + rho - S.br[j] - S.blend[j]) + MARGIN * (1 + Math.abs(up));
}

/**
 * THE LEAST SOLID `j`'S DISTANCE CAN BE anywhere within `rho` of (cx, cy, cz): its distance there less how fast it can change
 * (a rod, a block, a sheet); for a ball, through how far out of it the point is along its own half-lengths, as `dist` has it
 * (out of it, no less than that less one, times its least half-length; in it, no less than what is left to one, times its
 * most). Its cuts only take it further off.
 */
function lowOf(S: Solids, j: number, cx: number, cy: number, cz: number, rho: number): number {
  let lo: number;
  if (S.kind[j] === KE) {
    const g = S.g;
    const o = j * GS;
    const v0 = cx - g[o];
    const v1 = cy - g[o + 1];
    const v2 = cz - g[o + 2];
    const x0 = (v0 * g[o + 3] + v1 * g[o + 4] + v2 * g[o + 5]) / g[o + 12];
    const y0 = (v0 * g[o + 6] + v1 * g[o + 7] + v2 * g[o + 8]) / g[o + 13];
    const z0 = (v0 * g[o + 9] + v1 * g[o + 10] + v2 * g[o + 11]) / g[o + 14];
    const k0 = Math.max(0, Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0) * (1 - 1e-9) - (S.lip[j] * rho) / S.uMin[j]);
    lo = k0 >= 1 ? (k0 - 1) * S.uMin[j] : -(1 - k0) * S.uMax[j];
  } else lo = distOf(S, j, cx, cy, cz) - S.lip[j] * rho;
  return lo - MARGIN * (1 + Math.abs(lo));
}
/** The least `Field.at` can be anywhere within `rho` of (cx, cy, cz), from a list good there: each material's solids' least, smoothly joined as `ofMat` joins them (a join only takes away); carves only add. */
function lowOfList(S: Solids, L: Lists, s0: number, ns: number, cx: number, cy: number, cz: number, rho: number): number {
  let least = Infinity;
  for (let s = s0; s < s0 + ns; s++) {
    const e0 = L.segs[s * 4 + 1];
    const np = L.segs[s * 4 + 2];
    let U = Infinity;
    for (let k = e0; k < e0 + np; k++) {
      const j = L.ents[k];
      const l = lowOf(S, j, cx, cy, cz, rho);
      if (U === Infinity) U = l;
      else {
        const kk = S.blend[j];
        if (kk <= 0) U = Math.min(U, l);
        else {
          const h = Math.max(kk - Math.abs(U - l), 0) / kk;
          U = Math.min(U, l) - h * h * kk * 0.25;
        }
      }
    }
    if (U < least) least = U;
  }
  return least - MARGIN * (1 + Math.abs(least));
}

let DC = new Float64Array(1024);
/**
 * THE SOLIDS OF A LIST THAT CAN MATTER WITHIN `rho` OF (cx, cy, cz), into `out`; the list is segments `s0` on of `P`. A solid
 * left out is one `Field` passes over at every such point, at every way it is asked (`at`, `ofMat` with no cap, `nearest`).
 */
function cull(S: Solids, P: Lists, s0: number, ns: number, cx: number, cy: number, cz: number, rho: number, out: Lists): number {
  const first = out.ns;
  const bc = S.bc;
  let capRun = Infinity;
  for (let s = s0; s < s0 + ns; s++) {
    const so = s * 4;
    const m = P.segs[so];
    const e0 = P.segs[so + 1];
    const np = P.segs[so + 2];
    const nc = P.segs[so + 3];
    const capB = Math.min(capRun, P.keepBounds ? P.segCap[s] : Infinity);
    if (DC.length < np + nc) DC = new Float64Array(2 * (np + nc));
    for (let k = 0; k < np + nc; k++) {
      const j = P.ents[e0 + k];
      const ex = cx - bc[j * 3];
      const ey = cy - bc[j * 3 + 1];
      const ez = cz - bc[j * 3 + 2];
      DC[k] = Math.sqrt(ex * ex + ey * ey + ez * ez);
    }
    // its carves: one is looked at only where the point is within its ball and its blend
    let carved = false;
    for (let k = np; k < np + nc; k++) if (!(DC[k] - rho > S.farC[P.ents[e0 + k]] + MARGIN)) carved = true;
    // the whole material passed over: no solid of it nearer than what can be found before it, by its blend
    let drop = capB < Infinity;
    for (let k = 0; k < np && drop; k++) {
      const j = P.ents[e0 + k];
      if (!(DC[k] - rho > capB + S.blend[j] + S.br[j] + MARGIN)) drop = false;
    }
    let witness = Infinity;
    const start = out.ne;
    let kept = 0;
    let uRun = Infinity;
    for (let k = 0; k < np; k++) {
      const j = P.ents[e0 + k];
      if (!drop) {
        const u = Math.min(uRun, P.keepBounds ? P.entU[e0 + k] : Infinity);
        if (!(DC[k] - rho > u + S.blend[j] + S.br[j] + MARGIN)) {
          out.ent(j, u);
          kept++;
        }
      }
      // (ROUND 2: its bound is no less than its ball's own clause, so where that is no less than the least found so far it
      // lowers nothing, and is not worked out; when the material is not passed over, what is found so far is the witness)
      COUNT.ups++;
      if (GPU_ROUND2.cullSkip && DC[k] + rho - S.br[j] - S.blend[j] >= witness) continue;
      COUNT.upsDone++;
      const up = upperOf(S, j, cx, cy, cz, rho, DC[k]);
      if (!drop) uRun = Math.min(uRun, up);
      witness = Math.min(witness, up);
    }
    if (!drop && kept) {
      let keptC = 0;
      for (let k = np; k < np + nc; k++) {
        const j = P.ents[e0 + k];
        if (!(DC[k] - rho > S.farC[j] + MARGIN)) {
          out.ent(j, Infinity);
          keptC++;
        }
      }
      out.seg(m, start, kept, keptC, capB);
    } else out.ne = start;
    capRun = carved ? capB : Math.min(capB, witness);
  }
  return out.ns - first;
}

/** Space round the figure cut into cells, as the picture sees it, and each cell's list (the last cell: every solid). */
export interface Grid {
  sx0: number;
  sy0: number;
  t0: number;
  ts: number;
  dt: number;
  nx: number;
  ny: number;
  nz: number;
  /** Per cell, its first segment and how many (the cell after the last: the list of every solid). */
  cells: Int32Array;
  L: Lists;
  /** Per cell, the least `Field.at` can be in it, and whether a skin can be met in it (the cell after the last: yes). */
  low: Float64Array;
  near: Uint8Array;
  /** Per column of cells (across, down), whether a skin can be met in any of its cells; and whether these are known. */
  colNear: Uint8Array;
  lowOk: boolean;
}
/** The column of cells a pixel's ray goes down. */
function colOfS(G: Grid, sx: number, sy: number): number {
  const ix = Math.floor((sx - G.sx0) / G.ts);
  const iy = Math.floor((sy - G.sy0) / G.ts);
  if (ix < 0 || iy < 0 || ix >= G.nx || iy >= G.ny) return G.nx * G.ny;
  return iy * G.nx + ix;
}
/** Most cells deep a column may be for the chip to say which can be met (four words of bits). */
const MOST_DEEP = 128;

/** How far a corner of a box of these half-sizes (across, down, deep) is from its middle. */
function reachOf(CX: V3, CY: V3, CZ: V3, hx: number, hy: number, hz: number): number {
  let r = 0;
  for (let c = 0; c < 4; c++) {
    const a = c & 1 ? hy : -hy;
    const b = c & 2 ? hz : -hz;
    const v0 = hx * CX[0] + a * CY[0] + b * CZ[0];
    const v1 = hx * CX[1] + a * CY[1] + b * CZ[1];
    const v2 = hx * CX[2] + a * CY[2] + b * CZ[2];
    r = Math.max(r, Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2));
  }
  return r;
}

const FULL = new Lists(true);

/** How the cells lie: their size, how many each way, where they begin, how far round each its list holds. */
interface Layout {
  sx0: number;
  sy0: number;
  t0: number;
  ts: number;
  dt: number;
  nx: number;
  ny: number;
  nz: number;
  rho: number;
}
function layoutOf(rows: readonly [V3, V3, V3], CX: V3, CY: V3, CZ: V3, box: MarchBox, ax: number, ay: number, E: number): Layout {
  const { ts, dt } = GPU_SCULPT_TEST.cell;
  const lenOf = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
  // (the cells reach past the march as far as a crease is looked for off the skin, as `marchFast`'s do)
  const padS = 2.6 * Math.max(lenOf(rows[0]), lenOf(rows[1])) + 2;
  const padT = 2.6 * lenOf(rows[2]) + 2;
  const sx0 = box.xs + 0.5 - ax - padS;
  const sy0 = box.ys + 0.5 - ay - padS;
  const t0 = box.zFar - padT;
  const nx = Math.max(1, Math.ceil((box.xe + 0.5 - ax + padS - sx0) / ts));
  const ny = Math.max(1, Math.ceil((box.ye + 0.5 - ay + padS - sy0) / ts));
  const nz = Math.max(1, Math.ceil((box.zNear + padT - t0) / dt));
  // (each cell's list good for its points and for the normal's little steps off them; slips allowed for)
  const rho = reachOf(CX, CY, CZ, ts / 2, ts / 2, dt / 2) * (1 + 1e-6) + E + MARGIN;
  return { sx0, sy0, t0, ts, dt, nx, ny, nz, rho };
}

/** Every cell's list, each culled from the list of every solid (as the chip's first pass does, cell by cell). */
function buildGrid(S: Solids, rows: readonly [V3, V3, V3], CX: V3, CY: V3, CZ: V3, box: MarchBox, ax: number, ay: number, E: number): Grid {
  const lay = layoutOf(rows, CX, CY, CZ, box, ax, ay, E);
  const { sx0, sy0, t0, ts, dt, nx, ny, nz, rho } = lay;
  const N = nx * ny * nz;
  const cells = new Int32Array((N + 1) * 2);
  const low = new Float64Array(N + 1).fill(-Infinity);
  const near = new Uint8Array(N + 1).fill(1);
  const colNear = new Uint8Array(nx * ny + 1).fill(1);
  // (as the chip can: no more cells deep than its words of bits hold, and a bit of the last word of a list free to say it)
  const lowOk = (GPU_ROUND2.raySkip || hopsFor(S.n)) && nz <= MOST_DEEP && S.n < MOST;
  const L = new Lists(false);
  FULL.reset();
  const top = fullList(S, FULL);
  for (let iz = 0; iz < nz; iz++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const k = (iz * ny + iy) * nx + ix;
        const sx = sx0 + (ix + 0.5) * ts;
        const sy = sy0 + (iy + 0.5) * ts;
        const t = t0 + (iz + 0.5) * dt;
        cells[k * 2] = L.ns;
        const cx = CX[0] * sx + CY[0] * sy + CZ[0] * t;
        const cy = CX[1] * sx + CY[1] * sy + CZ[1] * t;
        const cz = CX[2] * sx + CY[2] * sy + CZ[2] * t;
        cells[k * 2 + 1] = cull(S, FULL, top.s0, top.ns, cx, cy, cz, rho, L);
        if (lowOk) {
          low[k] = lowOfList(S, L, cells[k * 2], cells[k * 2 + 1], cx, cy, cz, rho);
          near[k] = low[k] > NEAR ? 0 : 1;
        }
      }
    }
  }
  // the list of every solid, for a point outside every cell
  cells[N * 2] = L.ns;
  cells[N * 2 + 1] = fullList(S, L).ns;
  if (lowOk) {
    for (let c = 0; c < nx * ny; c++) {
      let any = 0;
      for (let iz = 0; iz < nz && !any; iz++) any = near[iz * nx * ny + c];
      colNear[c] = any;
    }
  }
  return { sx0, sy0, t0, ts, dt, nx, ny, nz, cells, L, low, near, colNear, lowOk };
}

// ---------------------------------------------------------------------------------------------
// THE CHIP'S MARCH IN THE CPU'S OWN NUMBERS (`listMarch`): what the shader does, sum for sum as `Field` does them

/** `Field.ofMat` over one segment of a cell's list (what is found, `cap` as `at` gives it). */
function ofSeg(S: Solids, L: Lists, s: number, x: number, y: number, z: number, cap: number): number {
  const so = s * 4;
  const e0 = L.segs[so + 1];
  const np = L.segs[so + 2];
  const nc = L.segs[so + 3];
  const bc = S.bc;
  let d = Infinity;
  COUNT.ents += np;
  for (let k = e0; k < e0 + np; k++) {
    const j = L.ents[k];
    const far = Math.min(d, cap) + S.blend[j] + S.br[j];
    if (far < 0) continue;
    const ex = x - bc[j * 3];
    const ey = y - bc[j * 3 + 1];
    const ez = z - bc[j * 3 + 2];
    if (ex * ex + ey * ey + ez * ez > far * far) continue;
    COUNT.dists++;
    const dj = distOf(S, j, x, y, z);
    if (d === Infinity) d = dj;
    else {
      const kk = S.blend[j];
      if (kk <= 0) d = Math.min(d, dj);
      else {
        const h = Math.max(kk - Math.abs(d - dj), 0) / kk;
        d = Math.min(d, dj) - h * h * kk * 0.25;
      }
    }
  }
  if (d === Infinity) return cap === Infinity ? 1e6 : cap + 1;
  for (let k = e0 + np; k < e0 + np + nc; k++) {
    const j = L.ents[k];
    const far = S.farC[j];
    const ex = x - bc[j * 3];
    const ey = y - bc[j * 3 + 1];
    const ez = z - bc[j * 3 + 2];
    if (ex * ex + ey * ey + ez * ez > far * far) continue;
    const c = -distOf(S, j, x, y, z);
    const kk = S.blend[j];
    if (kk <= 0) d = Math.max(d, c);
    else {
      const h = Math.max(kk - Math.abs(d - c), 0) / kk;
      d = Math.max(d, c) + h * h * kk * 0.25;
    }
  }
  return d;
}

/** (for the checks: how many entries and distances the march has looked at, and where; how many times `at` was asked) */
export const COUNT = {
  ents: 0,
  dists: 0,
  ats: 0,
  segs: 0,
  steps: 0,
  rays: 0,
  hits: 0,
  /** Rays not marched (nothing they pass can be met), cells passed over, upper bounds asked and worked out in the first pass. */
  skipped: 0,
  hops: 0,
  ups: 0,
  upsDone: 0,
  /** The entries and distances of the march itself (the rest: the way the skin faces, its creases, whose). */
  marchEnts: 0,
  marchDists: 0,
};
/** Zero the counts. */
export function countReset(): void {
  for (const k of Object.keys(COUNT) as (keyof typeof COUNT)[]) COUNT[k] = 0;
}
/** `Field.at` over a cell's list: the nearest skin, whose, and the segment of it. */
const AT = { d: 0, m: -1, s: -1 };
function atCell(S: Solids, G: Grid, cell: number, x: number, y: number, z: number): void {
  const L = G.L;
  const s0 = G.cells[cell * 2];
  const ns = G.cells[cell * 2 + 1];
  let d = Infinity;
  let m = -1;
  let ms = -1;
  let next = 0;
  COUNT.ats++;
  COUNT.segs += ns;
  for (let s = s0; s < s0 + ns; s++) {
    const mat = L.segs[s * 4];
    // (a material before it with nothing in the list: `Field` finds nothing of it, and with nothing found, takes 1e6)
    if (d === Infinity && mat > next) {
      d = 1e6;
      m = next;
    }
    const di = ofSeg(S, L, s, x, y, z, d);
    if (di < d) {
      d = di;
      m = mat;
      ms = s;
    }
    next = mat + 1;
  }
  if (d === Infinity) {
    d = 1e6;
    m = next;
  }
  AT.d = d;
  AT.m = m;
  AT.s = ms;
}
function cellOfS(G: Grid, sx: number, sy: number, t: number): number {
  const ix = Math.floor((sx - G.sx0) / G.ts);
  const iy = Math.floor((sy - G.sy0) / G.ts);
  const iz = Math.floor((t - G.t0) / G.dt);
  if (ix < 0 || iy < 0 || iz < 0 || ix >= G.nx || iy >= G.ny || iz >= G.nz) return G.nx * G.ny * G.nz;
  return (iz * G.ny + iy) * G.nx + ix;
}

/** THE CHIP'S MARCH, IN 64-BIT NUMBERS: every pixel of `box`, as `draw`'s plain march, over the cells' lists. */
export function listMarch(f: FieldLike, st: Seen, ax: number, ay: number, box: MarchBox, CX: V3, CY: V3, CZ: V3, L2: number, E: number, shade: Shade): boolean {
  const S = solidsOf(f);
  if (!soundOf(S)) return false;
  const rows = rowsOf(st);
  const g0 = performance.now();
  const G = buildGrid(S, rows, CX, CY, CZ, box, ax, ay, E);
  noteGrid(G, performance.now() - g0, S.n);
  const cellOfP = (x: number, y: number, z: number): number =>
    cellOfS(G, rows[0][0] * x + rows[0][1] * y + rows[0][2] * z, rows[1][0] * x + rows[1][1] * y + rows[1][2] * z, rows[2][0] * x + rows[2][1] * y + rows[2][2] * z);
  const { xs, xe, ys, ye, zNear, zFar } = box;
  const skipRays = GPU_ROUND2.raySkip && G.lowOk;
  const hop = hopsFor(S.n) && G.lowOk;
  for (let y = ys; y <= ye; y++) {
    for (let x = xs; x <= xe; x++) {
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      COUNT.rays++;
      // (ROUND 2: a ray that passes no cell in which a skin can be met is not marched: it would meet nothing)
      if (skipRays && !G.colNear[colOfS(G, sx, sy)]) {
        COUNT.skipped++;
        continue;
      }
      const b0 = CX[0] * sx + CY[0] * sy;
      const b1 = CX[1] * sx + CY[1] * sy;
      const b2 = CX[2] * sx + CY[2] * sy;
      let t = zNear;
      let hit = false;
      let q0 = b0;
      let q1 = b1;
      let q2 = b2;
      let m = -1;
      let ms = -1;
      const e0 = COUNT.ents;
      const d0 = COUNT.dists;
      let hops = 0;
      for (let i = 0; i < 160 && t > zFar; ) {
        if (hop && hops < 256) {
          // (NOT KEPT, behind its own switch: a cell in which nothing can be met is passed over, the march going on past it)
          const kc = cellOfS(G, sx, sy, t);
          if (!G.near[kc]) {
            t = G.t0 + Math.floor((t - G.t0) / G.dt) * G.dt - 1e-3 * G.dt;
            hops++;
            COUNT.hops++;
            continue;
          }
        }
        q0 = b0 + CZ[0] * t;
        q1 = b1 + CZ[1] * t;
        q2 = b2 + CZ[2] * t;
        atCell(S, G, cellOfS(G, sx, sy, t), q0, q1, q2);
        COUNT.steps++;
        i++;
        if (AT.d < 0.02) {
          hit = true;
          m = AT.m;
          ms = AT.s;
          break;
        }
        t -= Math.max(0.02, (AT.d * 0.8) / L2);
      }
      COUNT.marchEnts += COUNT.ents - e0;
      COUNT.marchDists += COUNT.dists - d0;
      if (!hit) continue;
      COUNT.hits++;
      const L = G.L;
      let nx: number;
      let ny: number;
      let nz: number;
      if (GPU_SCULPT_TEST.tetra) {
        // (TRIED, NOT KEPT: the way the skin faces from four sums, at the corners of a little three-sided pyramid, not six)
        const h = E;
        const a = ofSeg(S, L, ms, q0 + h, q1 - h, q2 - h, Infinity);
        const b = ofSeg(S, L, ms, q0 - h, q1 - h, q2 + h, Infinity);
        const c = ofSeg(S, L, ms, q0 - h, q1 + h, q2 - h, Infinity);
        const d = ofSeg(S, L, ms, q0 + h, q1 + h, q2 + h, Infinity);
        nx = a - b - c + d;
        ny = -a - b + c + d;
        nz = -a + b - c + d;
      } else {
        nx = ofSeg(S, L, ms, q0 + E, q1 + 0, q2 + 0, Infinity) - ofSeg(S, L, ms, q0 + -E, q1 + 0, q2 + 0, Infinity);
        ny = ofSeg(S, L, ms, q0 + 0, q1 + E, q2 + 0, Infinity) - ofSeg(S, L, ms, q0 + 0, q1 + -E, q2 + 0, Infinity);
        nz = ofSeg(S, L, ms, q0 + 0, q1 + 0, q2 + E, Infinity) - ofSeg(S, L, ms, q0 + 0, q1 + 0, q2 + -E, Infinity);
      }
      const nn = Math.hypot(nx, ny, nz) || 1;
      const n: V3 = [nx / nn, ny / nn, nz / nn];
      const a0 = q0 + n[0] * 1.2;
      const a1 = q1 + n[1] * 1.2;
      const a2 = q2 + n[2] * 1.2;
      atCell(S, G, cellOfP(a0, a1, a2), a0, a1, a2);
      const o1 = AT.d / 1.2;
      const c0 = q0 + n[0] * 2.6;
      const c1 = q1 + n[1] * 2.6;
      const c2 = q2 + n[2] * 2.6;
      atCell(S, G, cellOfP(c0, c1, c2), c0, c1, c2);
      const o2 = AT.d / 2.6;
      const open = Math.max(0, Math.min(1, (o1 + o2) / 2));
      // whose it is: `Field.nearest` over the material's own solids in the cell
      const so = ms * 4;
      const e0n = L.segs[so + 1];
      const np = L.segs[so + 2];
      let best = Infinity;
      let p = L.ents[e0n];
      for (let k = e0n; k < e0n + np; k++) {
        const j = L.ents[k];
        const lb = Math.hypot(q0 - S.bc[j * 3], q1 - S.bc[j * 3 + 1], q2 - S.bc[j * 3 + 2]) - S.br[j];
        if (lb > best) continue;
        const d = distOf(S, j, q0, q1, q2);
        if (d < best) {
          best = d;
          p = j;
        }
      }
      shade(x, y, t, [q0, q1, q2], n, m, open, p);
    }
  }
  return true;
}

function rowsOf(st: Seen): [V3, V3, V3] {
  const r0 = st.seen([1, 0, 0]);
  const r1 = st.seen([0, 1, 0]);
  const r2 = st.seen([0, 0, 1]);
  return [[r0[0], r1[0], r2[0]], [r0[1], r1[1], r2[1]], [r0[2], r1[2], r2[2]]];
}

/** The last grid's size and the time its lists took (for the checks). */
export const GRID_SEEN = { cells: 0, segs: 0, ents: 0, solids: 0, ms: 0, most: 0, mats: 0 };
function noteGrid(G: Grid, ms: number, solids: number): void {
  GRID_SEEN.cells = G.nx * G.ny * G.nz;
  GRID_SEEN.segs = G.L.ns;
  GRID_SEEN.ents = G.L.ne;
  GRID_SEEN.solids = solids;
  GRID_SEEN.ms = ms;
}

/** How big a grid's lists are (for the checks): cells, segments, entries. */
export function gridStats(f: FieldLike, st: Seen, ax: number, ay: number, box: MarchBox, CX: V3, CY: V3, CZ: V3, E: number): { cells: number; segs: number; ents: number; ms: number } {
  const t0 = performance.now();
  const S = solidsOf(f);
  const G = buildGrid(S, rowsOf(st), CX, CY, CZ, box, ax, ay, E);
  return { cells: G.nx * G.ny * G.nz, segs: G.L.ns, ents: G.L.ne, ms: performance.now() - t0 };
}

// ---------------------------------------------------------------------------------------------
// THE CHIP (WebGL2): one shader for every figure, the solids and the lists as data; built once, kept

/** Solids a figure may have for the chip (its cells' lists are masks of this many bits). */
const MOST = 512;
/** Texels a solid takes in the chip's table, and the table's width. */
const TEX_W = 1024;
/** Cells a row of the masks' picture holds. */
const CELLS_W = 256;
/** Rows of pixels marched in one go (so no one draw runs long). */
const BAND = 32;

/** Materials a figure may have for the chip (their places in the order are a table of this many). */
const MOST_MATS = 64;

// The table of solids, 16 texels a solid, in `Field`'s order: (its ball's middle, its blend and reach: what `Field` looks
// at first; for a carve, its reach as a carve), (its kind, blend, first and last cut), (its reach, its number), (for the
// first pass: how fast its distance can change, its least and most half-length), then its shape.
const HEAD = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp isampler2D;
precision highp usampler2D;
uniform sampler2D uSol;
uniform sampler2D uCut;
// (each solid's first two rows, read for every solid of every list looked at: kept where a read is cheapest)
layout(std140) uniform Head0 { vec4 uH0[${MOST}]; };
layout(std140) uniform Head1 { vec4 uH1[${MOST}]; };
uniform int uN;
uniform int uNM;
// (each material's place in the order: its first solid, its first carve, after its last; read from a table, as some chips
// read a uniform array by a number worked out as they go wrongly)
uniform isampler2D uMatT;
ivec4 matOf(int m) { return texelFetch(uMatT, ivec2(m, 0), 0); }
uniform vec3 uCX;
uniform vec3 uCY;
uniform vec3 uCZ;
uniform vec3 uG0;
uniform vec2 uGS;
uniform ivec3 uGN;
uniform int uCW;
vec4 sol(int r, int k) { int i = (r << 4) + k; return texelFetch(uSol, ivec2(i & ${TEX_W - 1}, i >> ${Math.log2(TEX_W)}), 0); }
vec4 cutAt(int c) { return texelFetch(uCut, ivec2(c & ${TEX_W - 1}, c >> ${Math.log2(TEX_W)}), 0); }
// (the lowest bit set: a power of two is a float exactly, and its exponent is where the bit is; the sign masked off, as a
// chip may turn the top bit into a float as a number less than nothing)
int lsb(uint v) { uint l = v & (~v + 1u); return int((floatBitsToUint(float(l)) >> 23) & 255u) - 127; }
uint pick(uvec4 v, int c) { return c == 0 ? v.x : (c == 1 ? v.y : (c == 2 ? v.z : v.w)); }
float seg2(vec3 e, float ee, vec3 w) { float t = clamp(dot(e, w) / ee, 0.0, 1.0); vec3 x = e * t - w; return dot(x, x); }
// how far a point is from one solid's skin (dev/sculpt.ts dist): the same sums; h1 its second texel
float distOf(int r, vec3 q, vec4 h1) {
  int kind = int(h1.x) & 7;
  float d;
  if (kind == 0) {
    vec4 A = sol(r, 4); vec4 B = sol(r, 5); vec4 C = sol(r, 6);
    vec3 pa = q - A.xyz;
    float h = A.w > 0.0 ? clamp(dot(pa, B.xyz) / A.w, 0.0, 1.0) : 0.0;
    vec3 w = pa - B.xyz * h;
    d = sqrt(dot(w, w)) - (B.w + C.x * h);
  } else if (kind == 3) {
    vec4 A = sol(r, 4); vec4 B = sol(r, 5); vec4 C = sol(r, 6); vec4 BA = sol(r, 7); vec4 CB = sol(r, 8);
    vec4 AC = sol(r, 9); vec4 NO = sol(r, 10); vec4 C1 = sol(r, 11); vec4 C2 = sol(r, 12); vec4 C3 = sol(r, 13);
    vec3 pa = q - A.xyz; vec3 pb = q - B.xyz; vec3 pc = q - C.xyz;
    float s = sign(dot(C1.xyz, pa)) + sign(dot(C2.xyz, pb)) + sign(dot(C3.xyz, pc));
    float td;
    if (s >= 2.0) td = abs(dot(NO.xyz, pa)) / A.w;
    else td = sqrt(min(min(seg2(BA.xyz, B.w, pa), seg2(CB.xyz, C.w, pb)), seg2(AC.xyz, BA.w, pc)));
    d = td - CB.w;
  } else {
    vec4 C = sol(r, 4); vec4 U0 = sol(r, 5); vec4 U1 = sol(r, 6); vec4 U2 = sol(r, 7);
    vec3 v = q - C.xyz;
    vec3 p = vec3(dot(v, U0.xyz), dot(v, U1.xyz), dot(v, U2.xyz));
    vec3 ul = vec3(U0.w, U1.w, U2.w);
    if (kind == 1) {
      vec3 p0 = p / ul;
      float k0 = length(p0);
      float k1 = length(p0 / ul);
      d = k1 > 1e-9 ? (k0 * (k0 - 1.0)) / k1 : -C.w;
    } else {
      float rr = C.w;
      vec3 qq = abs(p) - ul + rr;
      d = length(max(qq, 0.0)) + min(max(qq.x, max(qq.y, qq.z)), 0.0) - rr;
    }
  }
  int c1 = int(h1.w);
  for (int c = int(h1.z); c < c1; c++) { vec4 cv = cutAt(c); d = max(d, dot(q, cv.xyz) - cv.w); }
  return d;
}
`;

const VERT = `#version 300 es
void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }
`;

/**
 * THE FIRST PASS: each cell's list, as `cull` makes it, as a mask over the solids in `Field`'s order. ROUND 2: a solid's bound
 * worked out only where it can lower what is found (`uSkipUp`); and (`uLow`) the least `Field.at` can be in the cell, from
 * the solids kept, and whether a skin can be met there, said in the mask's last bit (left free: fewer than 512 solids).
 */
const CULL = `${HEAD}
uniform int uNC;
uniform float uRho;
uniform int uSkipUp;
uniform int uLow;
uniform float uNear;
layout(location = 0) out uvec4 o0;
layout(location = 1) out uvec4 o1;
layout(location = 2) out uvec4 o2;
layout(location = 3) out uvec4 o3;
const float M = ${MARGIN.toExponential()};
const float BIG = 1e30;
uvec4 OA; uvec4 OB; uvec4 OC; uvec4 OD;
void put(int w, uint bits) {
  int g = w >> 2;
  int c = w & 3;
  uvec4 add = uvec4(c == 0 ? bits : 0u, c == 1 ? bits : 0u, c == 2 ? bits : 0u, c == 3 ? bits : 0u);
  if (g == 0) OA |= add; else if (g == 1) OB |= add; else if (g == 2) OC |= add; else OD |= add;
}
void setBit(int r) { put(r >> 5, 1u << uint(r & 31)); }
float smin1(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
void main() {
  OA = uvec4(0u); OB = uvec4(0u); OC = uvec4(0u); OD = uvec4(0u);
  ivec2 pix = ivec2(gl_FragCoord.xy);
  int k = pix.y * uCW + pix.x;
  if (k < uNC) {
    int ix = k % uGN.x;
    int rr = k / uGN.x;
    int iy = rr % uGN.y;
    int iz = rr / uGN.y;
    float sx = uG0.x + (float(ix) + 0.5) * uGS.x;
    float sy = uG0.y + (float(iy) + 0.5) * uGS.x;
    float t = uG0.z + (float(iz) + 0.5) * uGS.y;
    vec3 c = uCX * sx + uCY * sy + uCZ * t;
    float rho = uRho;
    float capRun = BIG;
    float least = BIG;
    for (int mi = 0; mi < uNM; mi++) {
      ivec4 mr = matOf(mi);
      if (mr.x == mr.y) continue;
      float capB = capRun;
      // the whole material passed over: no solid of it nearer than what can be found before it, by its blend
      bool drop = capB < BIG;
      for (int r = mr.x; r < mr.y && drop; r++) {
        vec4 h0 = uH0[r];
        if (!(length(c - h0.xyz) - rho > capB + h0.w + M)) drop = false;
      }
      float uRun = BIG;
      float witness = BIG;
      int kept = 0;
      bool hasU = false;
      float U = 0.0;
      for (int r = mr.x; r < mr.y; r++) {
        vec4 h0 = uH0[r];
        vec4 h1 = uH1[r];
        float dc = length(c - h0.xyz);
        bool keep = !drop && !(dc - rho > uRun + h0.w + M);
        if (keep) { setBit(r); kept++; }
        // (its least, for the cell's least: only while no material before has made it a cell where a skin can be met)
        bool wantLow = keep && uLow != 0 && least > uNear;
        // (its bound is no less than its ball's own clause: where that is no less than what is found so far, it lowers nothing)
        bool wantUp = uSkipUp == 0 || dc + rho - h0.w < uRun;
        if (!wantLow && !wantUp) continue;
        vec4 h3 = sol(r, 3);
        float up = 0.0;
        float lo = 0.0;
        if ((int(h1.x) & 7) == 1) {
          vec4 C = sol(r, 4); vec4 U0 = sol(r, 5); vec4 U1 = sol(r, 6); vec4 U2 = sol(r, 7);
          vec3 v = c - C.xyz;
          vec3 p0 = vec3(dot(v, U0.xyz) / U0.w, dot(v, U1.xyz) / U1.w, dot(v, U2.xyz) / U2.w);
          float kc = length(p0);
          if (wantUp) {
            // a ball: never more than how far the point is from its middle along its own lines, nor than its most half-length
            // times how far out of it the point is, less one
            float k0 = kc * (1.0 + 1e-5) + h3.x * rho / h3.y;
            up = min(h3.x * (dc + rho), max(0.0, h3.z * (k0 - 1.0)));
            int c1 = int(h1.w);
            for (int cc = int(h1.z); cc < c1; cc++) { vec4 cv = cutAt(cc); up = max(up, dot(c, cv.xyz) - cv.w + length(cv.xyz) * rho); }
          }
          if (wantLow) {
            // out of it, no less than how far out less one times its least half-length; in it, what is left to one times its most
            float k0 = max(0.0, kc * (1.0 - 1e-5) - h3.x * rho / h3.y);
            lo = k0 >= 1.0 ? (k0 - 1.0) * h3.y : -(1.0 - k0) * h3.z;
          }
        } else {
          float dd = distOf(r, c, h1);
          up = dd + h3.x * rho;
          lo = dd - h3.x * rho;
        }
        if (wantUp) {
          vec4 h2 = sol(r, 2);
          up = max(up, dc + rho - h2.x - h1.y) + M * (1.0 + abs(up));
          uRun = min(uRun, up);
          witness = min(witness, up);
        }
        if (wantLow) {
          lo -= M * (1.0 + abs(lo));
          U = hasU ? smin1(U, lo, h1.y) : lo;
          hasU = true;
        }
      }
      bool carved = false;
      for (int r = mr.y; r < mr.z; r++) {
        vec4 h0 = uH0[r];
        if (!(length(c - h0.xyz) - rho > h0.w + M)) {
          carved = true;
          if (!drop && kept > 0) setBit(r);
        }
      }
      if (hasU) least = min(least, U);
      capRun = carved ? capB : min(capB, witness);
    }
    // a skin can be met in the cell: said in the last bit, which no solid has
    if (uLow != 0 && !(least - M * (1.0 + abs(least)) > uNear)) OD.w |= 0x80000000u;
  }
  o0 = OA; o1 = OB; o2 = OC; o3 = OD;
}
`;

/** ROUND 2: for each column of cells (across, down), which of its cells (from the far end) a skin can be met in, as bits. */
const COLS = `${HEAD}
uniform usampler2D uM3;
uniform int uNCol;
layout(location = 0) out uvec4 o0;
void main() {
  ivec2 pix = ivec2(gl_FragCoord.xy);
  int col = pix.y * uCW + pix.x;
  uvec4 b = uvec4(0u);
  if (col < uNCol) {
    int per = uGN.x * uGN.y;
    for (int iz = 0; iz < uGN.z; iz++) {
      int k = iz * per + col;
      uvec4 m = texelFetch(uM3, ivec2(k % uCW, k / uCW), 0);
      if ((m.w & 0x80000000u) != 0u) {
        uint bit = 1u << uint(iz & 31);
        int w = iz >> 5;
        if (w == 0) b.x |= bit; else if (w == 1) b.y |= bit; else if (w == 2) b.z |= bit; else b.w |= bit;
      }
    }
  }
  o0 = b;
}
`;

/** THE MARCH: each pixel's ray, as `draw`'s, over its cells' lists; what it met, how the skin faces, its creases, whose. */
const MARCH = `${HEAD}
uniform usampler2D uM0;
uniform usampler2D uM1;
uniform usampler2D uM2;
uniform usampler2D uM3;
uniform vec3 uR0;
uniform vec3 uR1;
uniform vec3 uR2;
uniform vec2 uA;
uniform ivec2 uO;
uniform float uNear;
uniform float uFar;
uniform float uL2;
uniform float uE;
uniform int uNW;
// (ROUND 2: which cells of each column a skin can be met in; a ray that passes none not marched; the last bit of a list freed)
uniform usampler2D uCol;
uniform int uSkipRays;
uniform int uHop;
uniform int uSteal;
layout(location = 0) out uvec4 o0;
layout(location = 1) out uvec4 o1;
uvec4 MA; uvec4 MB; uvec4 MC; uvec4 MD;
uvec4 HA; uvec4 HB; uvec4 HC; uvec4 HD;
float AT_D;
int AT_M;
float smin1(float a, float b, float k) {
  if (k <= 0.0) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
int cellAt(vec3 s) {
  ivec3 i = ivec3(floor((s - uG0) / vec3(uGS.x, uGS.x, uGS.y)));
  if (any(lessThan(i, ivec3(0))) || any(greaterThanEqual(i, uGN))) return -1;
  return (i.z * uGN.y + i.y) * uGN.x + i.x;
}
uint mword(int w) {
  int g = w >> 2;
  return pick(g == 0 ? MA : (g == 1 ? MB : (g == 2 ? MC : MD)), w & 3);
}
uvec4 fullOf(int g) {
  uvec4 v;
  for (int c = 0; c < 4; c++) {
    int w = (g << 2) | c;
    int full = uN >> 5;
    uint b = w < full ? 0xffffffffu : (w == full ? ((1u << uint(uN & 31)) - 1u) : 0u);
    if (c == 0) v.x = b; else if (c == 1) v.y = b; else if (c == 2) v.z = b; else v.w = b;
  }
  return v;
}
void loadMask(int k) {
  if (k < 0) { MA = fullOf(0); MB = fullOf(1); MC = fullOf(2); MD = fullOf(3); return; }
  ivec2 p = ivec2(k % uCW, k / uCW);
  MA = texelFetch(uM0, p, 0);
  MB = uN > 128 ? texelFetch(uM1, p, 0) : uvec4(0u);
  MC = uN > 256 ? texelFetch(uM2, p, 0) : uvec4(0u);
  MD = uN > 384 ? texelFetch(uM3, p, 0) : uvec4(0u);
  if (uSteal != 0) MD.w &= 0x7fffffffu;
}
// Field.at over the list in MA..MD: the nearest skin and whose
void atq(vec3 q) {
  float d = 0.0;
  bool dInf = true;
  int m = -1;
  int next = 0;
  int cur = -1;
  int curC = 0;
  int curE = 0;
  bool has = false;
  float dm = 0.0;
  for (int w = 0; w < uNW; w++) {
    {
      uint bits = mword(w);
      int wb = w << 5;
      while (bits != 0u) {
        int r = wb | lsb(bits);
        bits &= bits - 1u;
        if (r >= curE) {
          if (cur >= 0) {
            float val = has ? dm : (dInf ? 1e6 : d + 1.0);
            if (dInf || val < d) { d = val; m = cur; dInf = false; }
          }
          int mi = int(sol(r, 2).z);
          // (a material before it with nothing in the list: Field finds nothing of it, and with nothing found takes 1e6)
          if (dInf && mi > next) { d = 1e6; m = next; dInf = false; }
          ivec4 mr = matOf(mi);
          cur = mi; curC = mr.y; curE = mr.z; has = false; next = mi + 1;
        }
        vec4 h0 = uH0[r];
        vec3 e = q - h0.xyz;
        float ee = dot(e, e);
        if (r < curC) {
          if (has || !dInf) {
            float far = (has ? (dInf ? dm : min(dm, d)) : d) + h0.w;
            if (far < 0.0 || ee > far * far) continue;
          }
          vec4 h1 = uH1[r];
          float dj = distOf(r, q, h1);
          dm = has ? smin1(dm, dj, h1.y) : dj;
          has = true;
        } else {
          if (!has || ee > h0.w * h0.w) continue;
          vec4 h1 = uH1[r];
          float cv = -distOf(r, q, h1);
          float k = h1.y;
          if (k <= 0.0) dm = max(dm, cv);
          else { float h = max(k - abs(dm - cv), 0.0) / k; dm = max(dm, cv) + h * h * k * 0.25; }
        }
      }
    }
  }
  if (cur >= 0) {
    float val = has ? dm : (dInf ? 1e6 : d + 1.0);
    if (dInf || val < d) { d = val; m = cur; dInf = false; }
  }
  if (dInf) { d = 1e6; m = next; }
  AT_D = d;
  AT_M = m;
}
uint hword(int w) {
  int g = w >> 2;
  return pick(g == 0 ? HA : (g == 1 ? HB : (g == 2 ? HC : HD)), w & 3);
}
uint trim(uint bits, int w, int a, int b) {
  int lo = a - (w << 5);
  int hi = b - (w << 5);
  if (lo > 0) bits &= ~((1u << uint(lo)) - 1u);
  if (hi < 32) bits &= (1u << uint(hi)) - 1u;
  return bits;
}
// Field.ofMat with no cap, over the material's own solids in the cell met (HA..HD)
float ofMat(ivec4 mr, vec3 q) {
  bool has = false;
  float dm = 0.0;
  for (int w = mr.x >> 5; w <= (mr.z - 1) >> 5; w++) {
    uint bits = trim(hword(w), w, mr.x, mr.z);
    while (bits != 0u) {
      int r = (w << 5) | lsb(bits);
      bits &= bits - 1u;
      vec4 h0 = uH0[r];
      vec3 e = q - h0.xyz;
      float ee = dot(e, e);
      if (r < mr.y) {
        if (has) {
          float far = dm + h0.w;
          if (far < 0.0 || ee > far * far) continue;
        }
        vec4 h1 = uH1[r];
        float dj = distOf(r, q, h1);
        dm = has ? smin1(dm, dj, h1.y) : dj;
        has = true;
      } else {
        if (!has || ee > h0.w * h0.w) continue;
        vec4 h1 = uH1[r];
        float cv = -distOf(r, q, h1);
        float k = h1.y;
        if (k <= 0.0) dm = max(dm, cv);
        else { float h = max(k - abs(dm - cv), 0.0) / k; dm = max(dm, cv) + h * h * k * 0.25; }
      }
    }
  }
  return has ? dm : 1e6;
}
// Field.nearest: the solid of the material nearest the point
int nearestOf(ivec4 mr, vec3 q) {
  bool hb = false;
  float best = 0.0;
  int p = mr.x;
  for (int w = mr.x >> 5; w <= (mr.y - 1) >> 5; w++) {
    uint bits = trim(hword(w), w, mr.x, mr.y);
    while (bits != 0u) {
      int r = (w << 5) | lsb(bits);
      bits &= bits - 1u;
      vec4 h0 = uH0[r];
      vec4 h2 = sol(r, 2);
      float lb = length(q - h0.xyz) - h2.x;
      if (hb && lb > best) continue;
      float dd = distOf(r, q, uH1[r]);
      if (!hb || dd < best) { best = dd; p = r; hb = true; }
    }
  }
  return int(sol(p, 2).y);
}
void main() {
  ivec2 pix = ivec2(gl_FragCoord.xy);
  float sx = float(uO.x + pix.x) + 0.5 - uA.x;
  float sy = float(uO.y + pix.y) + 0.5 - uA.y;
  vec3 base = uCX * sx + uCY * sy;
  float t = uNear;
  bool hit = false;
  vec3 q = base;
  int m = -1;
  int cell = -2;
  uvec4 nearC = uvec4(0xffffffffu);
  if (uSkipRays != 0 || uHop != 0) {
    ivec2 cc = ivec2(floor((vec2(sx, sy) - uG0.xy) / uGS.x));
    if (all(greaterThanEqual(cc, ivec2(0))) && all(lessThan(cc, uGN.xy))) {
      int col = cc.y * uGN.x + cc.x;
      nearC = texelFetch(uCol, ivec2(col % uCW, col / uCW), 0);
    }
  }
  // (a ray that passes no cell in which a skin can be met: nothing to march)
  if (uSkipRays != 0 && nearC == uvec4(0u)) { o0 = uvec4(0u); o1 = uvec4(0u); return; }
  int i = 0;
  int hops = 0;
  for (int it = 0; it < 416; it++) {
    if (i >= 160 || !(t > uFar)) break;
    if (uHop != 0 && hops < 256) {
      // (NOT KEPT: a cell in which no skin can be met passed over, the march going on past it)
      int iz = int(floor((t - uG0.z) / uGS.y));
      if (iz >= 0 && iz < uGN.z && (pick(nearC, iz >> 5) & (1u << uint(iz & 31))) == 0u) {
        t = uG0.z + float(iz) * uGS.y - 1e-3 * uGS.y;
        hops++;
        continue;
      }
    }
    q = base + uCZ * t;
    int k = cellAt(vec3(sx, sy, t));
    if (k != cell) { loadMask(k); cell = k; }
    atq(q);
    i++;
    if (AT_D < 0.02) { hit = true; m = AT_M; break; }
    t -= max(0.02, (AT_D * 0.8) / uL2);
  }
  if (!hit) { o0 = uvec4(0u); o1 = uvec4(0u); return; }
  HA = MA; HB = MB; HC = MC; HD = MD;
  ivec4 mr = matOf(m);
  // the way the skin faces: six sums of the material met, a little way each side (one place in the code, asked six times)
  float s0 = 0.0; float s1 = 0.0; float s2 = 0.0; float s3 = 0.0; float s4 = 0.0; float s5 = 0.0;
  for (int j = 0; j < 6; j++) {
    float sg = (j & 1) == 0 ? uE : -uE;
    int ax = j >> 1;
    float v = ofMat(mr, q + vec3(ax == 0 ? sg : 0.0, ax == 1 ? sg : 0.0, ax == 2 ? sg : 0.0));
    if (j == 0) s0 = v; else if (j == 1) s1 = v; else if (j == 2) s2 = v; else if (j == 3) s3 = v; else if (j == 4) s4 = v; else s5 = v;
  }
  float nx = s0 - s1;
  float ny = s2 - s3;
  float nz = s4 - s5;
  float nn = length(vec3(nx, ny, nz));
  if (!(nn > 0.0)) nn = 1.0;
  vec3 n = vec3(nx, ny, nz) / nn;
  int pi = nearestOf(mr, q);
  // its creases: how hemmed in it is a little way out, twice (asked as the march asks)
  float oo = 0.0;
  for (int j = 0; j < 2; j++) {
    float out_ = j == 0 ? 1.2 : 2.6;
    vec3 a = q + n * out_;
    loadMask(cellAt(vec3(dot(uR0, a), dot(uR1, a), dot(uR2, a))));
    atq(a);
    oo += AT_D / out_;
  }
  float open = clamp(oo / 2.0, 0.0, 1.0);
  o0 = uvec4(floatBitsToUint(t), floatBitsToUint(n.x), floatBitsToUint(n.y), floatBitsToUint(n.z));
  o1 = uvec4(floatBitsToUint(open), uint(m), uint(pi), 1u);
}
`;

interface Chip {
  gl: WebGL2RenderingContext;
  cull: WebGLProgram;
  cols: WebGLProgram;
  march: WebGLProgram;
  cu: Map<string, WebGLUniformLocation | null>;
  ku: Map<string, WebGLUniformLocation | null>;
  mu: Map<string, WebGLUniformLocation | null>;
  sol: WebGLTexture;
  cut: WebGLTexture;
  mat: WebGLTexture;
  /** (ROUND 2: the textures' sizes as made, so a frame's table is sent into them, not a new texture each frame) */
  solRows: number;
  cutRows: number;
  matMade: boolean;
  mask: WebGLTexture[];
  maskFb: WebGLFramebuffer;
  maskSize: [number, number];
  col: WebGLTexture;
  colFb: WebGLFramebuffer;
  colSize: [number, number];
  out: WebGLTexture[];
  outFb: WebGLFramebuffer;
  outSize: [number, number];
  vao: WebGLVertexArrayObject;
  heads: WebGLBuffer[];
  most: number;
  lost: boolean;
  /** EXT_disjoint_timer_query_webgl2, where the browser has it (the chip's own time for each pass). */
  timer: { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number } | null;
  /** Why it is not worth using, as found when it was made ('' : it is), for the checks that use it all the same. */
  slow: string;
}
/** The chip, once made (null: there is none, or it failed, and the CPU marches from then on). */
let CHIP: Chip | null = null;
let TRIED = false;

/** The chip failed: say why, and never ask it again here. */
function giveUp(why: string): void {
  GPU_SCULPT_TEST.why = why;
  if (CHIP) {
    CHIP.lost = true;
    try {
      CHIP.gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      /* (gone already) */
    }
  }
  CHIP = null;
  TRIED = true;
}

function compile(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const sh = (type: number, src: string): WebGLShader => {
    const s = gl.createShader(type);
    if (!s) throw new Error('no shader');
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(s) ?? '?'}`);
    return s;
  };
  const p = gl.createProgram();
  if (!p) throw new Error('no program');
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`link: ${gl.getProgramInfoLog(p) ?? '?'}`);
  return p;
}

function newTex(gl: WebGL2RenderingContext): WebGLTexture {
  const t = gl.createTexture();
  if (!t) throw new Error('no texture');
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

/** Targets of unsigned 32-bit numbers, `n` of them, `w` by `h`, on a framebuffer of their own. */
function targets(gl: WebGL2RenderingContext, fb: WebGLFramebuffer, texs: WebGLTexture[], w: number, h: number): void {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  texs.forEach((t, i) => {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, w, h, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0);
  });
  gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete');
}

/**
 * A WebGL2 context for the chip: on a canvas that needs no page where there is one (a worker has nothing else), else on the
 * page's own (Safari 16 has canvases that need no page, but no WebGL2 on them).
 */
function contextForChip(): { cv: EventTarget; gl: WebGL2RenderingContext } | null {
  const opts = { antialias: false, depth: false, stencil: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' } as const;
  const tries: (() => unknown)[] = [];
  if (typeof OffscreenCanvas !== 'undefined') tries.push(() => new OffscreenCanvas(1, 1));
  const doc = (globalThis as { document?: { createElement?: (n: string) => unknown } }).document;
  if (doc && typeof doc.createElement === 'function') tries.push(() => (doc.createElement as (n: string) => unknown)('canvas'));
  for (const make of tries) {
    try {
      const cv = make() as { getContext?: (k: string, o: unknown) => unknown } & EventTarget;
      const gl = cv && typeof cv.getContext === 'function' ? (cv.getContext('webgl2', opts) as WebGL2RenderingContext | null) : null;
      if (gl) return { cv, gl };
    } catch {
      /* (the next) */
    }
  }
  return null;
}

/** What the chip is called, as the browser tells it (for the test page). */
export function chipName(): string {
  const c = chip();
  if (!c) return '';
  try {
    const dbg = c.gl.getExtension('WEBGL_debug_renderer_info');
    return String(c.gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : c.gl.RENDERER));
  } catch {
    return '';
  }
}

/** The chip, made the first time it is asked for (and proved on a small figure); null where there is none. */
function chip(): Chip | null {
  if (CHIP && !CHIP.lost && !CHIP.gl.isContextLost()) return CHIP;
  if (CHIP) giveUp('the context was lost');
  if (TRIED) return null;
  TRIED = true;
  try {
    const made = contextForChip();
    if (!made) {
      GPU_SCULPT_TEST.why = 'no WebGL2';
      return null;
    }
    const { cv, gl } = made;
    cv.addEventListener?.('webglcontextlost', () => giveUp('the context was lost'));
    if ((gl.getParameter(gl.MAX_DRAW_BUFFERS) as number) < 4 || (gl.getParameter(gl.MAX_COLOR_ATTACHMENTS) as number) < 4) throw new Error('fewer than four targets');
    const cull = compile(gl, VERT, CULL);
    const cols = compile(gl, VERT, COLS);
    const march = compile(gl, VERT, MARCH);
    const names = (p: WebGLProgram, ns: string[]): Map<string, WebGLUniformLocation | null> => new Map(ns.map((n) => [n, gl.getUniformLocation(p, n)]));
    const common = ['uSol', 'uCut', 'uN', 'uNM', 'uMatT', 'uCX', 'uCY', 'uCZ', 'uG0', 'uGS', 'uGN', 'uCW'];
    // the two blocks of heads, bound once to both programs
    for (const p of [cull, cols, march]) {
      gl.uniformBlockBinding(p, gl.getUniformBlockIndex(p, 'Head0'), 0);
      gl.uniformBlockBinding(p, gl.getUniformBlockIndex(p, 'Head1'), 1);
    }
    const heads = [gl.createBuffer(), gl.createBuffer()];
    if (!heads[0] || !heads[1]) throw new Error('no buffers');
    heads.forEach((b, i) => {
      gl.bindBuffer(gl.UNIFORM_BUFFER, b);
      gl.bufferData(gl.UNIFORM_BUFFER, MOST * 16, gl.DYNAMIC_DRAW);
      gl.bindBufferBase(gl.UNIFORM_BUFFER, i, b);
    });
    const vao = gl.createVertexArray();
    const maskFb = gl.createFramebuffer();
    const outFb = gl.createFramebuffer();
    const colFb = gl.createFramebuffer();
    if (!vao || !maskFb || !outFb || !colFb) throw new Error('no buffers');
    let timer: Chip['timer'] = null;
    try {
      timer = gl.getExtension('EXT_disjoint_timer_query_webgl2') as Chip['timer'];
    } catch {
      timer = null;
    }
    const c: Chip = {
      gl,
      cull,
      cols,
      march,
      cu: names(cull, [...common, 'uNC', 'uRho', 'uSkipUp', 'uLow', 'uNear']),
      ku: names(cols, [...common, 'uM3', 'uNCol']),
      mu: names(march, [...common, 'uM0', 'uM1', 'uM2', 'uM3', 'uNW', 'uR0', 'uR1', 'uR2', 'uA', 'uO', 'uNear', 'uFar', 'uL2', 'uE', 'uCol', 'uSkipRays', 'uHop', 'uSteal']),
      sol: newTex(gl),
      cut: newTex(gl),
      mat: newTex(gl),
      solRows: 0,
      cutRows: 0,
      matMade: false,
      mask: [newTex(gl), newTex(gl), newTex(gl), newTex(gl)],
      maskFb,
      maskSize: [0, 0],
      col: newTex(gl),
      colFb,
      colSize: [0, 0],
      out: [newTex(gl), newTex(gl)],
      outFb,
      outSize: [0, 0],
      vao,
      heads: heads as WebGLBuffer[],
      most: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
      lost: false,
      timer,
      slow: '',
    };
    CHIP = c;
    // (proved on a small figure against the same march in the CPU's numbers, before it is trusted with any)
    const why = selfTest();
    if (why) {
      giveUp(why);
      return null;
    }
    // (and only a chip that is faster than the CPU: a software one, or a weak one, would paint his frames slower)
    const slow = slowness(c);
    c.slow = slow;
    if (slow && !GPU_SCULPT_TEST.allowSlow) {
      giveUp(slow);
      return null;
    }
    return CHIP;
  } catch (e) {
    giveUp(String((e as Error)?.message ?? e));
    return null;
  }
}

/** Rows of the solids' table, for the most solids a figure may have. */
const SOL_ROWS = (MOST * 16) / TEX_W;
/** (ROUND 2: what is sent to the chip each frame, and read back, kept from frame to frame where `GPU_ROUND2.keep`) */
const KEPT = {
  sol: new Float32Array(TEX_W * SOL_ROWS * 4),
  cut: new Float32Array(TEX_W * 4),
  mats: new Int32Array(MOST_MATS * 4),
  heads: [new Float32Array(MOST * 4), new Float32Array(MOST * 4)],
  o0: new Uint32Array(0),
  o1: new Uint32Array(0),
};

/** The solids in `Field`'s order, packed for the chip: their table, their cuts, each material's place in the order. */
function pack(S: Solids): { sol: Float32Array; cut: Float32Array; mats: Int32Array; n: number; solH: number; cutH: number; heads: Float32Array[]; order: number[] } {
  const keep = GPU_ROUND2.keep;
  const order: number[] = [];
  const mats = keep ? KEPT.mats : new Int32Array(MOST_MATS * 4);
  for (let m = 0; m < S.nm; m++) {
    mats[m * 4] = order.length;
    if (S.prims[m].length) {
      for (const j of S.prims[m]) order.push(j);
      mats[m * 4 + 1] = order.length;
      for (const j of S.carves[m]) order.push(j);
    } else mats[m * 4 + 1] = order.length;
    mats[m * 4 + 2] = order.length;
  }
  const n = order.length;
  const solH = Math.max(1, Math.ceil((n * 16) / TEX_W));
  const sol = keep ? KEPT.sol : new Float32Array(TEX_W * solH * 4);
  const g = S.g;
  for (let r = 0; r < n; r++) {
    const j = order[r];
    const o = r * 64;
    const go = j * GS;
    // (each number as the round before laid it, one by one: the same 32-bit numbers)
    sol[o] = S.bc[j * 3];
    sol[o + 1] = S.bc[j * 3 + 1];
    sol[o + 2] = S.bc[j * 3 + 2];
    sol[o + 3] = S.carve[j] ? S.farC[j] : S.blend[j] + S.br[j];
    sol[o + 4] = S.kind[j] + (S.carve[j] ? 8 : 0);
    sol[o + 5] = S.blend[j];
    sol[o + 6] = S.cut0[j];
    sol[o + 7] = S.cut1[j];
    sol[o + 8] = S.br[j];
    sol[o + 9] = j;
    sol[o + 10] = S.mat[j];
    sol[o + 11] = 0;
    sol[o + 12] = S.lip[j];
    sol[o + 13] = S.uMin[j];
    sol[o + 14] = S.uMax[j];
    sol[o + 15] = 0;
    const k = S.kind[j];
    if (k === KC) {
      sol[o + 16] = g[go];
      sol[o + 17] = g[go + 1];
      sol[o + 18] = g[go + 2];
      sol[o + 19] = g[go + 6];
      sol[o + 20] = g[go + 3];
      sol[o + 21] = g[go + 4];
      sol[o + 22] = g[go + 5];
      sol[o + 23] = g[go + 7];
      sol[o + 24] = g[go + 8];
      sol[o + 25] = 0;
      sol[o + 26] = 0;
      sol[o + 27] = 0;
    } else if (k === KT) {
      // (ten texels: a, b, c, b - a, c - b, a - c, the flat's way, and the three edges' ways, each with one more number)
      const more = [30, 31, 32, 33, 34, -1, -1, -1, -1, -1];
      for (let t = 0; t < 10; t++) {
        sol[o + 16 + t * 4] = g[go + t * 3];
        sol[o + 17 + t * 4] = g[go + t * 3 + 1];
        sol[o + 18 + t * 4] = g[go + t * 3 + 2];
        sol[o + 19 + t * 4] = more[t] >= 0 ? g[go + more[t]] : 0;
      }
    } else {
      sol[o + 16] = g[go];
      sol[o + 17] = g[go + 1];
      sol[o + 18] = g[go + 2];
      sol[o + 19] = g[go + 15];
      for (let a = 0; a < 3; a++) {
        sol[o + 20 + a * 4] = g[go + 3 + a * 3];
        sol[o + 21 + a * 4] = g[go + 4 + a * 3];
        sol[o + 22 + a * 4] = g[go + 5 + a * 3];
        sol[o + 23 + a * 4] = g[go + 12 + a];
      }
    }
  }
  const heads = keep ? KEPT.heads : [new Float32Array(MOST * 4), new Float32Array(MOST * 4)];
  for (let r = 0; r < n; r++) {
    for (let q = 0; q < 4; q++) {
      heads[0][r * 4 + q] = sol[r * 64 + q];
      heads[1][r * 4 + q] = sol[r * 64 + 4 + q];
    }
  }
  const nc = S.cutv.length / 4;
  const cutH = Math.max(1, Math.ceil(nc / TEX_W));
  if (keep && KEPT.cut.length < TEX_W * cutH * 4) KEPT.cut = new Float32Array(TEX_W * cutH * 4 * 2);
  const cut = keep ? KEPT.cut : new Float32Array(TEX_W * cutH * 4);
  cut.set(S.cutv);
  return { sol, cut, mats, n, solH, cutH, heads, order };
}

/** What a frame on the chip cost and was (for the checks and the test page). */
export const CHIP_SEEN = {
  /** Thousandths of a second: making the table, sending it, the first pass, the columns, the march, the readback, checking the numbers, shading. */
  ms: { pack: 0, upload: 0, cull: 0, cols: 0, march: 0, read: 0, check: 0, shade: 0, all: 0 },
  /** Draws, readbacks and their bytes; the box marched; cells; solids. */
  draws: 0,
  reads: 0,
  readBytes: 0,
  box: [0, 0] as [number, number],
  cells: 0,
  cols: 0,
  solids: 0,
  /** The same, added up over every figure marched since `chipSeenReset` (a frame may have more than one). */
  sum: { pack: 0, upload: 0, cull: 0, cols: 0, march: 0, read: 0, check: 0, shade: 0, all: 0 },
  figures: 0,
};
/** Start counting a frame's draws, readbacks and times afresh (`CHIP_SEEN`). */
export function chipSeenReset(): void {
  CHIP_SEEN.draws = 0;
  CHIP_SEEN.reads = 0;
  CHIP_SEEN.readBytes = 0;
  CHIP_SEEN.figures = 0;
  for (const k of Object.keys(CHIP_SEEN.sum) as (keyof typeof CHIP_SEEN.sum)[]) CHIP_SEEN.sum[k] = 0;
}
/** Timer queries asked for and not yet read: each pass's. */
let PENDING: { cull: WebGLQuery | null; cols: WebGLQuery | null; march: WebGLQuery | null }[] = [];
/** The chip's own pass times of frames gone by, as they come in (call after the page has had a moment); null where it cannot say. */
export function chipTimes(): { cull: number; cols: number; march: number }[] | null {
  const c = CHIP;
  if (!c || !c.timer) return null;
  const gl = c.gl;
  const out: { cull: number; cols: number; march: number }[] = [];
  const left: typeof PENDING = [];
  const disjoint = gl.getParameter(c.timer.GPU_DISJOINT_EXT) as boolean;
  for (const p of PENDING) {
    const qs = [p.cull, p.cols, p.march];
    if (qs.some((q) => q && !gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE))) {
      left.push(p);
      continue;
    }
    const v = qs.map((q) => (q ? (gl.getQueryParameter(q, gl.QUERY_RESULT) as number) / 1e6 : 0));
    for (const q of qs) if (q) gl.deleteQuery(q);
    if (!disjoint) out.push({ cull: v[0], cols: v[1], march: v[2] });
  }
  PENDING = left;
  return out;
}

/** THE MARCH ON THE CHIP: what `marchFast` does, handing `shade` the same numbers; false if the chip could not (nothing painted). */
export function gpuMarch(f: FieldLike, st: Seen, ax: number, ay: number, box: MarchBox, CX: V3, CY: V3, CZ: V3, L2: number, E: number, shade: Shade): boolean {
  const c = chip();
  if (!c) return false;
  const T = CHIP_SEEN.ms;
  const t0 = performance.now();
  const S = solidsOf(f);
  if (!soundOf(S) || S.n > MOST || S.nm > MOST_MATS || !S.n) return false;
  const P = pack(S);
  const rows = rowsOf(st);
  const lay = layoutOf(rows, CX, CY, CZ, box, ax, ay, E);
  const nCells = lay.nx * lay.ny * lay.nz;
  const nCols = lay.nx * lay.ny;
  const cw = CELLS_W;
  const ch = Math.ceil(nCells / cw);
  const kh = Math.ceil(nCols / cw);
  const bw = box.xe - box.xs + 1;
  const bh = box.ye - box.ys + 1;
  if (bw <= 0 || bh <= 0) return true;
  if (ch > c.most || bw > c.most || bh > c.most || P.solH > c.most || P.cutH > c.most) return false;
  // (ROUND 2: which cells a skin can be met in, where the chip can say it: a column no deeper than its words, a bit free)
  const hop = hopsFor(P.n);
  const low = (GPU_ROUND2.raySkip || hop) && lay.nz <= MOST_DEEP && P.n < MOST;
  const { gl } = c;
  const profile = GPU_SCULPT_TEST.profile;
  const timing = !!c.timer && GPU_SCULPT_TEST.timer;
  const sync = (): void => {
    // (for the split only: wait for the chip to finish what it was given)
    gl.readPixels(0, 0, 1, 1, gl.RGBA_INTEGER, gl.UNSIGNED_INT, new Uint32Array(4));
  };
  const q: { cull: WebGLQuery | null; cols: WebGLQuery | null; march: WebGLQuery | null } = { cull: null, cols: null, march: null };
  const begin = (k: keyof typeof q): void => {
    if (!timing || !c.timer) return;
    q[k] = gl.createQuery();
    if (q[k]) gl.beginQuery(c.timer.TIME_ELAPSED_EXT, q[k] as WebGLQuery);
  };
  const end = (k: keyof typeof q): void => {
    if (timing && c.timer && q[k]) gl.endQuery(c.timer.TIME_ELAPSED_EXT);
  };
  let o0: Uint32Array;
  let o1: Uint32Array;
  CHIP_SEEN.box = [bw, bh];
  CHIP_SEEN.cells = nCells;
  CHIP_SEEN.cols = nCols;
  CHIP_SEEN.solids = P.n;
  const tPack = performance.now();
  T.pack = tPack - t0;
  T.cull = T.cols = T.march = 0;
  try {
    gl.bindVertexArray(c.vao);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    // the solids, their cuts, the materials' places
    const up = (unit: number, t: WebGLTexture | null): void => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
    };
    if (GPU_ROUND2.keep) {
      // (made once at their most, then each frame's numbers sent into them)
      up(0, c.sol);
      if (c.solRows !== SOL_ROWS) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX_W, SOL_ROWS, 0, gl.RGBA, gl.FLOAT, null);
        c.solRows = SOL_ROWS;
      }
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TEX_W, P.solH, gl.RGBA, gl.FLOAT, P.sol, 0);
      up(1, c.cut);
      if (c.cutRows < P.cutH) {
        c.cutRows = Math.max(P.cutH, 2 * c.cutRows, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX_W, c.cutRows, 0, gl.RGBA, gl.FLOAT, null);
      }
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, TEX_W, P.cutH, gl.RGBA, gl.FLOAT, P.cut, 0);
      up(2, c.mat);
      if (!c.matMade) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32I, MOST_MATS, 1, 0, gl.RGBA_INTEGER, gl.INT, null);
        c.matMade = true;
      }
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MOST_MATS, 1, gl.RGBA_INTEGER, gl.INT, P.mats, 0);
      for (let k = 0; k < 2; k++) {
        gl.bindBuffer(gl.UNIFORM_BUFFER, c.heads[k]);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, P.heads[k], 0, P.n * 4);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, k, c.heads[k]);
      }
    } else {
      up(0, c.sol);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX_W, P.solH, 0, gl.RGBA, gl.FLOAT, P.sol);
      c.solRows = 0;
      up(1, c.cut);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX_W, P.cutH, 0, gl.RGBA, gl.FLOAT, P.cut);
      c.cutRows = 0;
      up(2, c.mat);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32I, MOST_MATS, 1, 0, gl.RGBA_INTEGER, gl.INT, P.mats);
      c.matMade = false;
      for (let k = 0; k < 2; k++) {
        gl.bindBuffer(gl.UNIFORM_BUFFER, c.heads[k]);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, P.heads[k]);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, k, c.heads[k]);
      }
    }
    const t1 = performance.now();
    T.upload = t1 - tPack;
    // THE FIRST PASS: every cell's list
    if (c.maskSize[0] !== cw || c.maskSize[1] < ch) {
      gl.activeTexture(gl.TEXTURE10);
      targets(gl, c.maskFb, c.mask, cw, Math.max(ch, c.maskSize[1]));
      c.maskSize = [cw, Math.max(ch, c.maskSize[1])];
    }
    const common = (u: Map<string, WebGLUniformLocation | null>): void => {
      gl.uniform1i(u.get('uSol') ?? null, 0);
      gl.uniform1i(u.get('uCut') ?? null, 1);
      gl.uniform1i(u.get('uN') ?? null, P.n);
      gl.uniform1i(u.get('uNM') ?? null, S.nm);
      gl.uniform1i(u.get('uMatT') ?? null, 2);
      gl.uniform3f(u.get('uCX') ?? null, CX[0], CX[1], CX[2]);
      gl.uniform3f(u.get('uCY') ?? null, CY[0], CY[1], CY[2]);
      gl.uniform3f(u.get('uCZ') ?? null, CZ[0], CZ[1], CZ[2]);
      gl.uniform3f(u.get('uG0') ?? null, lay.sx0, lay.sy0, lay.t0);
      gl.uniform2f(u.get('uGS') ?? null, lay.ts, lay.dt);
      gl.uniform3i(u.get('uGN') ?? null, lay.nx, lay.ny, lay.nz);
      gl.uniform1i(u.get('uCW') ?? null, cw);
    };
    // (no texture the pass paints into is bound to be read meanwhile)
    for (let i = 3; i < 8; i++) up(i, null);
    gl.useProgram(c.cull);
    common(c.cu);
    gl.uniform1i(c.cu.get('uNC') ?? null, nCells);
    gl.uniform1f(c.cu.get('uRho') ?? null, lay.rho);
    gl.uniform1i(c.cu.get('uSkipUp') ?? null, GPU_ROUND2.cullSkip ? 1 : 0);
    gl.uniform1i(c.cu.get('uLow') ?? null, low ? 1 : 0);
    gl.uniform1f(c.cu.get('uNear') ?? null, NEAR);
    gl.bindFramebuffer(gl.FRAMEBUFFER, c.maskFb);
    gl.viewport(0, 0, cw, ch);
    gl.disable(gl.SCISSOR_TEST);
    GPU_SCULPT_TEST.log?.(`cull ${cw}x${ch} cells ${nCells} solids ${P.n} mats ${S.nm} box ${bw}x${bh}`);
    begin('cull');
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    end('cull');
    CHIP_SEEN.draws++;
    if (profile) {
      gl.readBuffer(gl.COLOR_ATTACHMENT0);
      sync();
      T.cull = performance.now() - t1;
      GPU_SCULPT_TEST.ms.lists = T.cull;
      GPU_SCULPT_TEST.log?.(`cull done ${T.cull.toFixed(0)} ms`);
    }
    if (GPU_SCULPT_TEST.masks) {
      // (for the checks: every cell's mask, read back)
      const all: Uint32Array[] = [];
      for (let k = 0; k < 4; k++) {
        gl.readBuffer(gl.COLOR_ATTACHMENT0 + k);
        const m = new Uint32Array(cw * ch * 4);
        gl.readPixels(0, 0, cw, ch, gl.RGBA_INTEGER, gl.UNSIGNED_INT, m);
        // (the last bit, where it says whether a skin can be met in the cell, is no solid)
        if (k === 3 && low) for (let i = 3; i < m.length; i += 4) m[i] &= 0x7fffffff;
        all.push(m);
      }
      GPU_SCULPT_TEST.maskData = { all, order: P.order, nCells };
    }
    // ROUND 2, THE COLUMNS: for each, which of its cells a skin can be met in
    const tc = performance.now();
    if (low) {
      if (c.colSize[0] !== cw || c.colSize[1] < kh) {
        gl.activeTexture(gl.TEXTURE10);
        targets(gl, c.colFb, [c.col], cw, Math.max(kh, c.colSize[1]));
        c.colSize = [cw, Math.max(kh, c.colSize[1])];
      }
      up(7, null);
      up(6, c.mask[3]);
      gl.useProgram(c.cols);
      common(c.ku);
      gl.uniform1i(c.ku.get('uM3') ?? null, 6);
      gl.uniform1i(c.ku.get('uNCol') ?? null, nCols);
      gl.bindFramebuffer(gl.FRAMEBUFFER, c.colFb);
      gl.viewport(0, 0, cw, kh);
      begin('cols');
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      end('cols');
      CHIP_SEEN.draws++;
      if (profile) {
        gl.readBuffer(gl.COLOR_ATTACHMENT0);
        sync();
        T.cols = performance.now() - tc;
      }
    }
    // THE MARCH
    const tm = performance.now();
    if (c.outSize[0] < bw || c.outSize[1] < bh) {
      gl.activeTexture(gl.TEXTURE10);
      const w = Math.max(bw, c.outSize[0]);
      const h = Math.max(bh, c.outSize[1]);
      targets(gl, c.outFb, c.out, w, h);
      c.outSize = [w, h];
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, c.outFb);
    gl.useProgram(c.march);
    const u = c.mu;
    common(u);
    for (let i = 0; i < 4; i++) up(3 + i, c.mask[i]);
    up(7, low ? c.col : null);
    gl.uniform1i(u.get('uM0') ?? null, 3);
    gl.uniform1i(u.get('uM1') ?? null, 4);
    gl.uniform1i(u.get('uM2') ?? null, 5);
    gl.uniform1i(u.get('uM3') ?? null, 6);
    gl.uniform1i(u.get('uCol') ?? null, 7);
    gl.uniform1i(u.get('uSkipRays') ?? null, low && GPU_ROUND2.raySkip ? 1 : 0);
    gl.uniform1i(u.get('uHop') ?? null, low && hop ? 1 : 0);
    gl.uniform1i(u.get('uSteal') ?? null, low ? 1 : 0);
    gl.uniform1i(u.get('uNW') ?? null, Math.ceil(P.n / 32));
    gl.uniform3f(u.get('uR0') ?? null, rows[0][0], rows[0][1], rows[0][2]);
    gl.uniform3f(u.get('uR1') ?? null, rows[1][0], rows[1][1], rows[1][2]);
    gl.uniform3f(u.get('uR2') ?? null, rows[2][0], rows[2][1], rows[2][2]);
    gl.uniform2f(u.get('uA') ?? null, ax, ay);
    gl.uniform2i(u.get('uO') ?? null, box.xs, box.ys);
    gl.uniform1f(u.get('uNear') ?? null, box.zNear);
    gl.uniform1f(u.get('uFar') ?? null, box.zFar);
    gl.uniform1f(u.get('uL2') ?? null, L2);
    gl.uniform1f(u.get('uE') ?? null, E);
    gl.viewport(0, 0, bw, bh);
    gl.enable(gl.SCISSOR_TEST);
    begin('march');
    const flushEach = !GPU_ROUND2.oneGo || !!c.slow;
    for (let y = 0; y < bh; y += BAND) {
      gl.scissor(0, y, bw, Math.min(BAND, bh - y));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      CHIP_SEEN.draws++;
      if (flushEach) gl.flush();
    }
    end('march');
    gl.disable(gl.SCISSOR_TEST);
    if (timing) PENDING.push(q);
    if (profile) {
      gl.readBuffer(gl.COLOR_ATTACHMENT0);
      sync();
      T.march = performance.now() - tm;
    }
    GPU_SCULPT_TEST.log?.('march drawn');
    const tr = performance.now();
    if (GPU_ROUND2.keep) {
      if (KEPT.o0.length < bw * bh * 4) {
        KEPT.o0 = new Uint32Array(bw * bh * 4);
        KEPT.o1 = new Uint32Array(bw * bh * 4);
      }
      o0 = KEPT.o0;
      o1 = KEPT.o1;
    } else {
      o0 = new Uint32Array(bw * bh * 4);
      o1 = new Uint32Array(bw * bh * 4);
    }
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    gl.readPixels(0, 0, bw, bh, gl.RGBA_INTEGER, gl.UNSIGNED_INT, o0);
    gl.readBuffer(gl.COLOR_ATTACHMENT1);
    gl.readPixels(0, 0, bw, bh, gl.RGBA_INTEGER, gl.UNSIGNED_INT, o1);
    CHIP_SEEN.reads += 2;
    CHIP_SEEN.readBytes += 2 * bw * bh * 16;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const err = gl.getError();
    if (err !== gl.NO_ERROR) throw new Error(`WebGL error ${err}`);
    if (gl.isContextLost()) throw new Error('the context was lost');
    GPU_SCULPT_TEST.log?.('read back');
    T.read = performance.now() - tr;
    GPU_SCULPT_TEST.ms.upload = t1 - t0;
    GPU_SCULPT_TEST.ms.march = performance.now() - t1;
  } catch (e) {
    giveUp(String((e as Error)?.message ?? e));
    return false;
  }
  // (nothing is painted until every pixel's numbers are seen to be sound)
  const tk = performance.now();
  const f0 = new Float32Array(o0.buffer, 0, bw * bh * 4);
  const f1 = new Float32Array(o1.buffer, 0, bw * bh * 4);
  for (let k = 0; k < bw * bh; k++) {
    const i = k * 4;
    if (o1[i + 3] === 0) continue;
    if (o1[i + 3] !== 1 || o1[i + 1] >= S.nm || o1[i + 2] >= S.n || !Number.isFinite(f0[i]) || !Number.isFinite(f0[i + 1]) || !Number.isFinite(f0[i + 2]) || !Number.isFinite(f0[i + 3]) || !Number.isFinite(f1[i])) {
      giveUp('the chip gave numbers that are not sound');
      return false;
    }
  }
  const t2 = performance.now();
  T.check = t2 - tk;
  for (let r = 0; r < bh; r++) {
    for (let col = 0; col < bw; col++) {
      const i = (r * bw + col) * 4;
      if (o1[i + 3] !== 1) continue;
      const x = box.xs + col;
      const y = box.ys + r;
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      const t = f0[i];
      const b0 = CX[0] * sx + CY[0] * sy;
      const b1 = CX[1] * sx + CY[1] * sy;
      const b2 = CX[2] * sx + CY[2] * sy;
      shade(x, y, t, [b0 + CZ[0] * t, b1 + CZ[1] * t, b2 + CZ[2] * t], [f0[i + 1], f0[i + 2], f0[i + 3]], o1[i + 1], f1[i], o1[i + 2]);
    }
  }
  T.shade = performance.now() - t2;
  T.all = performance.now() - t0;
  for (const k of Object.keys(T) as (keyof typeof T)[]) CHIP_SEEN.sum[k] += T[k];
  CHIP_SEEN.figures++;
  GPU_SCULPT_TEST.ms.shade = T.shade;
  GPU_SCULPT_TEST.marched++;
  return true;
}

/**
 * A SMALL FIGURE, MARCHED ON THE CHIP AND IN THE CPU'S NUMBERS: a ball, a rod melted into it, a block cut and carved, a
 * sheet; the chip is trusted only if it meets them where the CPU does (a pixel or two at an edge allowed) and nearly as
 * near. Returns why not, or ''.
 */
function selfTest(): string {
  const { f, st, box, CX, CYn, CZ } = smallFigure();
  const got = new Map<number, number[]>();
  const want = new Map<number, number[]>();
  const into = (to: Map<number, number[]>): Shade => (x, y, t, _q, n, m, open, prim) => to.set(y * 100 + x, [t, n[0], n[1], n[2], m, open, prim]);
  listMarch(f, st, 40, 54, box, CX, CYn, CZ, 0.5, 0.18, into(want));
  if (!gpuMarch(f, st, 40, 54, box, CX, CYn, CZ, 0.5, 0.18, into(got))) return GPU_SCULPT_TEST.why || 'the small figure could not be marched';
  GPU_SCULPT_TEST.marched--;
  let off = 0;
  for (const [k, w] of want) {
    const g = got.get(k);
    if (!g) {
      off++;
      continue;
    }
    if (Math.abs(g[0] - w[0]) > 0.05 || g[4] !== w[4] || Math.abs(g[1] * w[1] + g[2] * w[2] + g[3] * w[3]) < 0.98) off++;
  }
  for (const k of got.keys()) if (!want.has(k)) off++;
  if (want.size < 400) return `the small figure was not met (${want.size})`;
  if (off > want.size * 0.03) return `the chip met the small figure otherwise (${off} of ${want.size} pixels)`;
  return '';
}

/** The small figure the chip is proved on, and how it is seen. */
export function smallFigure(): { f: FieldLike; st: Seen; box: MarchBox; CX: V3; CYn: V3; CZ: V3 } {
  const I: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const ready = (p: Prim, bc: V3, br: number, more: Partial<ReadyLike> = {}): ReadyLike => ({ p, bc, br, ...more });
  const ball = ready({ k: 'ell', mat: 0, piece: 'a', blend: 1.4, c: [0, 0, 10], axes: [[6, 0, 0], [0, 5, 0], [0, 0, 8]] }, [0, 0, 10], 8, { ua: I, ul: [6, 5, 8] });
  const rod = ready({ k: 'cone', mat: 0, piece: 'b', blend: 1.4, a: [0, 0, 10], b: [9, 2, 16], ra: 2.5, rb: 1.5 }, [4.5, 1, 13], Math.hypot(9, 2, 6) / 2 + 2.5, { ba: [9, 2, 6], bb: 81 + 4 + 36 });
  const blk = ready({ k: 'box', mat: 1, piece: 'c', blend: 1, c: [-6, 2, 4], axes: [[4, 0, 0], [0, 3, 0], [0, 0, 4]], round: 1, cuts: [{ n: [0, 0, 1], o: 6 }] }, [-6, 2, 4], Math.hypot(4, 3, 4) + 0.01, { ua: I, ul: [4, 3, 4] });
  const hole = ready({ k: 'ell', mat: 1, piece: 'c', blend: 0.6, carve: true, c: [-6, -1, 4], axes: [[1.5, 0, 0], [0, 1.5, 0], [0, 0, 1.5]] }, [-6, -1, 4], 1.5, { ua: I, ul: [1.5, 1.5, 1.5] });
  const sheet = ready({ k: 'tri', mat: 1, piece: 'd', blend: 0.6, a: [4, -4, 2], b: [10, -3, 4], c: [6, -6, 12], thick: 0.4 }, [20 / 3, -13 / 3, 6], 6.5);
  // (and a string of beads round it: more solids than one word of a list holds, its top bit among them)
  const beads: ReadyLike[] = [];
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 1.6 - 0.3;
    const c: V3 = [11 * Math.cos(a), 11 * Math.sin(a), 3 + 0.35 * k];
    beads.push(ready({ k: 'ell', mat: 0, piece: 'e', blend: 0.8, c, axes: [[1.3, 0, 0], [0, 1.3, 0], [0, 0, 1.3]] }, c, 1.3, { ua: I, ul: [1.3, 1.3, 1.3] }));
  }
  const f: FieldLike = { rs: [ball, rod, ...beads, blk, hole, sheet], byMat: [[ball, rod, ...beads], [blk, sheet]], carves: [[], [hole]] };
  const s = Math.SQRT1_2;
  const CX: V3 = [s, s, 0];
  const CY: V3 = [0.3 * s, -0.3 * s, -0.95];
  const CZ = ((): V3 => {
    const z = cross(CX, CY);
    const l = Math.hypot(z[0], z[1], z[2]);
    return [z[0] / l, z[1] / l, z[2] / l];
  })();
  const CYn = cross(CZ, CX);
  // (two pixels to a length)
  const st: Seen = { seen: (v) => [2 * dot(CX, v), 2 * dot(CYn, v), 2 * dot(CZ, v)] };
  const half = (v: V3): V3 => [v[0] / 2, v[1] / 2, v[2] / 2];
  const box: MarchBox = { xs: 0, xe: 79, ys: 0, ye: 79, zNear: 60, zFar: -60 };
  return { f, st, box, CX: half(CX), CYn: half(CYn), CZ: half(CZ) };
}

/** Why the chip is not worth using (a software stand-in, or slower than the CPU on the small figure, warm), or ''. */
function slowness(c: Chip): string {
  let name = '';
  try {
    const dbg = c.gl.getExtension('WEBGL_debug_renderer_info');
    name = String(c.gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : c.gl.RENDERER));
  } catch {
    /* (no name) */
  }
  GPU_SCULPT_TEST.seen.name = name;
  const { f, st, box, CX, CYn, CZ } = smallFigure();
  const none: Shade = () => {};
  const t0 = performance.now();
  const ok = gpuMarch(f, st, 40, 54, box, CX, CYn, CZ, 0.5, 0.18, none);
  const t1 = performance.now();
  listMarch(f, st, 40, 54, box, CX, CYn, CZ, 0.5, 0.18, none);
  const t2 = performance.now();
  if (ok) GPU_SCULPT_TEST.marched--;
  GPU_SCULPT_TEST.seen.chipMs = t1 - t0;
  GPU_SCULPT_TEST.seen.cpuMs = t2 - t1;
  if (/swiftshader|llvmpipe|softpipe|lavapipe|software|basic render/i.test(name)) return `a software stand-in for a graphics chip (${name})`;
  if (!ok) return GPU_SCULPT_TEST.why || 'the small figure could not be marched again';
  if (t1 - t0 > 1.5 * (t2 - t1) + 2) return `slower than the CPU here (the small figure ${(t1 - t0).toFixed(0)} ms on it, ${(t2 - t1).toFixed(0)} ms here)`;
  return '';
}

/** What `draw` asks when the switch is on: the march done on the chip (or, for the checks, its twin), or false: march here. */
export function sculptOnChip(f: FieldLike, st: Seen, ax: number, ay: number, box: MarchBox, CX: V3, CY: V3, CZ: V3, L2: number, E: number, shade: Shade): boolean {
  if (GPU_SCULPT_TEST.mode === 'count') {
    GRID_SEEN.most = Math.max(GRID_SEEN.most, f.rs.length);
    GRID_SEEN.mats = Math.max(GRID_SEEN.mats, f.byMat.length);
    return false;
  }
  if (GPU_SCULPT_TEST.mode === 'emulate') return listMarch(f, st, ax, ay, box, CX, CY, CZ, L2, E, shade);
  if (GPU_SCULPT_TEST.mode === 'compare') {
    // (for the checks: the chip's numbers held against its twin's, pixel by pixel)
    const want = new Map<number, number[]>();
    const got = new Map<number, number[]>();
    const into = (to: Map<number, number[]>): Shade => (x, y, t, _q, n, m, open, prim) => to.set(y * 10000 + x, [t, n[0], n[1], n[2], m, open, prim]);
    listMarch(f, st, ax, ay, box, CX, CY, CZ, L2, E, into(want));
    if (!gpuMarch(f, st, ax, ay, box, CX, CY, CZ, L2, E, into(got))) return false;
    const c = { want: want.size, got: got.size, onlyCpu: 0, onlyChip: 0, mat: 0, prim: 0, t: 0, n: 0, open: 0, ex: [] as unknown[] };
    for (const [k, w] of want) {
      const g = got.get(k);
      if (!g) {
        c.onlyCpu++;
        continue;
      }
      let bad = '';
      if (g[4] !== w[4]) (c.mat++, (bad += 'm'));
      if (g[6] !== w[6]) (c.prim++, (bad += 'p'));
      if (Math.abs(g[0] - w[0]) > 0.01) (c.t++, (bad += 't'));
      if (g[1] * w[1] + g[2] * w[2] + g[3] * w[3] < 0.999) (c.n++, (bad += 'n'));
      if (Math.abs(g[5] - w[5]) > 0.02) (c.open++, (bad += 'o'));
      if (bad && c.ex.length < 8) c.ex.push([k % 10000, Math.floor(k / 10000), bad, w.map((v) => +v.toFixed(4)), g.map((v) => +v.toFixed(4))]);
    }
    for (const k of got.keys()) if (!want.has(k)) c.onlyChip++;
    GPU_SCULPT_TEST.log?.(JSON.stringify(c));
    const md = GPU_SCULPT_TEST.maskData;
    if (md) {
      // every cell's list on the chip, held against the twin's
      const S = solidsOf(f);
      const G = buildGrid(S, rowsOf(st), CX, CY, CZ, box, ax, ay, E);
      const rank = new Map<number, number>();
      md.order.forEach((j, r) => rank.set(j, r));
      let cellsOff = 0;
      let extra = 0;
      let missing = 0;
      const ex: unknown[] = [];
      for (let k = 0; k < md.nCells; k++) {
        const want = new Set<number>();
        const s0 = G.cells[k * 2];
        for (let sg = s0; sg < s0 + G.cells[k * 2 + 1]; sg++) {
          const e0 = G.L.segs[sg * 4 + 1];
          for (let e = e0; e < e0 + G.L.segs[sg * 4 + 2] + G.L.segs[sg * 4 + 3]; e++) want.add(rank.get(G.L.ents[e]) as number);
        }
        const have = new Set<number>();
        for (let w = 0; w < 16; w++) {
          const word = md.all[w >> 2][k * 4 + (w & 3)];
          for (let b = 0; b < 32; b++) if (word & (1 << b)) have.add(w * 32 + b);
        }
        let off = false;
        for (const r of want) if (!have.has(r)) (missing++, (off = true), ex.length < 8 && ex.push(['missing', k, r, S.mat[md.order[r]]]));
        for (const r of have) if (!want.has(r)) (extra++, (off = true), ex.length < 8 && ex.push(['extra', k, r, S.mat[md.order[r]]]));
        if (off) cellsOff++;
      }
      GPU_SCULPT_TEST.log?.(JSON.stringify({ cells: md.nCells, cellsOff, missing, extra, ex }));
    }
    for (const [k, g] of got) {
      const x = k % 10000;
      const y = Math.floor(k / 10000);
      const sx = x + 0.5 - ax;
      const sy = y + 0.5 - ay;
      shade(x, y, g[0], [CX[0] * sx + CY[0] * sy + CZ[0] * g[0], CX[1] * sx + CY[1] * sy + CZ[1] * g[0], CX[2] * sx + CY[2] * sy + CZ[2] * g[0]], [g[1], g[2], g[3]], g[4], g[5], g[6]);
    }
    return true;
  }
  if (gpuMarch(f, st, ax, ay, box, CX, CY, CZ, L2, E, shade)) return true;
  GPU_SCULPT_TEST.fellBack++;
  return false;
}

/** Is the chip there to march on (made, and proved, the first time this is asked)? For a page that shows which way it paints. */
export function chipReady(): boolean {
  return !!chip();
}
