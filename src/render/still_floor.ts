// A PLACE'S FLOOR AS ONE PICTURE (speed only: what is on the screen is the same, to the pixel).
//
// His words, 7 Nov 2026, 23:11: “Still a ton of lag in the town”. Measured there (11 Nov 2026, a phone's screen): of the 714
// pictures the town draws a frame, some 300 are its floor: the roof behind everything, a picture for each tile of the hall's
// flags (235 on the screen at once), and the shade of the walls over the tiles at their feet. None of them ever changes while
// he is in town. So they are laid down once, in the game's order, into one picture as large as the place, and that picture is
// drawn in their place: one picture a frame, not three hundred.
//
// WHY IT IS THE SAME: the floor is the first thing drawn, onto the game's black. The picture is that black, and the same pictures are laid on it
// in the same order at the same places, at the screen's own grain (the canvas's scale); it is moved only by whole game pixels,
// as the camera is. So every pixel of it is what the game would have made there, and everything else is drawn over it as before.
// Only for a place whose look says its floor is steady (LookView.stillFloor: the castle's hall), on flat ground, all of it seen.
// Where any of that cannot be said the floor is drawn tile by tile as before (render.ts drawWorld).

import type { Cam } from './fx';

/** The switch, and the most pixels its picture may hold (the town's is under a million: about 3.5 MB). */
export const STILL_FLOOR = { on: true, most: 3_000_000 };

/** What a floor is laid with: the game's own drawing of it, on the canvas given, with the camera given. */
export type LayFloor = (g: CanvasRenderingContext2D, cam: Cam) => void;

export class StillFloor {
  private can: HTMLCanvasElement | null = null;
  /** What the picture was made of (whatever the game says the floor hangs on), and the canvas's grain. */
  private key: readonly unknown[] | null = null;
  /** The picture's corner from the camera's, and its size (game pixels). */
  private x0 = 0;
  private y0 = 0;
  private w = 0;
  private h = 0;
  /** What it did (for the tests): pictures made, frames drawn as one picture, frames it left to the game. */
  readonly stats = { made: 0, drawn: 0, left: 0 };
  /** Its switch (for the tests, from the page: dbg.renderer.stillFloor.sw.on). */
  readonly sw = STILL_FLOOR;

  /** Its picture let go (the place is left: render.ts forgetLooks). Made again if wanted. */
  forget(): void {
    if (this.can) {
      // (a canvas of no size gives its room back at once)
      this.can.width = 0;
      this.can.height = 0;
    }
    this.can = null;
    this.key = null;
  }

  /** How much room its picture takes (bytes). */
  bytes(): number {
    return this.can ? this.can.width * this.can.height * 4 : 0;
  }

  /**
   * The floor drawn on `g` as one picture, over the black the game has filled the screen with (`back`). `key`: all that the floor hangs on (the picture is made again when any of it is
   * another); `lay`: the game's own drawing of the whole floor. True if it did. False if it could not, and nothing was drawn:
   * the game draws the floor itself, as before.
   */
  draw(g: CanvasRenderingContext2D, cam: Cam, W: number, H: number, back: string, key: readonly unknown[], lay: LayFloor): boolean {
    if (!STILL_FLOOR.on || typeof document === 'undefined' || typeof g.getTransform !== 'function') return false;
    // (the screen's own grain: a whole number of picture pixels to a game pixel, nothing turned, nothing moved by a part of one)
    const T = g.getTransform();
    const k = T.a;
    const whole = (v: number): boolean => v === Math.round(v);
    if (T.b !== 0 || T.c !== 0 || T.d !== k || k < 1 || !whole(k) || !whole(T.e) || !whole(T.f) || !whole(cam.ox) || !whole(cam.oy) || g.globalAlpha !== 1 || g.globalCompositeOperation !== 'source-over') {
      this.stats.left++;
      return false;
    }
    const smooth = g.imageSmoothingEnabled;
    const had = this.key;
    let same = had !== null && had.length === key.length + 3 && had[0] === k && had[1] === smooth && had[2] === back;
    for (let i = 0; same && i < key.length; i++) same = had![i + 3] === key[i];
    if (!same) {
      this.forget();
      this.key = [k, smooth, back, ...key];
      this.make(k, smooth, back, lay);
    }
    const can = this.can;
    if (!can) {
      this.stats.left++;
      return false;
    }
    // (the part of it on the screen, in whole game pixels)
    const px = cam.ox + this.x0;
    const py = cam.oy + this.y0;
    const ax = Math.max(0, px);
    const ay = Math.max(0, py);
    const bx = Math.min(W, px + this.w);
    const by = Math.min(H, py + this.h);
    if (bx > ax && by > ay) g.drawImage(can, (ax - px) * k, (ay - py) * k, (bx - ax) * k, (by - ay) * k, ax, ay, bx - ax, by - ay);
    this.stats.drawn++;
    return true;
  }

  /** The picture made: the floor laid once to see how large it is, then laid on a canvas of that size filled with the game's black (`back`). */
  private make(k: number, smooth: boolean, back: string, lay: LayFloor): void {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    // (a canvas that only measures: the floor is laid with pictures at their own size or stretched to one, nothing else)
    let other = false;
    const measure = {
      drawImage(_img: unknown, x: number, y: number, w?: number, h?: number, ...more: number[]): void {
        if (w === undefined || h === undefined || more.length) {
          other = true;
          return;
        }
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x + w);
        y1 = Math.max(y1, y + h);
      },
    } as unknown as CanvasRenderingContext2D;
    lay(measure, { ox: 0, oy: 0 });
    if (other || !(x1 > x0) || !(y1 > y0)) return;
    this.x0 = Math.floor(x0);
    this.y0 = Math.floor(y0);
    this.w = Math.ceil(x1) - this.x0;
    this.h = Math.ceil(y1) - this.y0;
    if (this.w * k * this.h * k > STILL_FLOOR.most) return;
    const can = document.createElement('canvas');
    can.width = this.w * k;
    can.height = this.h * k;
    const c = can.getContext('2d', { alpha: false });
    if (!c) return;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = back;
    c.fillRect(0, 0, can.width, can.height);
    c.setTransform(k, 0, 0, k, 0, 0);
    c.imageSmoothingEnabled = smooth;
    lay(c, { ox: -this.x0, oy: -this.y0 });
    this.can = can;
    this.stats.made++;
  }
}
