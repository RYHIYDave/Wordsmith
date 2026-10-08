// Low-poly shapes, made in code as everything in this game is: a Mesh is a heap of flat-coloured
// triangles, and the builders here make the few solids everything is put together from (a box, a
// prism, something turned on a lathe, a faceted ball, a flat shape given thickness).
//
// A triangle's corners go counter-clockwise seen from outside the solid. No normals are kept: the
// painter (gl.ts) lights every triangle by its own face, which is what makes low-poly look low-poly.

import { apply, cross, norm, sub } from './vec';
import type { M4, V3 } from './vec';

/** A colour in linear light, each part 0..1. */
export type RGB = readonly [number, number, number];

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** '#3a3480' as it is written everywhere else in the project. */
export function hex(c: string): RGB {
  const n = (i: number): number => toLinear(parseInt(c.slice(1 + i * 2, 3 + i * 2), 16) / 255);
  return [n(0), n(1), n(2)];
}

export const tone = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];
export const blend = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A number from 0 to 1 that is always the same for the same three whole numbers. */
export function rnd(a: number, b = 0, c = 0): number {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Numbers to a vertex: where it is, its colour, how much it shines by itself. */
export const STRIDE = 7;

export class Mesh {
  data: number[] = [];

  get triangles(): number {
    return this.data.length / (STRIDE * 3);
  }

  tri(a: V3, b: V3, c: V3, col: RGB, glow = 0): this {
    this.data.push(a[0], a[1], a[2], col[0], col[1], col[2], glow, b[0], b[1], b[2], col[0], col[1], col[2], glow, c[0], c[1], c[2], col[0], col[1], col[2], glow);
    return this;
  }

  /** Four corners in order round the face (counter-clockwise from outside). */
  quad(a: V3, b: V3, c: V3, d: V3, col: RGB, glow = 0): this {
    return this.tri(a, b, c, col, glow).tri(a, c, d, col, glow);
  }

  /** A flat face of any number of corners (it must bulge nowhere inward), in order round it. */
  face(pts: readonly V3[], col: RGB, glow = 0): this {
    for (let i = 1; i < pts.length - 1; i++) this.tri(pts[0], pts[i], pts[i + 1], col, glow);
    return this;
  }

  /** Seen from both sides (cloth, a wing, a leaf). */
  sheet(pts: readonly V3[], col: RGB, back: RGB = col, glow = 0): this {
    this.face(pts, col, glow);
    return this.face([...pts].reverse(), back, glow);
  }

  /**
   * For a solid that bulges nowhere inward: turn every triangle to face away from the point `c`
   * inside it. (So its faces can be written down in any order.)
   */
  outward(c: V3): this {
    const d = this.data;
    for (let t = 0; t < d.length; t += STRIDE * 3) {
      const a: V3 = [d[t], d[t + 1], d[t + 2]];
      const b: V3 = [d[t + STRIDE], d[t + STRIDE + 1], d[t + STRIDE + 2]];
      const e: V3 = [d[t + STRIDE * 2], d[t + STRIDE * 2 + 1], d[t + STRIDE * 2 + 2]];
      const n = cross(sub(b, a), sub(e, a));
      const mid: V3 = [(a[0] + b[0] + e[0]) / 3 - c[0], (a[1] + b[1] + e[1]) / 3 - c[1], (a[2] + b[2] + e[2]) / 3 - c[2]];
      if (n[0] * mid[0] + n[1] * mid[1] + n[2] * mid[2] >= 0) continue;
      for (let k = 0; k < STRIDE; k++) {
        const s = d[t + STRIDE + k];
        d[t + STRIDE + k] = d[t + STRIDE * 2 + k];
        d[t + STRIDE * 2 + k] = s;
      }
    }
    return this;
  }

  /** Another mesh, moved by `m`, and tinted. */
  add(o: Mesh, m?: M4, tint?: RGB): this {
    const d = o.data;
    for (let i = 0; i < d.length; i += STRIDE) {
      const p: V3 = m ? apply(m, [d[i], d[i + 1], d[i + 2]]) : [d[i], d[i + 1], d[i + 2]];
      if (tint) this.data.push(p[0], p[1], p[2], d[i + 3] * tint[0], d[i + 4] * tint[1], d[i + 5] * tint[2], d[i + 6]);
      else this.data.push(p[0], p[1], p[2], d[i + 3], d[i + 4], d[i + 5], d[i + 6]);
    }
    // (a mirror turns every triangle inside out: turn them back)
    if (m && det3(m) < 0) {
      const n = this.data.length;
      for (let t = n - o.data.length; t < n; t += STRIDE * 3) {
        for (let k = 0; k < STRIDE; k++) {
          const s = this.data[t + STRIDE + k];
          this.data[t + STRIDE + k] = this.data[t + STRIDE * 2 + k];
          this.data[t + STRIDE * 2 + k] = s;
        }
      }
    }
    return this;
  }
}

function det3(m: M4): number {
  return m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
}

/** How a solid is coloured: one colour, or one for each kind of face. */
export interface Paint {
  side: RGB;
  top?: RGB;
  bottom?: RGB;
  /** Each face a little lighter or darker than the next, by up to this share: the facets show even in flat light. */
  vary?: number;
  /** A number that settles which face gets which tone. */
  seed?: number;
  glow?: number;
}

const paintOf = (p: Paint | RGB): Paint => (Array.isArray(p) ? { side: p as RGB } : (p as Paint));
const varied = (c: RGB, p: Paint, i: number): RGB => (p.vary ? tone(c, 1 + (rnd(i, p.seed ?? 0, 7) - 0.5) * 2 * p.vary) : c);

/** A box from one corner to the opposite one. */
export function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, paint: Paint | RGB): Mesh {
  const p = paintOf(paint);
  const m = new Mesh();
  const g = p.glow ?? 0;
  m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], varied(p.top ?? p.side, p, 0), g);
  m.quad([x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0], varied(p.bottom ?? p.side, p, 1), g);
  m.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], varied(p.side, p, 2), g);
  m.quad([x1, y1, z0], [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], varied(p.side, p, 3), g);
  m.quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], varied(p.side, p, 4), g);
  m.quad([x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], varied(p.side, p, 5), g);
  return m;
}

