// A PLACE'S DARK WITH ITS STEADY LIGHTS' HOLES AS ONE PICTURE (speed only: what is on the screen is the same to the eye).
//
// His words, 7 Nov 2026, 23:11: “Still a ton of lag in the town”. The dark over a place is made every frame (render.ts light): a
// thin veil the size of the screen, and a soft hole cut in it for every light, each a small picture stretched and smoothed.
// In the castle's hall some 55 of those holes are the day's: under each window, at the foot of every wall, under each slat of
// sun (render/castle.ts lights). They never move nor flicker (LookLight.still). Measured there (11 Nov 2026, a phone's screen,
// the processor slowed six times, once the glows and the floor were one picture each): the holes were 23 ms of a 74 ms frame.
//
// So the veil with the steady holes cut in it is made once, as large as the place they light, and laid down each frame as the
// frame's dark begins; the holes that move or flicker (the hero's own pool of light, the gate's, the braziers', the forge's) are
// cut in it after, one by one, as ever.
//
// HOW NEAR IT IS TO WHAT IT WAS: the game cuts the hero's pool first and the day's holes after; this cuts the day's first and
// the hero's after. A hole takes a share of the dark that is left, so the order makes no difference but in the rounding of each
// step to a whole number of 255. In the hall, where the dark is a tenth (26 of 255), that is at most 2 of 255 in the veil: on the
// screen, a colour off by 2 of 255 at the very most. Where it cannot be laid (a canvas scaled or moved by a part of a pixel, a
// boss's own darkness over the place) the holes are cut one by one as before.

import type { Cam } from './fx';

/** The switch, and the most pixels its picture may hold (the town's is some 300,000: about 1.2 MB; the dark is a game pixel to a pixel). */
export const STILL_DARK = { on: true, most: 1_500_000 };

/** A steady light's hole: its middle from the camera's corner (game pixels), its radius, its strength (render.ts light, `spot`). */
export interface DarkSpot {
  x: number;
  y: number;
  r: number;
  strength: number;
}

export class StillDark {
  private can: HTMLCanvasElement | null = null;
  /** What the picture was made of (the veil's colour, the hole's picture, and whatever the game says the lights hang on). */
  private key: readonly unknown[] | null = null;
  /** The picture's corner from the camera's, and its size (game pixels). */
  private x0 = 0;
  private y0 = 0;
  private w = 0;
  private h = 0;
  /** What it did (for the tests): pictures made, frames drawn as one picture, frames it left to the game. */
  readonly stats = { made: 0, drawn: 0, left: 0 };
  /** Its switch (for the tests, from the page: dbg.renderer.stillDark.sw.on). */
  readonly sw = STILL_DARK;

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
   * The veil `tint` laid over the whole of the cleared canvas `dg` (W by H), with the steady lights' holes cut in it. `pool`: the
   * hole's picture; `key`: all that the steady lights hang on (the picture is made again when any of it is another); `spots`:
   * the steady lights' holes, in the game's order. True if it did: the game then cuts only the other holes. False if it could
   * not, and nothing was drawn: the game lays the veil and cuts every hole, as before.
   */
  draw(dg: CanvasRenderingContext2D, cam: Cam, W: number, H: number, tint: string, pool: CanvasImageSource, key: readonly unknown[], spots: () => DarkSpot[]): boolean {
    if (!STILL_DARK.on || typeof document === 'undefined' || typeof dg.getTransform !== 'function') return false;
    // (the dark's own grain: a game pixel to a pixel, nothing turned or moved; the camera on a whole pixel)
    const T = dg.getTransform();
    const whole = (v: number): boolean => v === Math.round(v);
    if (T.a !== 1 || T.b !== 0 || T.c !== 0 || T.d !== 1 || T.e !== 0 || T.f !== 0 || !whole(cam.ox) || !whole(cam.oy) || dg.globalAlpha !== 1 || dg.globalCompositeOperation !== 'source-over') {
      this.stats.left++;
      return false;
    }
    const had = this.key;
    let same = had !== null && had.length === key.length + 2 && had[0] === tint && had[1] === pool;
    for (let i = 0; same && i < key.length; i++) same = had![i + 2] === key[i];
    if (!same) {
      this.forget();
      this.key = [tint, pool, ...key];
      this.make(tint, pool, spots());
    }
    const can = this.can;
    if (!can) {
      this.stats.left++;
      return false;
    }
    // (the part of it on the screen, copied as it is; the plain veil wherever it does not reach)
    const px = cam.ox + this.x0;
    const py = cam.oy + this.y0;
    const ax = Math.max(0, px);
    const ay = Math.max(0, py);
    const bx = Math.min(W, px + this.w);
    const by = Math.min(H, py + this.h);
    dg.fillStyle = tint;
    if (bx > ax && by > ay) {
      const smooth = dg.imageSmoothingEnabled;
      dg.imageSmoothingEnabled = false;
      dg.drawImage(can, ax - px, ay - py, bx - ax, by - ay, ax, ay, bx - ax, by - ay);
      dg.imageSmoothingEnabled = smooth;
      if (ay > 0) dg.fillRect(0, 0, W, ay);
      if (by < H) dg.fillRect(0, by, W, H - by);
      if (ax > 0) dg.fillRect(0, ay, ax, by - ay);
      if (bx < W) dg.fillRect(bx, ay, W - bx, by - ay);
    } else dg.fillRect(0, 0, W, H);
    this.stats.drawn++;
    return true;
  }

  /** The picture made: the veil, and each steady hole cut in it where and as the game cuts it (render.ts light, `spot`). */
  private make(tint: string, pool: CanvasImageSource, spots: DarkSpot[]): void {
    const at: { x: number; y: number; w: number; h: number; a: number }[] = [];
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const q of spots) {
      if (q.strength <= 0) continue;
      const p = { x: Math.round(q.x - q.r), y: Math.round(q.y - q.r * 0.62), w: Math.round(q.r * 2), h: Math.round(q.r * 1.24), a: Math.min(1, q.strength) };
      if (p.w <= 0 || p.h <= 0) continue;
      at.push(p);
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x + p.w);
      y1 = Math.max(y1, p.y + p.h);
    }
    if (at.length < 2) return;
    this.x0 = x0;
    this.y0 = y0;
    this.w = x1 - x0;
    this.h = y1 - y0;
    if (this.w * this.h > STILL_DARK.most) return;
    const can = document.createElement('canvas');
    can.width = this.w;
    can.height = this.h;
    const c = can.getContext('2d');
    if (!c) return;
    c.fillStyle = tint;
    c.fillRect(0, 0, this.w, this.h);
    c.globalCompositeOperation = 'destination-out';
    c.imageSmoothingEnabled = true;
    for (const p of at) {
      c.globalAlpha = p.a;
      c.drawImage(pool, p.x - x0, p.y - y0, p.w, p.h);
    }
    this.can = can;
    this.stats.made++;
  }
}
