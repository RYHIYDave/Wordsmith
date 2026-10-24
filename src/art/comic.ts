// THE OPENING'S COMIC (art/opening.ts): the tools its pages are painted with. As the start screen is painted (art/title_smith3.ts):
// in code, in the game's own crisp pixels, at the finer grain (two picture pixels to a game pixel), no smoothing and no blur.
// What makes it a comic book's: every shape inked round with a black line; flat bands of colour from one light, never a smooth
// ramp; the shadows' last band laid in dots (the printed comic's halftone); captions in boxes; pages with gutters.
// Real shapes (his art rulebook, How art is made and approved, rule 9): every outline is drawn as the thing it is, out of
// curves, never a plain ball, box or ring.

import { glyphRows, wrapText } from '../engine/font';
import { Px, mix, rgba } from '../engine/px';

export type Pt = readonly [number, number];
export type Tones = readonly string[];

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
export function sm(v: number): number {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
}
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** A number 0..1 for (x, y) and a seed: the same every time. */
export function hash(x: number, y: number, s = 0): number {
  let h = (Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 2246822519)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Smooth noise 0..1 at (x, y), `f` cells a unit. */
export function noise(x: number, y: number, s = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
/** Noise of a few octaves, 0..1. */
export function fbm(x: number, y: number, s = 0, oct = 3): number {
  let t = 0;
  let a = 0.5;
  let n = 0;
  let f = 1;
  for (let k = 0; k < oct; k++) {
    t += a * noise(x * f, y * f, s + k * 17);
    n += a;
    a *= 0.5;
    f *= 2;
  }
  return t / n;
}

// ---------------------------------------------------------------------------------------------
// CURVES: every outline is made of them

/** Points along a cubic curve from a to d (b and c pull it), `n` of them, a included, d not. */
export function cubic(a: Pt, b: Pt, c: Pt, d: Pt, n = 16): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ]);
  }
  return out;
}
/**
 * A closed outline through the points `k`, smooth (each corner rounded by the curve through its neighbours: a Catmull-Rom
 * loop), `n` points between each two; `sharp`: the indices of corners kept sharp.
 */
