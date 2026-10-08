// A tiny pixel-art painter. Integer pixels only: no anti-aliasing, no gradients.
// All placeholder art in the game is drawn with this at start-up, so there are no image files.

import type { TailRoot } from './tails';

/** A light a picture gives off (a lit blade, a crystal): where, how far it reaches, its colour and strength. */
export interface Light {
  /** In game pixels, from the picture's top left corner. */
  x: number;
  y: number;
  /** Radius in game pixels. */
  r: number;
  color: string;
  /** 0..1; absent = 0.5. */
  a?: number;
}

/**
 * An image plus the pixel inside it that sits on the object's world position.
 *
 * Sizes and the anchor are in GAME pixels. Art at the finer grain packs `density` picture pixels
 * into each game pixel (so its `img` is `w * density` wide), and its anchor may fall on a half.
 * Draw sprites with `drawSprite`, which lays the picture down at its size in game pixels.
 */
export interface Sprite {
  img: HTMLCanvasElement;
  w: number;
  h: number;
  /** Anchor pixel. Actors/props: the ground point under the object. Tiles: top vertex of the ground diamond. */
  ax: number;
  ay: number;
  /** Picture pixels per game pixel. Absent = 1 (the art of the first builds). */
  density?: number;
  /** Lights the picture gives off, drawn over the darkness by the renderer. */
  lights?: ReadonlyArray<Light>;
  /** A pool of light behind the figure, drawn before it, that lifts it off a dark floor. */
  aura?: Light;
  /** Where the things that fly from the figure are fixed (a scarf, a feather). They are not in the picture: see tails.ts. */
  tails?: ReadonlyArray<TailRoot>;
}

/** '#rgb', '#rrggbb' or '#rrggbbaa'. null means "leave this pixel alone". */
export type Col = string | null;

type RGBA = readonly [number, number, number, number];
const parsed = new Map<string, RGBA>();

export function rgba(c: string): RGBA {
  let v = parsed.get(c);
  if (v) return v;
  let s = c.charAt(0) === '#' ? c.slice(1) : c;
  if (s.length === 3) s = s.charAt(0) + s.charAt(0) + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2);
  const n = parseInt(s.slice(0, 6), 16);
  const a = s.length >= 8 ? parseInt(s.slice(6, 8), 16) : 255;
  v = [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
  parsed.set(c, v);
  return v;
}

function hex2(n: number): string {
  return (n < 16 ? '0' : '') + n.toString(16);
}

/** Blend two colours: t = 0 gives a, t = 1 gives b. */
export function mix(a: string, b: string, t: number): string {
  const p = rgba(a);
  const q = rgba(b);
  const f = (i: number): string => hex2(Math.round(p[i] + (q[i] - p[i]) * t));
  return '#' + f(0) + f(1) + f(2);
}

