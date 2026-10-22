// Concept art, not part of the game: a small kit for painting the ten title-screen sketches
// (src/dev/title_options.ts). Nothing of the game imports it.
//
// A sketch is painted at TW x TH game pixels, about the shape of a phone held sideways, at half the
// size the chosen one would be painted at for the game. Colours are 0xRRGGBB numbers. There is no
// soft gradient anywhere: a change of colour across a surface is cut into flat bands, or dithered
// with a 4 x 4 ordered pattern where two bands meet (bay).

import { hash2 } from '../engine/rng';

export const TW = 256;
export const TH = 118;

export type C = number;
export type Pt = readonly [number, number];

/** '#rrggbb' to a colour. */
export const h = (s: string): C => parseInt(s.slice(1), 16);
const R = (c: C): number => (c >> 16) & 255;
const G = (c: C): number => (c >> 8) & 255;
const B = (c: C): number => c & 255;
const pack = (r: number, g: number, b: number): C =>
  (Math.max(0, Math.min(255, Math.round(r))) << 16) | (Math.max(0, Math.min(255, Math.round(g))) << 8) | Math.max(0, Math.min(255, Math.round(b)));

/** a to b by t (0 to 1). */
export const mix = (a: C, b: C, t: number): C => pack(R(a) + (R(b) - R(a)) * t, G(a) + (G(b) - G(a)) * t, B(a) + (B(b) - B(a)) * t);
/** A colour made darker (k < 1) or lighter (k > 1). */
export const scale = (c: C, k: number): C => pack(R(c) * k, G(c) * k, B(c) * k);

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
/** The 4 x 4 ordered pattern: a number in 0..1 for each pixel. */
export const bay = (x: number, y: number): number => BAYER4[((y & 3) << 2) | (x & 3)];

/** A random number in 0..1, the same every time for the same x, y and seed. */
export const rnd = (x: number, y: number, seed = 0): number => hash2(x, y, seed);