/**
 * A stack of rings round the upright axis: each ring is [radius, height], or [radius x, radius y,
 * height] for one that is not round. `n` sides. Turned on a lathe: a pillar, an urn, a barrel, a
 * limb, a head. `turn`: degrees the first corner is turned from the x axis. The ends are closed.
 */
export function lathe(rings: ReadonlyArray<readonly number[]>, n: number, paint: Paint | RGB, turn = 0): Mesh {
  const p = paintOf(paint);
  const m = new Mesh();
  const g = p.glow ?? 0;
  const at = (ring: readonly number[], i: number): V3 => {
    const a = ((turn + (i * 360) / n) * Math.PI) / 180;
    const rx = ring[0];
    const ry = ring.length > 2 ? ring[1] : ring[0];
    return [Math.cos(a) * rx, Math.sin(a) * ry, ring[ring.length - 1]];
  };
  for (let k = 0; k < rings.length - 1; k++) {
    for (let i = 0; i < n; i++) {
      const a = at(rings[k], i);
      const b = at(rings[k], i + 1);
      const c = at(rings[k + 1], i + 1);
      const d = at(rings[k + 1], i);
      const col = varied(p.side, p, k * 31 + i);
      // (a ring of no width is a point: one triangle, not two)
      if (rings[k + 1][0] === 0) m.tri(a, b, c, col, g);
      else if (rings[k][0] === 0) m.tri(a, c, d, col, g);
      else m.quad(a, b, c, d, col, g);
    }
  }
  const first = rings[0];
  const last = rings[rings.length - 1];
  if (first[0] > 0) m.face(Array.from({ length: n }, (_, i) => at(first, n - i)), varied(p.bottom ?? p.side, p, 901), g);
  if (last[0] > 0) m.face(Array.from({ length: n }, (_, i) => at(last, i)), varied(p.top ?? p.side, p, 902), g);
  return m;
}

/** A faceted ball: twenty faces, or eighty (`fine`). `rx, ry, rz`: its half sizes. Its middle is at the origin. */
export function ball(rx: number, ry: number, rz: number, paint: Paint | RGB, fine = false): Mesh {
  const p = paintOf(paint);
  const m = new Mesh();
  const t = (1 + Math.sqrt(5)) / 2;
  const vs: V3[] = ([[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]] as V3[]).map(norm);
  const fs = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  let tris: V3[][] = fs.map((f) => [vs[f[0]], vs[f[1]], vs[f[2]]]);
  if (fine) {
    const out: V3[][] = [];
    for (const [a, b, c] of tris) {
      const ab = norm([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
      const bc = norm([(b[0] + c[0]) / 2, (b[1] + c[1]) / 2, (b[2] + c[2]) / 2]);
      const ca = norm([(c[0] + a[0]) / 2, (c[1] + a[1]) / 2, (c[2] + a[2]) / 2]);
      out.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    tris = out;
  }
  const s = (v: V3): V3 => [v[0] * rx, v[1] * ry, v[2] * rz];
  tris.forEach(([a, b, c], i) => {
    // (the solid's own winding, whichever way the table above happens to run)
    const out = cross(sub(b, a), sub(c, a));
    const facesOut = out[0] * a[0] + out[1] * a[1] + out[2] * a[2] > 0;
    const col = varied(a[2] + b[2] + c[2] > 1.8 && p.top ? p.top : p.side, p, i);
    if (facesOut) m.tri(s(a), s(b), s(c), col, p.glow ?? 0);
    else m.tri(s(a), s(c), s(b), col, p.glow ?? 0);
  });
  return m;
}

/**
 * A flat shape given thickness. `outline`: its corners in order (counter-clockwise), as [x, z]: it
 * stands upright in the x-z plane, `thick` deep along y, centred on y = 0. It must bulge nowhere
 * inward (make such a thing of two).
 */
export function slab(outline: ReadonlyArray<readonly [number, number]>, thick: number, paint: Paint | RGB): Mesh {
  const p = paintOf(paint);
  const m = new Mesh();
  const g = p.glow ?? 0;
  const h = thick / 2;
  // (whichever way round the corners were given, they are taken counter-clockwise)
  let area = 0;
  for (let i = 0; i < outline.length; i++) {
    const [x0, z0] = outline[i];
    const [x1, z1] = outline[(i + 1) % outline.length];
    area += x0 * z1 - x1 * z0;
  }
  if (area < 0) outline = [...outline].reverse();
  const front = outline.map(([x, z]): V3 => [x, -h, z]);
  const back = outline.map(([x, z]): V3 => [x, h, z]);
  m.face(front, varied(p.side, p, 0), g);
  m.face([...back].reverse(), varied(p.side, p, 1), g);
  for (let i = 0; i < outline.length; i++) {
    const j = (i + 1) % outline.length;
    m.quad(front[j], front[i], back[i], back[j], varied(p.top ?? p.side, p, 2 + i), g);
  }
  return m;
}