export class Px {
  readonly w: number;
  readonly h: number;
  readonly d: Uint8ClampedArray;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }

  inside(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  /** Set one pixel. Out-of-bounds and null colours are ignored. */
  set(x: number, y: number, c: Col): this {
    x = Math.floor(x);
    y = Math.floor(y);
    if (c === null || !this.inside(x, y)) return this;
    const v = rgba(c);
    const i = (y * this.w + x) * 4;
    this.d[i] = v[0];
    this.d[i + 1] = v[1];
    this.d[i + 2] = v[2];
    this.d[i + 3] = v[3];
    return this;
  }

  erase(x: number, y: number): this {
    x = Math.floor(x);
    y = Math.floor(y);
    if (this.inside(x, y)) this.d[(y * this.w + x) * 4 + 3] = 0;
    return this;
  }

  /** True if the pixel is not transparent. */
  has(x: number, y: number): boolean {
    return this.inside(x, y) && this.d[(y * this.w + x) * 4 + 3] > 0;
  }

  /** Colour of a pixel as '#rrggbb', or null if transparent / out of bounds. */
  get(x: number, y: number): string | null {
    if (!this.has(x, y)) return null;
    const i = (y * this.w + x) * 4;
    return '#' + hex2(this.d[i]) + hex2(this.d[i + 1]) + hex2(this.d[i + 2]);
  }

  rect(x: number, y: number, w: number, h: number, c: Col): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }

  hline(x: number, y: number, len: number, c: Col): this {
    return this.rect(x, y, len, 1, c);
  }

  vline(x: number, y: number, len: number, c: Col): this {
    return this.rect(x, y, 1, len, c);
  }

  /** Bresenham line, inclusive of both ends. */
  line(x0: number, y0: number, x1: number, y1: number, c: Col): this {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const stepX = x0 < x1 ? 1 : -1;
    const stepY = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += stepX;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += stepY;
      }
    }
    return this;
  }

  /**
   * Filled ellipse. (cx, cy) is the centre in pixel-edge coordinates, so a 6x6 circle occupying
   * pixels 10..15 has centre 13 and radius 3.
   */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: Col): this {
    if (rx <= 0 || ry <= 0) return this;
    const x0 = Math.floor(cx - rx);
    const x1 = Math.ceil(cx + rx);
    const y0 = Math.floor(cy - ry);
    const y1 = Math.ceil(cy + ry);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
    }
    return this;
  }

  /** Filled polygon (any simple polygon), tested at pixel centres. Points are in pixel-edge coordinates. */
  poly(pts: ReadonlyArray<readonly [number, number]>, c: Col): this {
    if (pts.length < 3) return this;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }
    for (let y = Math.floor(minY); y < Math.ceil(maxY); y++) {
      const yc = y + 0.5;
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) {
          xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.set(x, y, c);
      }
    }
    return this;
  }

  /** Add a 1-pixel outline around everything drawn so far. Leave a 1 px margin in the canvas for it. */
  outline(c: string, corners = false): this {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.has(x, y)) continue;
        let near = this.has(x - 1, y) || this.has(x + 1, y) || this.has(x, y - 1) || this.has(x, y + 1);
        if (!near && corners) {
          near = this.has(x - 1, y - 1) || this.has(x + 1, y - 1) || this.has(x - 1, y + 1) || this.has(x + 1, y + 1);
        }
        if (near) add.push(x, y);
      }
    }
    for (let i = 0; i < add.length; i += 2) this.set(add[i], add[i + 1], c);
    return this;
  }

  /** Visit every opaque pixel; return a colour to repaint it, or undefined/null to keep it. */
  each(fn: (x: number, y: number, c: string) => Col | undefined): this {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const cur = this.get(x, y);
        if (cur === null) continue;
        const r = fn(x, y, cur);
        if (r) this.set(x, y, r);
      }
    }
    return this;
  }

  /** Swap exact colours, e.g. recolor({ '#ff0000': '#00ff00' }). Keys must be lower-case '#rrggbb'. */
  recolor(map: Record<string, string>): this {
    return this.each((_x, _y, c) => map[c]);
  }

  /** Copy another painter's opaque pixels onto this one. */
  blit(src: Px, dx: number, dy: number, flipX = false): this {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const c = src.get(flipX ? src.w - 1 - x : x, y);
        if (c) this.set(dx + x, dy + y, c);
      }
    }
    return this;
  }

  /**
   * The box that holds everything painted, or null if nothing is. With `grain` > 1 the box is
   * widened to whole blocks of that many pixels, so a picture cut down to it still sits on whole
   * game pixels.
   */
  bounds(grain = 1): { x: number; y: number; w: number; h: number } | null {
    let x0 = this.w;
    let y0 = this.h;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0, i = 3; y < this.h; y++) {
      for (let x = 0; x < this.w; x++, i += 4) {
        if (this.d[i] === 0) continue;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return null;
    x0 -= x0 % grain;
    y0 -= y0 % grain;
    x1 = Math.min(this.w, x1 + 1 + ((grain - ((x1 + 1) % grain)) % grain));
    y1 = Math.min(this.h, y1 + 1 + ((grain - ((y1 + 1) % grain)) % grain));
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /** A copy of one box of the painting. */
  crop(x: number, y: number, w: number, h: number): Px {
    const p = new Px(w, h);
    for (let j = 0; j < h; j++) {
      const from = ((y + j) * this.w + x) * 4;
      p.d.set(this.d.subarray(from, from + w * 4), j * w * 4);
    }
    return p;
  }

  clone(): Px {
    const p = new Px(this.w, this.h);
    p.d.set(this.d);
    return p;
  }

  flipX(): Px {
    const p = new Px(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const s = (y * this.w + (this.w - 1 - x)) * 4;
        const t = (y * this.w + x) * 4;
        p.d[t] = this.d[s];
        p.d[t + 1] = this.d[s + 1];
        p.d[t + 2] = this.d[s + 2];
        p.d[t + 3] = this.d[s + 3];
      }
    }
    return p;
  }

  toCanvas(): HTMLCanvasElement {
    const cv = document.createElement('canvas');
    cv.width = this.w;
    cv.height = this.h;
    const g = cv.getContext('2d')!;
    const im = g.createImageData(this.w, this.h);
    im.data.set(this.d);
    g.putImageData(im, 0, 0);
    return cv;
  }

  /**
   * Finish: turn the painting into a Sprite with the given anchor pixel. `density` is how many of
   * this painting's pixels make one game pixel (the anchor is given in the painting's pixels).
   */
  sprite(ax: number, ay: number, density = 1): Sprite {
    if (density === 1) return { img: this.toCanvas(), w: this.w, h: this.h, ax, ay };
    return { img: this.toCanvas(), w: this.w / density, h: this.h / density, ax: ax / density, ay: ay / density, density };
  }
}