/** Smooth noise along a line: 0..1. */
export function noise1(x: number, seed = 0): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return rnd(i, 7, seed) * (1 - u) + rnd(i + 1, 7, seed) * u;
}
/** Smooth noise over a plane: 0..1. */
export function noise2(x: number, y: number, seed = 0): number {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = rnd(i, j, seed);
  const b = rnd(i + 1, j, seed);
  const c = rnd(i, j + 1, seed);
  const d = rnd(i + 1, j + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
/** A few octaves of noise2: 0..1. */
export function fbm(x: number, y: number, seed = 0, oct = 3): number {
  let s = 0;
  let a = 0.5;
  let n = 0;
  for (let o = 0; o < oct; o++) {
    s += noise2(x, y, seed + o * 31) * a;
    n += a;
    x *= 2;
    y *= 2;
    a *= 0.5;
  }
  return s / n;
}

/** A number cut into `n` flat steps (0..1 in, 0..1 out). */
export const band = (v: number, n: number): number => Math.max(0, Math.min(1, Math.ceil(v * n - 1e-9) / n));
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Little runes, 3 wide and 5 tall ('x' is lit): the wordsmith's letters, none of them a real letter. */
export const RUNES: readonly string[][] = [
  ['x.x', 'xx.', 'x..', 'xx.', 'x.x'],
  ['.x.', 'x.x', '.x.', '.x.', '.x.'],
  ['xx.', 'x.x', 'xx.', 'x..', 'x..'],
  ['x.x', '.x.', 'x.x', '.x.', 'x.x'],
  ['.x.', '.xx', '.x.', 'xx.', '.x.'],
  ['x..', 'xx.', 'x.x', 'xx.', 'x..'],
  ['xxx', '.x.', 'x.x', '.x.', 'xxx'],
  ['..x', '.x.', 'xxx', '.x.', 'x..'],
];

export class Pic {
  readonly w = TW;
  readonly h = TH;
  readonly d = new Int32Array(TW * TH);

  fill(c: C): void {
    this.d.fill(c);
  }
  set(x: number, y: number, c: C): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= TW || y >= TH) return;
    this.d[y * TW + x] = c;
  }
  get(x: number, y: number): C {
    x = Math.max(0, Math.min(TW - 1, Math.floor(x)));
    y = Math.max(0, Math.min(TH - 1, Math.floor(y)));
    return this.d[y * TW + x];
  }
  /** Lay c over what is there, a of it (0..1). */
  over(x: number, y: number, c: C, a: number): void {
    if (a <= 0) return;
    this.set(x, y, a >= 1 ? c : mix(this.get(x, y), c, a));
  }
  /** Light added to what is there: c times a. */
  add(x: number, y: number, c: C, a: number): void {
    if (a <= 0) return;
    const o = this.get(x, y);
    this.set(x, y, pack(R(o) + R(c) * a, G(o) + G(c) * a, B(o) + B(c) * a));
  }
  /** c where the pattern is under f: a dithered f of c. */
  dot(x: number, y: number, c: C, f: number): void {
    if (bay(x, y) < f) this.set(x, y, c);
  }
  rect(x0: number, y0: number, w: number, h: number, c: C, f = 1): void {
    for (let y = Math.floor(y0); y < Math.floor(y0 + h); y++) for (let x = Math.floor(x0); x < Math.floor(x0 + w); x++) f >= 1 ? this.set(x, y, c) : this.dot(x, y, c, f);
  }
  hline(x0: number, x1: number, y: number, c: C): void {
    for (let x = Math.floor(Math.min(x0, x1)); x <= Math.floor(Math.max(x0, x1)); x++) this.set(x, y, c);
  }
  vline(x: number, y0: number, y1: number, c: C): void {
    for (let y = Math.floor(Math.min(y0, y1)); y <= Math.floor(Math.max(y0, y1)); y++) this.set(x, y, c);
  }
  /** Rows y0..y1 run through `cols` top to bottom, dithered where one meets the next. */
  vgrad(y0: number, y1: number, cols: C[], x0 = 0, x1 = TW): void {
    for (let y = Math.floor(y0); y < Math.floor(y1); y++) {
      const s = ((y - y0) / Math.max(1, y1 - y0 - 1)) * (cols.length - 1);
      const i = Math.min(cols.length - 2, Math.floor(s));
      const f = s - i;
      for (let x = x0; x < x1; x++) this.set(x, y, bay(x, y) < f ? cols[i + 1] : cols[i]);
    }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: C, f = 1): void {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n);
      const y = Math.round(y0 + ((y1 - y0) * i) / n);
      f >= 1 ? this.set(x, y, c) : this.dot(x, y, c, f);
    }
  }
  /** A filled polygon (even-odd), c at f (dithered under 1). */
  poly(pts: readonly Pt[], c: C | ((x: number, y: number) => C | -1), f = 1): void {
    let y0 = Infinity;
    let y1 = -Infinity;
    for (const [, y] of pts) {
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(TH - 1, Math.ceil(y1)); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(TW, Math.round(xs[k + 1])); x++) {
          const col = typeof c === 'function' ? c(x, y) : c;
          if (col < 0) continue;
          f >= 1 ? this.set(x, y, col) : this.dot(x, y, col, f);
        }
      }
    }
  }
  /** A filled ellipse. c may be a function of the pixel and how far out it is (0 middle, 1 rim). */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: C | ((x: number, y: number, n: number) => C | -1), f = 1): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / Math.max(rx, 0.5), (y + 0.5 - cy) / Math.max(ry, 0.5));
        if (n > 1) continue;
        const col = typeof c === 'function' ? c(x, y, n) : c;
        if (col < 0) continue;
        f >= 1 ? this.set(x, y, col) : this.dot(x, y, col, f);
      }
    }
  }
  /** Light thrown round a point, in `bands` flat rings, added (as light is). */
  glow(cx: number, cy: number, rx: number, ry: number, c: C, a: number, bands = 4): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
        if (n >= 1) continue;
        this.add(x, y, c, a * band(1 - n, bands) * band(1 - n, bands));
      }
    }
  }
  /** The same, laid over rather than added (a haze, a shadow). */
  haze(cx: number, cy: number, rx: number, ry: number, c: C, a: number, bands = 4): void {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const n = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
        if (n >= 1) continue;
        this.over(x, y, c, a * band(1 - n, bands));
      }
    }
  }
  /** A little picture from rows of characters: '.' or ' ' is see-through, any other is looked up. */
  sprite(x0: number, y0: number, rows: readonly string[], key: Record<string, C>, flip = false): void {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[flip ? row.length - 1 - i : i];
        if (ch === '.' || ch === ' ') continue;
        const c = key[ch];
        if (c === undefined) continue;
        this.set(x0 + i, y0 + j, c);
      }
    });
  }
  /** A rune (RUNES[i]) at x, y in c. */
  rune(x: number, y: number, i: number, c: C, big = 1): void {
    const r = RUNES[((i % RUNES.length) + RUNES.length) % RUNES.length];
    r.forEach((row, j) => {
      for (let k = 0; k < 3; k++) if (row[k] === 'x') this.rect(x + k * big, y + j * big, big, big, c);
    });
  }
  /** Stars over rows y0..y1, where `ok` allows. */
  stars(y0: number, y1: number, seed: number, n: number, ok: (x: number, y: number) => boolean = () => true): void {
    for (let i = 0; i < n; i++) {
      const x = Math.floor(rnd(i, 1, seed) * TW);
      const y = Math.floor(y0 + rnd(i, 2, seed) * (y1 - y0));
      if (!ok(x, y)) continue;
      const k = rnd(i, 3, seed);
      if (k > 0.94) {
        this.add(x, y, 0xffffff, 0.9);
        this.add(x - 1, y, 0x8090c0, 0.4);
        this.add(x + 1, y, 0x8090c0, 0.4);
        this.add(x, y - 1, 0x8090c0, 0.4);
        this.add(x, y + 1, 0x8090c0, 0.4);
      } else this.add(x, y, k > 0.7 ? 0xc8d0ff : 0x7078b0, k > 0.7 ? 0.8 : 0.6);
    }
  }
  /** Onto a canvas, one canvas pixel to a game pixel. */
  canvas(): HTMLCanvasElement {
    const cv = document.createElement('canvas');
    cv.width = TW;
    cv.height = TH;
    const g = cv.getContext('2d') as CanvasRenderingContext2D;
    const im = g.createImageData(TW, TH);
    for (let i = 0; i < TW * TH; i++) {
      const c = this.d[i];
      im.data[i * 4] = R(c);
      im.data[i * 4 + 1] = G(c);
      im.data[i * 4 + 2] = B(c);
      im.data[i * 4 + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return cv;
  }
}

/** A ridge line: for each column, the row of the top of a hill or mountain. */
export function ridge(x: number, base: number, amp: number, freq: number, seed: number, sharp = 0): number {
  let v = noise1(x * freq, seed) * 0.65 + noise1(x * freq * 2.3, seed + 5) * 0.25 + noise1(x * freq * 5.1, seed + 9) * 0.1;
  if (sharp) v = 1 - Math.abs(v * 2 - 1) * sharp - (1 - sharp) * (1 - v);
  return base - v * amp;
}
