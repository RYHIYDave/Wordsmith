// ACT 2, THE HUSH, DRAWN: THE WALLS STANDING WHOLE, SEEN THROUGH ROUND WHOEVER IS BEHIND THEM (the art chat, 20 Oct 2026; ON at
// his word: his answer to its pictures, 20 Oct 2026: "Put everything in but the doorways.  With the new walls I think it’ll look fine").
//
// The owner, 20 Oct 2026, 07:41 Pacific: "All the 11-15 levels have weird slanting walls that I hate.  I know it’s so they don’t
// hide the character when he goes behind them but I just want that wall piece to go transparent when you walk behind it."
//
// WHAT IT DOES: the walls toward the eye on floors 11, 12, 14 and 15 stand whole (art/standing.ts paints them, a piece at a time
// with the ground: render/outdoor.ts), cut into bits, one for each line of tiles across the screen; each bit stands among the
// figures at its tiles' depth, as a wall tile does, so it hides what is behind it and not what is in front. And where the hero,
// or a monster in sight, is behind a bit, the bit is SEEN THROUGH round him: a soft oval as big as a man and a half, at its
// middle the wall as faint as the walls the hero is seen through elsewhere (render.ts SEEN_THROUGH), opening and shutting over
// a fifth of a second (as the door walls' mock-up has it).

import type { Land } from '../game/act1_layout';

/** THE SWITCH: on at his word (above); off, the walls toward the eye are cut down as before (the ground's rule), floor 11's slate as it was. */
export const ACT2_WALLS = { on: true };

/** How far from the floor the rock of a floor stands whole, in tiles (0: none of it; Infinity: all of it). */
export function wallsThick(land: Land): number {
  if (!ACT2_WALLS.on) return 0;
  switch (land.kind) {
    // (floor 11: its houses are a block deep, roofs and all)
    case 'gateward':
      return Infinity;
    // (the floors of rooms and halls: a wall a tile thick, the dark beyond it)
    case 'undercity':
    case 'housequiet':
    case 'library':
      return 1;
    default:
      return 0;
  }
}

/** One bit of the walls standing whole, as the ground's pieces keep it: its depth (a tile's x + y, plus 1), where it is in the world's picture (picture pixels), and its picture. */
export interface WallBit {
  d: number;
  x0: number;
  y0: number;
  w: number;
  h: number;
  img: HTMLCanvasElement | ImageBitmap;
}

/** A window: where someone behind a wall is seen through it (screen, game pixels: the middle of the oval, its half widths) and how far back they stand (world x + y). */
export interface Window {
  x: number;
  y: number;
  rx: number;
  ry: number;
  d: number;
}
/** How long a bit takes to open round someone behind it, and to shut, in seconds. */
export const OPEN_FOR = 0.2;
/** The hero's window, game pixels: its half widths, and how far over his feet its middle is. */
export const HERO_WINDOW = { rx: 56, ry: 58, up: 18 };
/** How strong a wall is left at a window's middle (the walls seen through elsewhere are left at 0.38: render.ts SEEN_THROUGH). */
export const WINDOW_FAINT = 0.15;

/** A hole as it is cut in a bit when it is drawn: the window, and how far open (0 to 1). */
export interface Hole {
  x: number;
  y: number;
  rx: number;
  ry: number;
  a: number;
}

/**
 * WHICH BITS ARE SEEN THROUGH, AND HOW FAR, frame by frame: each bit opens toward 1 while someone is behind it inside its
 * picture's box, and shuts toward 0 over OPEN_FOR when no one is; while it shuts, the windows it last had are kept.
 */
export class WallWindows {
  private open = new Map<string, { a: number; t: number; wins: Window[]; seen: number }>();
  private frame = 0;

  /** A new frame (call once a frame, before `holesOf`): what has not been asked of for a while is let go of. */
  begin(): void {
    this.frame++;
    if (this.frame % 120 === 0) for (const [k, v] of this.open) if (this.frame - v.seen > 60) this.open.delete(k);
  }
  /** Let go of everything (a new floor). */
  clear(): void {
    this.open.clear();
  }

  /** The holes to cut in a bit (`key` its own), standing at depth `d` over the screen box (x, y, w, h), with these windows this frame; null: none. */
  holesOf(key: string, d: number, x: number, y: number, w: number, h: number, wins: readonly Window[], t: number): Hole[] | null {
    const mine: Window[] = [];
    for (const n of wins) {
      if (n.d >= d - 0.5) continue;
      if (n.x + n.rx < x || n.x - n.rx > x + w || n.y + n.ry < y || n.y - n.ry > y + h) continue;
      mine.push(n);
    }
    let st = this.open.get(key);
    if (!st) {
      if (!mine.length) return null;
      st = { a: 0, t, wins: mine, seen: this.frame };
      this.open.set(key, st);
    }
    const dt = Math.max(0, Math.min(0.1, t - st.t));
    st.t = t;
    st.seen = this.frame;
    if (mine.length) {
      st.wins = mine;
      st.a = Math.min(1, st.a + dt / OPEN_FOR);
    } else st.a = Math.max(0, st.a - dt / OPEN_FOR);
    if (st.a <= 0) {
      if (!mine.length) this.open.delete(key);
      return null;
    }
    return st.wins.map((n) => ({ x: n.x, y: n.y, rx: n.rx, ry: n.ry, a: st.a }));
  }
}

/** A canvas to cut holes in, kept (one at a time is all that is needed). */
let scratch: HTMLCanvasElement | null = null;

/**
 * DRAW A BIT WITH ITS HOLES: the bit's picture (`img`, at `dens` picture pixels a game pixel) laid at (left, top) on the screen
 * w by h game pixels, each hole cut in it as a soft oval, at its middle the wall left `faint` as strong (fully open), fading to
 * none cut at its edge.
 */
export function drawHoled(g: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, left: number, top: number, w: number, h: number, holes: readonly Hole[], faint: number): void {
  const iw = img.width;
  const ih = img.height;
  if (!scratch) scratch = document.createElement('canvas');
  if (scratch.width < iw || scratch.height < ih) {
    scratch.width = Math.max(scratch.width, iw);
    scratch.height = Math.max(scratch.height, ih);
  }
  const c = scratch.getContext('2d') as CanvasRenderingContext2D;
  c.globalCompositeOperation = 'copy';
  c.drawImage(img, 0, 0);
  c.globalCompositeOperation = 'destination-out';
  const kx = iw / w;
  const ky = ih / h;
  for (const o of holes) {
    const cx = (o.x - left) * kx;
    const cy = (o.y - top) * ky;
    const rx = o.rx * kx;
    const ry = o.ry * ky;
    c.save();
    c.translate(cx, cy);
    c.scale(1, ry / rx);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    const k = (1 - faint) * o.a;
    gr.addColorStop(0, `rgba(0,0,0,${k})`);
    gr.addColorStop(0.55, `rgba(0,0,0,${k})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr;
    c.fillRect(-rx, -rx, rx * 2, rx * 2);
    c.restore();
  }
  c.globalCompositeOperation = 'source-over';
  g.drawImage(scratch, 0, 0, iw, ih, left, top, w, h);
}
