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
  /** The picture. (A baked frame kept in its sheet has none of its own until something asks for this: `sheetSprite`, below.) */
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
  /** Where the power a hero holds burns (the mage's crystal), in game pixels, and how hot (art/kit.ts, Charge). */
  charge?: { x: number; y: number; heat: number };
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
/**
 * THE FIRST FIVE FLOORS: the mirror images of BIG pictures (a boss's frames: over a thousand of them, each
 * tens of thousands of pixels) are kept only up to FLIP_BUDGET pixels, the longest unused let go of first;
 * one that is wanted again is made again (a tenth of a millisecond). Kept for good, as the small ones are,
 * they would double the room a boss takes.
 */
const bigFlips = new Map<Sprite, Sprite>();
let bigFlipPx = 0;
/** A picture of this many pixels or more is a big one. */
const BIG_FLIP = 9000;
/** About 20 megabytes of pictures (four bytes a pixel). */
export const FLIP_BUDGET = 5_000_000;
/** How many pixels of big mirror images are being kept (for the tests). */
export function flippedPixels(): number {
  return bigFlipPx;
}

// ---------------------------------------------------------------------------------------------
// FRAMES KEPT IN THEIR SHEETS (the heroes' and the townsfolk's baked pictures: render/baked.ts, render/townsfolk_baked.ts).
//
// HIS PHONE, MEASURED FOR THE FIRST TIME (the phone check, 12 Nov 2026: docs/requests/phone_check.md; an iPhone, in the Claude
// app; his words of the evening before, of the eight-sides test page: “60 SECOND LOAD TIME to enter THE TOWN”, “THE LOADING
// SCREEN LAGS”): a picture made by the browser for every baked frame as it was taken in (createImageBitmap(sheet, x, y, w, h))
// was 7.1 ms a frame there, on the game's own thread: 68.5 s of the Brawler's 74-second load into town, the screen standing
// still up to 9 s at a time, and twice the page restarted itself. The same on the machine every chat tests on: 3 s. Drawn, a
// frame straight from its sheet or from a small canvas cut from it cost his phone nothing more than the picture did.
// His word, asked whether to build it: “Yes, build it (Recommended)”.
//
// So NO PICTURE IS MADE FOR A FRAME AS IT IS TAKEN IN. The sheet is held whole. A baked frame's Sprite knows its sheet and
// where it is on it, and its `img` is cut from the sheet (a small canvas, as a painted frame's is) the first time something
// asks for it: nothing that draws a Sprite is changed, and what is drawn is the same pixels. The cut pictures in hand are
// kept to CUT_BUDGET: past it the least lately asked for are let go of (given back RETIRE_MS on, as any picture let go of
// is), and cut again from the sheet should they be asked for again.

/** A sheet of baked frames, held whole by whoever took it in (`img` null: let go of; its frames then show nothing). */
export interface FrameSheet {
  img: (CanvasImageSource & { width: number; height: number; close?: () => void }) | null;
}
interface Cut {
  sheet: FrameSheet;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Its picture, cut from the sheet (null: not cut, or let go of). */
  cv: HTMLCanvasElement | null;
}
/** How many pixels of frames cut from their sheets are kept in hand (24 MB of pictures). */
export const CUT_BUDGET = { px: 6_000_000 };
const cuts = new WeakMap<Sprite, Cut>();
/** The frames cut and in hand, the least lately asked for first. */
const inHand = new Map<Sprite, Cut>();
let inHandPx = 0;
let lastAsked: Sprite | null = null;
const cutCount = { made: 0, letGo: 0 };
const retiredCuts: { cv: HTMLCanvasElement; at: number }[] = [];