export function loop(k: readonly Pt[], n = 8, sharp: readonly number[] = []): Pt[] {
  const out: Pt[] = [];
  const L = k.length;
  for (let i = 0; i < L; i++) {
    const p0 = k[(i - 1 + L) % L];
    const p1 = k[i];
    const p2 = k[(i + 1) % L];
    const p3 = k[(i + 2) % L];
    const s1 = sharp.includes(i) ? 0 : 1;
    const s2 = sharp.includes((i + 1) % L) ? 0 : 1;
    const b: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * s1, p1[1] + ((p2[1] - p0[1]) / 6) * s1];
    const c: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * s2, p2[1] - ((p3[1] - p1[1]) / 6) * s2];
    out.push(...cubic(p1, b, c, p2, n));
  }
  return out;
}
/** An open line through the points `k`, smooth, `n` points between each two. */
export function path(k: readonly Pt[], n = 8): Pt[] {
  const out: Pt[] = [];
  const L = k.length;
  for (let i = 0; i < L - 1; i++) {
    const p0 = k[Math.max(0, i - 1)];
    const p1 = k[i];
    const p2 = k[i + 1];
    const p3 = k[Math.min(L - 1, i + 2)];
    const b: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    out.push(...cubic(p1, b, c, p2, n));
  }
  out.push(k[L - 1]);
  return out;
}
/** A band along a line `pts`, `w0` wide at its start to `w1` at its end (a stroke of a brush, a limb, a road). */
export function band(pts: readonly Pt[], w0: number, w1: number = w0): Pt[] {
  const left: Pt[] = [];
  const right: Pt[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const w = lerp(w0, w1, n > 1 ? i / (n - 1) : 0) / 2;
    left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  return [...left, ...right.reverse()];
}
/** Is (x, y) inside the polygon? */
export function inside(pts: readonly Pt[], x: number, y: number): boolean {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

// ---------------------------------------------------------------------------------------------
// LAYERS AND INK

/** Put `part` on `dst` at (ox, oy), an ink line `w` pixels round what of it shows (null: none). */
export function over(dst: Px, part: Px, line: string | null = INK, ox = 0, oy = 0, w = 1): void {
  const a = part.d;
  const b = dst.d;
  const W = part.w;
  const H = part.h;
  const ink = line ? rgba(line) : null;
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && a[(y * W + x) * 4 + 3] > 0;
  for (let y = -w; y < H + w; y++) {
    for (let x = -w; x < W + w; x++) {
      const tx = x + ox;
      const ty = y + oy;
      if (tx < 0 || ty < 0 || tx >= dst.w || ty >= dst.h) continue;
      const j = (ty * dst.w + tx) * 4;
      if (solid(x, y)) {
        const i = (y * W + x) * 4;
        b[j] = a[i];
        b[j + 1] = a[i + 1];
        b[j + 2] = a[i + 2];
        b[j + 3] = 255;
        continue;
      }
      if (!ink) continue;
      let near = false;
      for (let dy = -w; dy <= w && !near; dy++) for (let dx = -w; dx <= w && !near; dx++) if (Math.abs(dx) + Math.abs(dy) <= w && solid(x + dx, y + dy)) near = true;
      if (!near) continue;
      b[j] = ink[0];
      b[j + 1] = ink[1];
      b[j + 2] = ink[2];
      b[j + 3] = 255;
    }
  }
}

/** A new empty layer the size of `p`. */
export function layerOf(p: { w: number; h: number }): Px {
  return new Px(p.w, p.h);
}

/** The comic's ink: the darkest thing in it. */
export const INK = '#07060d';

/** The halftone: is (x, y) one of the dots of a screen `k` (0 none .. 1 all) dark? Dots on a slanted grid, growing with `k`. */
export function dot(x: number, y: number, k: number, cell = 4): boolean {
  if (k <= 0) return false;
  if (k >= 1) return true;
  // (the grid turned a little, as a printer's screen is)
  const u = (x + y * 0.5) / cell;
  const v = (y - x * 0.5) / cell;
  const fu = u - Math.floor(u) - 0.5;
  const fv = v - Math.floor(v) - 0.5;
  return Math.hypot(fu, fv) < Math.sqrt(k / Math.PI) * 1.05;
}

/**
 * Tone what is painted on `p` (only where `mask` says, or everywhere painted) in flat bands of `tones` (darkest first) by the
 * light `lit(x, y)` (0 dark .. 1 bright): each band flat, the darkest band's edge broken into halftone dots of the next.
 */
export function bands(p: Px, tones: Tones, lit: (x: number, y: number) => number, mask?: (x: number, y: number) => boolean, dots = true): void {
  const n = tones.length;
  p.each((x, y) => {
    if (mask && !mask(x, y)) return undefined;
    const v = clamp01(lit(x, y)) * n;
    let k = Math.min(n - 1, Math.floor(v));
    // (the bottom of each band dotted over the band below)
    const f = v - Math.floor(v);
    if (dots && k > 0 && f < 0.35 && dot(x, y, 1 - f / 0.35)) k--;
    return tones[k];
  });
}

/** Light falling off from a point: 1 at it, 0 at `r` and beyond (squared falloff, as the title's). */
export function glow(x: number, y: number, lx: number, ly: number, r: number): number {
  const d = Math.hypot(x - lx, y - ly) / r;
  return d >= 1 ? 0 : (1 - d) * (1 - d);
}

/** Paint the colour `c` over `p` where `fn` says, at strength `a` (0..1), blended. */
export function wash(p: Px, c: string, fn: (x: number, y: number) => number): void {
  const q = rgba(c);
  const d = p.d;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      if (d[i + 3] === 0) continue;
      const a = clamp01(fn(x, y));
      if (a <= 0) continue;
      d[i] = Math.round(d[i] + (q[0] - d[i]) * a);
      d[i + 1] = Math.round(d[i + 1] + (q[1] - d[i + 1]) * a);
      d[i + 2] = Math.round(d[i + 2] + (q[2] - d[i + 2]) * a);
    }
  }
}

/** A light's glow laid over `p` in a few flat rings of `c` (no smooth ramp: rings, as the comic draws a lamp's light). */
export function halo(p: Px, x: number, y: number, r: number, c: string, rings = 3, a = 0.5): void {
  wash(p, c, (px, py) => {
    const d = Math.hypot(px - x, py - y) / r;
    if (d >= 1) return 0;
    const k = Math.ceil((1 - d) * rings) / rings;
    return k * a;
  });
}

export { mix };

// ---------------------------------------------------------------------------------------------
// ROCK IN FACETS: as a comic cuts a cliff, in flat planes, each lit or not

