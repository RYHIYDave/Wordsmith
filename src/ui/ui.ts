// A tiny immediate-mode interface kit for the low-resolution canvas: boxes, buttons, slots and
// press routing. Panels test their widgets top-most first (pressIn consumes the press), then draw.

import { P } from '../art/palette';
import { drawText, textWidth } from '../engine/font';
import type { Press } from '../engine/input';
import type { Sprite } from '../engine/px';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The colours of the interface. Since Version 13 they are the heroes' (art/kit.ts, style 6): the
 * owner, 4 Oct 2026, "can you update the font and menus to match the art style". Deep blue panels
 * in flat colour, no dark outline (a block's own colour against the indigo behind it is its
 * edge), and two accents that glow: cyan for what is picked or pointed at, pink for the one thing
 * to press. Until then it was the dungeon's own stone greys with gold.
 */
export const THEME = {
  /** The deep indigo of the world: the shadow under a letter, the seam between two things. */
  ink: '#0e0c24',
  /** A panel. */
  bg: '#1a1648',
  /** A block that stands on a panel: a button at rest, an attack's plate, a word's tile. */
  bg2: '#2a2466',
  /** The same, lit: under the pointer, pressed, picked. */
  hot: '#4640a0',
  /** The inside of a box that holds an item or a word. */
  slot: '#0e0c24',
  /** A quiet line: the rim of an empty slot, a rule across a panel. */
  edge: '#3a3478',
  /** A rim that says "this can be pressed". */
  edgeHi: '#7a74c8',
  /** Lettering that is barely there: the label in an empty slot, "LV 5" on a slot not yet open. */
  faint: '#5a54b0',
  text: '#f0e8ff',
  dim: '#9c96dc',
  /** The accent: titles, what is picked, what the game is pointing at. */
  accent: '#7af8f0',
  /** The accent at rest, between two pulses. */
  accentLo: '#22a8c0',
  /** A place that will take what is held (lit, and at rest). */
  accentBg: '#12506a',
  accentBg2: '#103654',
  /** The one thing to press: its block, and that block lit. */
  call: '#e0287a',
  callHi: '#ff7aa8',
  /** Money. */
  gold: '#ffe070',
  /** A property a piece of gear came with (the blue of a magic item, light enough to read). */
  magic: '#9cb0ff',
  bad: '#ff6e80',
  good: '#8af078',
  /** Behind something that is done (a ticked box). */
  goodBg: '#0e4a2c',
  /** The hero's life: the liquid in the globe, the line of light on it, and the bar's empty part. */
  life: '#e8344e',
  lifeHi: '#ff9aa0',
  lifeLo: '#5a1030',
  mana: '#58a8f0',
  manaHi: '#c0e4ff',
};

export const inside = (r: Rect, x: number, y: number): boolean => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;

export class Ui {
  g!: CanvasRenderingContext2D;
  w = 0;
  h = 0;
  /** This frame's press on the interface, if any, and whether a widget has used it. */
  press: Press | null = null;
  used = false;
  /** Pointer position for hover. Off-screen when the player is on touch. */
  hx = -1;
  hy = -1;
  touch = false;
  /** A press that began on the interface and is still down: where it is now. Null when nothing is held. */
  held: { x: number; y: number } | null = null;
  /** That press was let go this frame, here. */
  release: { x: number; y: number } | null = null;
  private regions: Rect[] = [];
  private prev: Rect[] = [];
  /** Where named widgets were drawn this frame, so automated playtests can find what to press. */
  marks = new Map<string, Rect>();

  begin(g: CanvasRenderingContext2D, w: number, h: number, press: Press | null, hx: number, hy: number, touch: boolean): void {
    this.g = g;
    this.w = w;
    this.h = h;
    this.press = press;
    this.used = false;
    this.hx = touch ? -99 : hx;
    this.hy = touch ? -99 : hy;
    this.touch = touch;
    this.prev = this.regions;
    this.regions = [];
    this.marks.clear();
  }

  /** Name a widget's area for automated playtests. Has no effect on play. */
  mark(name: string, x: number, y: number, w: number, h: number): void {
    this.marks.set(name, { x, y, w, h });
  }

  /**
   * Does the interface cover this point? New presses there go to the interface, not the world.
   * Presses arrive between frames, so this looks at the frame just drawn, and at the one before it
   * as well: a panel counts from the moment it first appears.
   */
  blocks(x: number, y: number): boolean {
    for (const r of this.regions) if (inside(r, x, y)) return true;
    for (const r of this.prev) if (inside(r, x, y)) return true;
    return false;
  }

  /** Reserve an area for the interface. */
  claim(x: number, y: number, w: number, h: number): void {
    this.regions.push({ x, y, w, h });
  }

  hover(x: number, y: number, w: number, h: number): boolean {
    return this.hx >= x && this.hy >= y && this.hx < x + w && this.hy < y + h;
  }

  /** True if this area was pressed this frame and nothing above it took the press. */
  pressIn(x: number, y: number, w: number, h: number, button = 0): boolean {
    const p = this.press;
    if (!p || this.used || p.button !== button) return false;
    if (p.x < x || p.y < y || p.x >= x + w || p.y >= y + h) return false;
    this.used = true;
    return true;
  }