function letCutGo(s: Sprite, c: Cut): void {
  const cv = c.cv;
  if (!cv) return;
  c.cv = null;
  if (inHand.delete(s)) inHandPx -= c.w * c.h;
  if (lastAsked === s) lastAsked = null;
  cutCount.letGo++;
  // (whoever drew it this frame holds it a moment yet: given back RETIRE_MS on, as a picture retired is)
  retiredCuts.push({ cv, at: clockMs() });
}
function cutOf(s: Sprite, c: Cut): HTMLCanvasElement {
  if (c.cv) {
    // (asked for again: to the back of the line of those to let go of)
    if (lastAsked !== s) {
      inHand.delete(s);
      inHand.set(s, c);
      lastAsked = s;
    }
    return c.cv;
  }
  const from = c.sheet.img;
  if (!from) return pictureOfNothing();
  let cv: HTMLCanvasElement;
  if (typeof document === 'undefined') {
    // (where there is no page, in the unit tests: a stand-in of the same size)
    cv = { width: c.w, height: c.h } as HTMLCanvasElement;
  } else {
    cv = document.createElement('canvas');
    cv.width = c.w;
    cv.height = c.h;
    cv.getContext('2d')!.drawImage(from, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
  }
  c.cv = cv;
  inHand.set(s, c);
  inHandPx += c.w * c.h;
  lastAsked = s;
  cutCount.made++;
  for (const [old, oc] of inHand) {
    if (inHandPx <= CUT_BUDGET.px || old === s) break;
    letCutGo(old, oc);
  }
  return cv;
}
function reapCuts(all: boolean): void {
  if (retiredCuts.length === 0) return;
  const t = clockMs();
  let n = 0;
  while (n < retiredCuts.length && (all || t - retiredCuts[n].at >= RETIRE_MS)) {
    const cv = retiredCuts[n++].cv;
    cv.width = 0;
    cv.height = 0;
  }
  if (n) retiredCuts.splice(0, n);
}
/**
 * A baked frame, kept in its sheet: `part` is the rest of the Sprite (its size, anchor, lights...), and (x, y, w, h) where
 * its picture is on the sheet, in the sheet's pixels. Its `img` is cut from the sheet when it is first asked for. Given
 * another picture (`s.img = ...`: the picture of nothing, as it is let go of), it is a Sprite as any other from then on.
 */
export function sheetSprite(part: Omit<Sprite, 'img'>, sheet: FrameSheet, x: number, y: number, w: number, h: number): Sprite {
  const s = { ...part } as Sprite;
  const c: Cut = { sheet, x, y, w, h, cv: null };
  cuts.set(s, c);
  Object.defineProperty(s, 'img', {
    configurable: true,
    enumerable: true,
    get: () => cutOf(s, c),
    set: (v: HTMLCanvasElement) => {
      letCutGo(s, c);
      cuts.delete(s);
      Object.defineProperty(s, 'img', { value: v, writable: true, configurable: true, enumerable: true });
    },
  });
  return s;
}
/** How many pixels a picture is, without making it (a frame kept in its sheet is not cut for the asking). */
export function imgPx(s: Sprite): number {
  const c = cuts.get(s);
  return c ? c.w * c.h : s.img.width * s.img.height;
}
/** Is this a frame kept in its sheet (and not let go of)? */
export function inSheet(s: Sprite): boolean {
  return cuts.has(s);
}
/** Where a frame kept in its sheet is on it (null: not one, or let go of). For the playtests (tools/scenarios/sheet_frames.mjs). */
export function sheetWhere(s: Sprite): { sheet: FrameSheet; x: number; y: number; w: number; h: number; cut: boolean } | null {
  const c = cuts.get(s);
  return c ? { sheet: c.sheet, x: c.x, y: c.y, w: c.w, h: c.h, cut: !!c.cv } : null;
}
/** For measuring and the tests: frames cut from their sheets so far, let go of, in hand now and their pixels, and waiting to be given back. */
export function sheetCuts(): { made: number; letGo: number; inHand: number; px: number; waiting: number } {
  return { made: cutCount.made, letGo: cutCount.letGo, inHand: inHand.size, px: inHandPx, waiting: retiredCuts.length };
}


/**
 * PICTURES PUSHED OUT OF A BUDGET ARE GIVEN BACK, NOT ONLY FORGOTTEN (11 Nov 2026; his words: “lag and freezing issues after
 * playing a few levels”). A big mirror image or a silhouette let go of by its list kept its room until the browser noticed
 * that nobody held it, and a phone's browser is slow to notice (WebKit keeps a dropped canvas's pixels until its collector
 * runs). Measured on 25.3.1, floors 1 to 6 in one sitting, a bot playing: 364 MB of silhouettes and 129 MB of mirror images
 * were left to the collector so. Now each is given back by hand (`blank`: its size taken to nothing) RETIRE_MS after its
 * list let go of it: by then whoever held it for a moment (a picture drawn that frame, an afterimage on its way out) has done
 * with it, and one still held then shows nothing. `reapRetired` is called every frame the world is drawn (render.ts).
 */
export const RETIRE_MS = 3000;
const retired: { s: Sprite; at: number; px: number }[] = [];
let retiredPx = 0;
const clockMs = (): number => (typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : Date.now());
/**
 * A picture nobody is to be shown again (one its list has let go of; a floor's own, its floor left): given back RETIRE_MS on,
 * with its mirror image and its silhouettes (`releaseSprite`). Only for a picture that is the asker's own to give back: one
 * shared with another list would show nothing there too.
 */
export function retireSprite(s: Sprite): void {
  const px = imgPx(s);
  retired.push({ s, at: clockMs(), px });
  retiredPx += px;
}
/** How many pixels of pictures let go of are waiting to be given back (for the tests). */
export function retiredPixels(): number {
  return retiredPx;
}
/** Give back the pictures let go of RETIRE_MS ago or more (`all`: every one of them, now). How many were given back. */
export function reapRetired(all = false): number {
  reapCuts(all);
  if (retired.length === 0) return 0;
  const t = clockMs();
  let n = 0;
  while (n < retired.length && (all || t - retired[n].at >= RETIRE_MS)) {
    const r = retired[n++];
    retiredPx -= r.px;
    releaseSprite(r.s);
  }
  if (n) retired.splice(0, n);
  return n;
}
/** The mirror images handed to someone who may keep them (a picture kept among others: its list never gives it back). */
const keptFlips = new WeakSet<Sprite>();
/** What each mirror image is the mirror image of (so that one given back by itself is taken out of the lists that hold it). */
const flipSource = new WeakMap<Sprite, Sprite>();

/**
 * The sprite mirrored left-to-right (anchor and lights mirrored too). `passing`: the one asking draws it this frame and keeps
 * no hold of it (the world's figures, asked for anew each frame): a big one pushed out of the budget is then given back, where
 * nobody who may keep it has had it.
 */
export function flipSprite(s: Sprite, passing = false): Sprite {
  const area = s.img.width * s.img.height;
  const big = area >= BIG_FLIP;
  let f = big ? bigFlips.get(s) : flipped.get(s);
  if (f) {
    if (big) {
      // (used: it goes to the back of the line of those to let go of)
      bigFlips.delete(s);
      bigFlips.set(s, f);
      if (!passing) keptFlips.add(f);
    }
    return f;
  }
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
  if (s.charge) f.charge = { ...s.charge, x: s.w - s.charge.x };
  flipSource.set(f, s);
  if (!big) {
    flipped.set(s, f);
    return f;
  }
  bigFlips.set(s, f);
  bigFlipPx += area;
  if (!passing) keptFlips.add(f);
  // (whoever still holds one let go of here, a picture drawn this frame, keeps it a moment yet: it is given back RETIRE_MS on,
  // unless someone who may keep it has had it: then only this list forgets it, as before)
  for (const [key, old] of bigFlips) {
    if (bigFlipPx <= FLIP_BUDGET || key === s) break;
    bigFlips.delete(key);
    bigFlipPx -= old.img.width * old.img.height;
    if (!keptFlips.has(old)) retireSprite(old);
  }
  return f;
}

/** A picture of nothing: what a sprite that has been let go of shows (so that whoever still holds it draws nothing, and nothing breaks). */
let nothing: HTMLCanvasElement | null = null;
function pictureOfNothing(): HTMLCanvasElement {
  if (!nothing) {
    // (where there is no page, in the unit tests: a stand-in of the same size)
    nothing = typeof document !== 'undefined' ? document.createElement('canvas') : ({ width: 1, height: 1 } as HTMLCanvasElement);
    nothing.width = 1;
    nothing.height = 1;
  }
  return nothing;
}
function blank(s: Sprite): void {
  const nothing = pictureOfNothing();
  // (a frame kept in its sheet: only what was cut for it is its own to give back; the sheet is its holder's to close)
  if (cuts.has(s)) {
    s.img = nothing;
    return;
  }
  const img = s.img as unknown as { close?: () => void; width: number; height: number };
  if ((img as unknown) === nothing) return;
  s.img = nothing;
  // (a picture handed over by the painter, an ImageBitmap, gives its room back when it is closed; a canvas when its size is taken to nothing)
  if (typeof img.close === 'function') img.close();
  else {
    img.width = 0;
    img.height = 0;
  }
}

/**
 * THE FIRST FIVE FLOORS: give back the room a picture takes, now, and that of its mirror image and its
 * silhouettes (a boss's frames and a floor's films are tens of megabytes, and a browser is slow to notice
 * that nobody holds a picture any more). The sprite is left showing nothing.
 */
export function releaseSprite(s: Sprite): void {
  const area = imgPx(s);
  // (itself a mirror image: the lists that hold it as one forget it, so that its picture is made again if it is asked for)
  const of = flipSource.get(s);
  if (of) {
    if (bigFlips.get(of) === s) {
      bigFlips.delete(of);
      bigFlipPx -= area;
    }
    if (flipped.get(of) === s) flipped.delete(of);
  }
  const f = bigFlips.get(s) ?? flipped.get(s);
  if (bigFlips.delete(s)) bigFlipPx -= area;
  flipped.delete(s);
  for (const one of f ? [s, f] : [s]) {
    const m = tinted.get(one);
    if (m) {
      for (const t of m.values()) blank(t);
      tintedPx -= m.size * area;
      tinted.delete(one);
    }
    blank(one);
  }
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
    let cv = s.img as HTMLCanvasElement;
    // (a picture handed over by the painter, an ImageBitmap, is read by drawing it on a canvas first)
    if (typeof cv.getContext !== 'function' && typeof document !== 'undefined' && cv.width > 0) {
      const copy = document.createElement('canvas');
      copy.width = cv.width;
      copy.height = cv.height;
      copy.getContext('2d')?.drawImage(cv, 0, 0);
      cv = copy;
    }
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
    // (whoever still holds one, an afterimage on its way out, keeps it a moment yet: each is given back RETIRE_MS on, `retireSprite`.
    // Only the world's drawing asks for silhouettes, each frame anew, and only its afterimages hold one, a third of a second.)
    for (const of of tinted.values()) for (const one of of.values()) retireSprite(one);
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