/**
 * Rock cut in facets: every pixel of `p` painted so far (where `mask` says) belongs to the facet of the nearest of seeds on a
 * jittered grid (`cw` x `ch` cells: tall thin cells for a cliff), each facet a flat plane turned its own way (tilted on
 * average toward `tilt`); toned in the bands `tones` by how it faces the light `L` (x right, y down, z toward us), plus
 * `extra(x, y)`; the edges between facets inked where both sides are in the dark half (the cracks of a cliff).
 */
export function facets(
  p: Px,
  tones: Tones,
  L: readonly [number, number, number],
  o: { cw: number; ch: number; seed: number; tilt?: readonly [number, number]; spread?: number; mask?: (x: number, y: number) => boolean; extra?: (x: number, y: number) => number; cracks?: boolean },
): void {
  const ll = Math.hypot(L[0], L[1], L[2]);
  const lx = L[0] / ll;
  const ly = L[1] / ll;
  const lz = L[2] / ll;
  const sp = o.spread ?? 0.9;
  const tilt = o.tilt ?? [0, 0];
  const W = p.w;
  const H = p.h;
  const id = new Int32Array(W * H).fill(-1);
  const shade = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!p.has(x, y) || (o.mask && !o.mask(x, y))) continue;
      const gx = Math.floor(x / o.cw);
      const gy = Math.floor(y / o.ch);
      let best = Infinity;
      let bi = 0;
      let bx = 0;
      let by = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const cx = gx + i;
          const cy = gy + j;
          const sx = (cx + hash(cx, cy, o.seed)) * o.cw;
          const sy = (cy + hash(cx, cy, o.seed + 1)) * o.ch;
          const d = ((x - sx) / o.cw) ** 2 + ((y - sy) / o.ch) ** 2;
          if (d < best) {
            best = d;
            bi = cx * 73856093 + cy * 19349663;
            bx = cx;
            by = cy;
          }
        }
      }
      const nx = tilt[0] + (hash(bx, by, o.seed + 2) - 0.5) * 2 * sp;
      const ny = tilt[1] + (hash(bx, by, o.seed + 3) - 0.5) * 2 * sp;
      const nl = Math.hypot(nx, ny, 1);
      const lit = (nx * lx + ny * ly + lz) / nl;
      id[y * W + x] = bi;
      shade[y * W + x] = clamp01(lit * 0.5 + 0.5 + (o.extra ? o.extra(x, y) : 0));
    }
  }
  const n = tones.length;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (id[i] === -1) continue;
      const v = shade[i] * n;
      let k = Math.min(n - 1, Math.floor(v));
      const f = v - Math.floor(v);
      if (k > 0 && f < 0.3 && dot(x, y, 1 - f / 0.3, 3)) k--;
      let c = tones[k];
      if (o.cracks !== false && shade[i] < 0.5) {
        const r = x + 1 < W ? id[i + 1] : -1;
        const d = y + 1 < H ? id[i + W] : -1;
        if ((r !== -1 && r !== id[i] && shade[i + 1] < 0.5) || (d !== -1 && d !== id[i] && shade[i + W] < 0.5)) c = INK;
      }
      p.set(x, y, c);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// CAPTIONS: in a box, in the game's own lettering


/** A caption box at (x, y) (picture pixels), at most `maxW` game pixels of text wide: the paper's colour, inked round, the words in ink. Returns its height. */
export function caption(p: Px, text: string, x: number, y: number, maxW: number, paper = '#efe4c4', ink = INK): number {
  const lines = wrapText(text, maxW, 'normal');
  const pad = 4;
  const lh = 9 * 2;
  let w = 0;
  const widths = lines.map((ln) => {
    let lw = 0;
    for (const ch of ln) lw += glyphRows(ch).length ? glyphRows(ch)[0].length + 2 : 0;
    return lw - 2;
  });
  for (const lw of widths) w = Math.max(w, lw);
  const bw = w + pad * 2;
  const bh = lines.length * lh + pad * 2 - 2;
  p.rect(x - 2, y - 2, bw + 4, bh + 4, ink);
  p.rect(x, y, bw, bh, paper);
  lines.forEach((ln, k) => {
    let cx = x + pad;
    const cy = y + pad + k * lh;
    for (const ch of ln) {
      const rows = glyphRows(ch);
      for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[r].length; c++) if (rows[r].charCodeAt(c) === 35) p.set(cx + c, cy + r, ink);
      cx += (rows[0]?.length ?? 0) + 2;
    }
  });
  return bh;
}