// ---------------------------------------------------------------------------------------------
// Sprite utilities used by the renderer (cached, so call them freely every frame).

/** Draw a sprite with its anchor at (x, y), in game pixels, whatever grain it was painted at. */
export function drawSprite(g: CanvasRenderingContext2D, s: Sprite, x: number, y: number): void {
  g.drawImage(s.img, x - s.ax, y - s.ay, s.w, s.h);
}

const glows = new Map<string, HTMLCanvasElement>();

/** A soft round pool of one colour, painted once: every light of that colour is this picture, stretched. */
function glowOf(color: string): HTMLCanvasElement {
  let cv = glows.get(color);
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = 64;
  cv.height = 64;
  const c = cv.getContext('2d')!;
  const v = rgba(color);
  const grd = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, `rgba(${v[0]},${v[1]},${v[2]},1)`);
  grd.addColorStop(0.45, `rgba(${v[0]},${v[1]},${v[2]},0.45)`);
  grd.addColorStop(1, `rgba(${v[0]},${v[1]},${v[2]},0)`);
  c.fillStyle = grd;
  c.fillRect(0, 0, 64, 64);
  glows.set(color, cv);
  return cv;
}

function addLight(g: CanvasRenderingContext2D, s: Sprite, l: Light, x: number, y: number, scale: number, strength: number): void {
  const r = l.r * scale;
  g.globalAlpha = Math.max(0, Math.min(1, (l.a ?? 0.5) * strength));
  g.drawImage(glowOf(l.color), x + (l.x - s.ax) * scale - r, y + (l.y - s.ay) * scale - r, r * 2, r * 2);
}

/**
 * Add the lights a sprite gives off (a lit blade, a crystal) to the picture. The sprite's anchor
 * is at (x, y); `scale` is how much larger than life it was drawn. Call it after the sprite is
 * drawn, and after any darkness has been laid over the scene.
 */
export function drawLights(g: CanvasRenderingContext2D, s: Sprite, x: number, y: number, scale = 1, strength = 1): void {
  if (!s.lights || s.lights.length === 0) return;
  const before = g.globalCompositeOperation;
  g.globalCompositeOperation = 'lighter';
  for (const l of s.lights) addLight(g, s, l, x, y, scale, strength);
  g.globalAlpha = 1;
  g.globalCompositeOperation = before;
}