  /**
   * A flat block with its corners taken off. The screen holds two picture pixels to a game pixel
   * (engine/screen.ts), so a corner is cut by half a game pixel twice over: a soft corner that the
   * coarse grain could not draw.
   */
  private block(x: number, y: number, w: number, h: number, fill: string): void {
    const g = this.g;
    g.fillStyle = fill;
    if (w < 4 || h < 4) {
      g.fillRect(x, y, w, h);
      return;
    }
    g.fillRect(x + 1, y, w - 2, h);
    g.fillRect(x, y + 1, w, h - 2);
    g.fillRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  /**
   * A box: a block of `fill` with a rim of `edge` half a game pixel wide (one picture pixel: the
   * coarse grain's one-pixel frame looked like an outline, and the art style has none).
   */
  box(x: number, y: number, w: number, h: number, fill: string = THEME.bg, edge: string = THEME.edge): void {
    this.block(x, y, w, h, edge);
    if (w < 4 || h < 4) {
      this.g.fillStyle = fill;
      this.g.fillRect(x + 0.5, y + 0.5, w - 1, h - 1);
      return;
    }
    const g = this.g;
    g.fillStyle = fill;
    g.fillRect(x + 1, y + 0.5, w - 2, h - 1);
    g.fillRect(x + 0.5, y + 1, w - 1, h - 2);
  }

  /** A panel: a deep blue block with a soft shadow under it and a line of light along its top. Claims its area. */
  panel(x: number, y: number, w: number, h: number): void {
    const g = this.g;
    g.globalAlpha = 0.55;
    this.block(x + 2, y + 2, w, h, P.black);
    g.globalAlpha = 1;
    this.box(x, y, w, h, THEME.bg, THEME.edge);
    // (the accent, as a hair of light where the panel's top edge catches it)
    g.fillStyle = THEME.accentLo;
    g.fillRect(x + 2, y + 0.5, w - 4, 0.5);
    this.claim(x, y, w, h);
  }

  /** Dim everything behind a modal panel and swallow presses outside it. */
  shade(alpha = 0.55): void {
    const g = this.g;
    g.globalAlpha = alpha;
    g.fillStyle = P.black;
    g.fillRect(0, 0, this.w, this.h);
    g.globalAlpha = 1;
    this.claim(0, 0, this.w, this.h);
  }

  text(s: string, x: number, y: number, color: string = THEME.text, align: 'left' | 'center' | 'right' = 'left', small = false): number {
    return drawText(this.g, s, x, y, color, { align, font: small ? 'small' : 'normal' });
  }

  /**
   * Draw a button (no press test: do that first with pressIn). `primary`: the one thing to press
   * on the screen it is on (DONE, NEW GAME, ENTER DUNGEON): a pink block. `lit`: it is asking to
   * be pressed just now (callers blink it).
   */
  drawButton(x: number, y: number, w: number, h: number, label: string, opts: { disabled?: boolean; color?: string; small?: boolean; lit?: boolean; primary?: boolean } = {}): void {
    const hot = !opts.disabled && this.hover(x, y, w, h);
    this.marks.set(`button:${label}`, { x, y, w, h });
    if (opts.disabled) this.box(x, y, w, h, THEME.bg, THEME.edge);
    else if (opts.primary) this.box(x, y, w, h, hot || opts.lit ? THEME.callHi : THEME.call, hot ? P.white : THEME.callHi);
    else this.box(x, y, w, h, hot || opts.lit ? THEME.hot : THEME.bg2, hot ? THEME.accent : THEME.edgeHi);
    const color = opts.disabled ? THEME.faint : opts.primary ? P.white : opts.color ?? THEME.text;
    const th = opts.small ? 5 : 8;
    drawText(this.g, label, x + Math.floor(w / 2), y + Math.floor((h - th) / 2) + (opts.small ? 0 : 1), color, { align: 'center', font: opts.small ? 'small' : 'normal' });
  }

  /** Press test and drawing together, for simple cases where nothing overlaps the button. */
  button(x: number, y: number, w: number, h: number, label: string, opts: { disabled?: boolean; color?: string; small?: boolean; lit?: boolean; primary?: boolean } = {}): boolean {
    const hit = !opts.disabled && this.pressIn(x, y, w, h);
    this.drawButton(x, y, w, h, label, opts);
    return hit;
  }

  /** An item / word slot: dark square, optional icon, coloured border. */
  slot(x: number, y: number, size: number, icon: Sprite | null, edge: string = THEME.edge, lit = false): void {
    this.box(x, y, size, size, lit ? THEME.bg2 : THEME.slot, edge);
    // (at its size in game pixels: an icon may be painted finer than that, as the attacks' are)
    if (icon) this.g.drawImage(icon.img, x + Math.floor((size - icon.w) / 2), y + Math.floor((size - icon.h) / 2), icon.w, icon.h);
  }

  width(s: string, small = false): number {
    return textWidth(s, small ? 'small' : 'normal');
  }
}