/** One light on its own: `r` and (x, y) in the units of the canvas being drawn on. */
export function drawGlow(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number): void {
  const before = g.globalCompositeOperation;
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = Math.max(0, Math.min(1, a));
  g.drawImage(glowOf(color), x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
  g.globalCompositeOperation = before;
}

/** The pool of light behind a figure, if it has one. Call it just before the sprite is drawn. */
export function drawAura(g: CanvasRenderingContext2D, s: Sprite, x: number, y: number, scale = 1, strength = 1): void {
  if (!s.aura) return;
  const before = g.globalCompositeOperation;
  g.globalCompositeOperation = 'lighter';
  addLight(g, s, s.aura, x, y, scale, strength);
  g.globalAlpha = 1;
  g.globalCompositeOperation = before;
}

const flipped = new WeakMap<Sprite, Sprite>();

/** The sprite mirrored left-to-right (anchor and lights mirrored too). */
export function flipSprite(s: Sprite): Sprite {
  let f = flipped.get(s);
  if (f) return f;
  const cv = document.createElement('canvas');
  cv.width = s.img.width;
  cv.height = s.img.height;
  const g = cv.getContext('2d')!;
  g.translate(cv.width, 0);
  g.scale(-1, 1);
  g.drawImage(s.img, 0, 0);
  // the anchor names a pixel, so its mirror is one picture pixel short of the far edge
  f = { img: cv, w: s.w, h: s.h, ax: s.w - 1 / (s.density ?? 1) - s.ax, ay: s.ay };
  if (s.density !== undefined) f.density = s.density;
  if (s.lights) f.lights = s.lights.map((l) => ({ ...l, x: s.w - l.x }));
  if (s.aura) f.aura = { ...s.aura, x: s.w - s.aura.x };
  if (s.tails) f.tails = s.tails.map((r) => ({ ...r, x: s.w - r.x }));
  flipped.set(s, f);
  return f;
}

/** Where each sprite asked about is painted, in squares of COVER_CELL game pixels: worked out once for each. */
const COVER_CELL = 4;
const covers = new WeakMap<Sprite, { cols: number; rows: number; on: Uint8Array }>();

/**
 * Is a sprite painted at a point of itself (game pixels from its top left corner)? Coarse: by
 * squares four game pixels a side, a square counting as painted when a third of it is. For asking
 * whether a big thing that stands in front of the hero hides them (render.ts).
 */
export function spriteCovers(s: Sprite, x: number, y: number): boolean {
  let m = covers.get(s);
  if (!m) {
    const d = s.density ?? 1;
    const cols = Math.ceil(s.w / COVER_CELL);
    const rows = Math.ceil(s.h / COVER_CELL);
    const on = new Uint8Array(cols * rows);
    const cv = s.img as HTMLCanvasElement;
    const g = typeof cv.getContext === 'function' ? cv.getContext('2d') : null;
    if (g) {
      const data = g.getImageData(0, 0, cv.width, cv.height).data;
      const side = COVER_CELL * d;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let n = 0;
          for (let yy = r * side; yy < Math.min(cv.height, (r + 1) * side); yy++) for (let xx = c * side; xx < Math.min(cv.width, (c + 1) * side); xx++) if (data[(yy * cv.width + xx) * 4 + 3] > 0) n++;
          if (n * 3 >= side * side) on[r * cols + c] = 1;
        }
      }
    }
    m = { cols, rows, on };
    covers.set(s, m);
  }
  const c = Math.floor(x / COVER_CELL);
  const r = Math.floor(y / COVER_CELL);
  return c >= 0 && r >= 0 && c < m.cols && r < m.rows && m.on[r * m.cols + c] === 1;
}

/**
 * Silhouettes made so far, by the frame they are of and their colour, and how many pixels they
 * come to. A hit flashes a monster white on whatever frame it is showing, and what ails it tints
 * every frame it shows meanwhile: with the monsters painted like the heroes (Version 14: some
 * 760 frames of them, twice that with their mirror images, the Warden's each a hundred pixels
 * across) a long evening could fill a phone's whole allowance of picture memory with flat-colour
 * copies. So they are kept only up to TINT_BUDGET pixels; past that the lot is let go, and those
 * still wanted are made again as they are asked for (a fifth of a millisecond each).
 */
const tinted = new Map<Sprite, Map<string, Sprite>>();
let tintedPx = 0;
/** About 12 megabytes of pictures (four bytes a pixel). */
export const TINT_BUDGET = 3_000_000;
/** How many pixels of silhouettes are being kept (for the tests). */
export function tintedPixels(): number {
  return tintedPx;
}

/** The sprite's silhouette filled with one flat colour (used for hit flashes and status tints). */
export function silhouette(s: Sprite, color: string): Sprite {
  let m = tinted.get(s);
  let t = m ? m.get(color) : undefined;
  if (t) return t;
  const area = s.img.width * s.img.height;
  if (tintedPx + area > TINT_BUDGET) {
    // (whoever still holds one, an afterimage on its way out, keeps it: only this list forgets them)
    tinted.clear();
    tintedPx = 0;
    m = undefined;
  }
  if (!m) {
    m = new Map();
    tinted.set(s, m);
  }
  const cv = document.createElement('canvas');
  cv.width = s.img.width;
  cv.height = s.img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(s.img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = color;
  g.fillRect(0, 0, cv.width, cv.height);
  t = { img: cv, w: s.w, h: s.h, ax: s.ax, ay: s.ay };
  if (s.density !== undefined) t.density = s.density;
  m.set(color, t);
  tintedPx += area;
  return t;
}

// ---------------------------------------------------------------------------------------------
// Isometric tile helpers. A ground tile is a 32x16 diamond with this exact raster, which tiles
// seamlessly when neighbours are offset by (+-16, +-8):
//
//   row y (0..15) covers x in [16 - hw, 16 + hw) with hw = isoHalfWidth(y)
//   -> row widths 2, 6, 10, ... 30, 30, ... 10, 6, 2

export function isoHalfWidth(y: number): number {
  return y < 8 ? 2 * y + 1 : 2 * (15 - y) + 1;
}

/** Lowest diamond row (0..15) that contains column x (valid for x in 1..30). */
export function isoBottom(x: number): number {
  const xx = x < 16 ? x : 31 - x;
  return Math.floor((xx + 15) / 2);
}

/** Highest diamond row (0..15) that contains column x (valid for x in 1..30). */
export function isoTop(x: number): number {
  const xx = x < 16 ? x : 31 - x;
  return Math.ceil((15 - xx) / 2);
}

/**
 * Shader for a tile's top face. (u, v) are the pixel's position inside the tile in WORLD space,
 * each in 0..1: u runs along world x (toward screen right-down), v along world y (toward screen
 * left-down). (x, y) are the pixel's position in the 32x16 diamond. Return a colour or null.
 */
export type TopShader = (u: number, v: number, x: number, y: number) => Col;

/**
 * Shader for a block's side face. u = column along the face, 0..14, left to right on screen.
 * v = pixels below the face's top edge, 0..height-1 (rows follow the slope of the tile edge).
 */
export type FaceShader = (u: number, v: number) => Col;

/** Paint a tile diamond whose bounding box starts at (ox, oy). */
export function isoDiamond(p: Px, ox: number, oy: number, shade: TopShader): void {
  for (let y = 0; y < 16; y++) {
    const hw = isoHalfWidth(y);
    for (let x = 16 - hw; x < 16 + hw; x++) {
      const px = x + 0.5 - 16;
      const py = y + 0.5;
      const u = (px / 16 + py / 8) / 2;
      const v = (py / 8 - px / 16) / 2;
      p.set(ox + x, oy + y, shade(u, v, x, y));
    }
  }
}

/**
 * Paint a block: a diamond top face raised `height` pixels above the ground, with a left (south-west)
 * and right (south-east) side face under it. The block's bounding box is 32 x (16 + height) and
 * starts at (ox, oy). The ground diamond's top vertex ends up at (ox + 16, oy + height) - use that
 * as the sprite anchor.
 */
export function isoBlock(p: Px, ox: number, oy: number, height: number, top: TopShader, left: FaceShader, right: FaceShader): void {
  for (let x = 1; x <= 30; x++) {
    const yb = isoBottom(x);
    const isLeft = x < 16;
    const u = isLeft ? x - 1 : x - 16;
    for (let k = 0; k < height; k++) {
      p.set(ox + x, oy + yb + 1 + k, isLeft ? left(u, k) : right(u, k));
    }
  }
  isoDiamond(p, ox, oy, top);
}
