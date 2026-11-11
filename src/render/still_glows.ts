// A PLACE'S STEADY GLOWS AS ONE PICTURE (speed only: what is on the screen is the same).
//
// His words, 7 Nov 2026, 23:11: “Still a ton of lag in the town”. Measured there (11 Nov 2026, a phone's screen, the processor
// slowed six times): 714 pictures a frame covering 17.5 screens, and 11 of those screens were 67 glows, 65 of them the day that
// fills the castle's hall (art/castle_hall.ts dayLights, CASTLE_LIGHTS: glows up to 120 game pixels round, most at a twentieth of their light),
// each a small soft picture stretched to its size and ADDED to what is under it, every frame. Left out, the town's frame took
// 77 ms where it took 136.
//
// The day's glows never move nor flicker (LookLight.still). So they are laid down once, in the game's order, into one picture as
// large as the place they light, and that picture is added in their place: one screen of light a frame, not eleven.
//
// WHY IT IS THE SAME: light is added ('lighter'): each glow adds its own amount to each colour of a pixel, whatever is there, and
// a colour stops at full. Adding them to a clear picture first and that picture to the screen adds the same amounts. The picture
// is laid at the screen's own grain (the canvas's scale) and moved only by whole game pixels, as the camera is, so each glow
// falls on the same pixels as it did. Where that cannot be said (a canvas turned or scaled by a part of a pixel, a camera not on
// a whole pixel) the glows are drawn one by one as before. The glows that flicker (a fire's) are always drawn one by one. Only
// for a place whose look says it is steady and seen whole (LookView.steady: the castle's hall): render.ts drawWorld.
//
// HOW NEAR IT IS TO WHAT IT WAS: the same but on hairlines. A glow's small picture is stretched without smoothing, and where
// the middle of a screen pixel falls exactly between two of its pixels the browser takes one or the other by the last bit of
// its arithmetic, which goes by where on the screen the glow is. The game's own picture of these glows already differs from
// itself there whenever the camera moves a pixel (measured: some 10,000 to 33,000 of the screen's 1.4 million colour values,
// by 5 of 255 at most); this picture, laid once, differs from the game's by the same hairlines and no more (by 5 of 255 at
// most), and no longer changes as he walks. tools/scenarios/town_same.mjs measures it.

import { drawGlow } from '../engine/px';
import type { Level } from '../game/state';
import type { Cam } from './fx';
import { wx, wy } from './fx';
import type { LookLight } from './looks';

/** The switch, and the most pixels its picture may hold (the town's is some 1.3 million: about 5 MB). */
export const STILL_GLOWS = { on: true, most: 4_000_000 };

/** Where the camera's corner is the world's: a glow's place from it, in game pixels. */
const HOME: Cam = { ox: 0, oy: 0 };

export class StillGlows {
  private can: HTMLCanvasElement | null = null;
  /** What the picture was made of: the place, its lights, which of them were lit, the canvas's grain. */
  private level: Level | null = null;
  private lights: readonly LookLight[] | null = null;
  private lift: Cam['lift'] = null;
  private sig = -1;
  private k = 0;
  private smooth = false;
  /** The picture's corner from the camera's, and its size (game pixels). */
  private x0 = 0;
  private y0 = 0;
  private w = 0;
  private h = 0;
  /** What it did (for the tests): pictures made, frames drawn as one picture, frames it left to the game. */
  readonly stats = { made: 0, drawn: 0, left: 0 };
  /** Its switch (for the tests, from the page: dbg.renderer.stillGlows.sw.on). */
  readonly sw = STILL_GLOWS;

  /** Its picture let go (the place is left: render.ts forgetLooks). Made again if wanted. */
  forget(): void {
    if (this.can) {
      // (a canvas of no size gives its room back at once)
      this.can.width = 0;
      this.can.height = 0;
    }
    this.can = null;
    this.level = null;
    this.lights = null;
    this.sig = -1;
  }

  /** How much room its picture takes (bytes). */
  bytes(): number {
    return this.can ? this.can.width * this.can.height * 4 : 0;
  }

  /** Is this one of the glows the picture holds? (Steady, with a glow, its tile seen.) */
  private static steady(L: Level, q: LookLight): boolean {
    return !!q.glow && q.still === true && !!L.explored[Math.floor(q.y) * L.floor.w + Math.floor(q.x)];
  }

  /**
   * The steady glows of `lights` added to the picture `g` as one. True if it did: the game then draws only the others.
   * False if it could not, and nothing was drawn: the game draws them all, as before.
   */
  draw(g: CanvasRenderingContext2D, cam: Cam, W: number, H: number, L: Level, lights: readonly LookLight[]): boolean {
    if (!STILL_GLOWS.on || typeof document === 'undefined' || typeof g.getTransform !== 'function') return false;
    // (the screen's own grain: a whole number of picture pixels to a game pixel, nothing turned, nothing moved by a part of one)
    const T = g.getTransform();
    const k = T.a;
    const whole = (v: number): boolean => v === Math.round(v);
    if (T.b !== 0 || T.c !== 0 || T.d !== k || k < 1 || !whole(k) || !whole(T.e) || !whole(T.f) || !whole(cam.ox) || !whole(cam.oy)) {
      this.stats.left++;
      return false;
    }
    // (which of them are lit now: a place seen further has more)
    let sig = 0;
    let n = 0;
    for (let i = 0; i < lights.length; i++) {
      if (!StillGlows.steady(L, lights[i])) continue;
      sig = (Math.imul(sig, 31) + i + 1) | 0;
      n++;
    }
    if (n < 2) {
      this.stats.left++;
      return false;
    }
    const smooth = g.imageSmoothingEnabled;
    if (this.level !== L || this.lights !== lights || this.sig !== sig || this.k !== k || this.smooth !== smooth || this.lift !== (cam.lift ?? null)) {
      this.forget();
      this.level = L;
      this.lights = lights;
      this.sig = sig;
      this.k = k;
      this.smooth = smooth;
      this.lift = cam.lift ?? null;
      this.make(L, lights);
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
    if (bx > ax && by > ay) {
      const op = g.globalCompositeOperation;
      const al = g.globalAlpha;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 1;
      g.drawImage(can, (ax - px) * k, (ay - py) * k, (bx - ax) * k, (by - ay) * k, ax, ay, bx - ax, by - ay);
      g.globalAlpha = al;
      g.globalCompositeOperation = op;
    }
    this.stats.drawn++;
    return true;
  }

  /** The picture made: every steady glow that is lit, in the game's order, each where the game would draw it. */
  private make(L: Level, lights: readonly LookLight[]): void {
    const home: Cam = { ...HOME, lift: this.lift };
    const at: { x: number; y: number; q: LookLight }[] = [];
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const q of lights) {
      if (!StillGlows.steady(L, q) || !q.glow) continue;
      const x = wx(home, q.x, q.y) + (q.dx ?? 0);
      const y = wy(home, q.x, q.y) - q.up;
      at.push({ x, y, q });
      x0 = Math.min(x0, x - q.glow.r);
      y0 = Math.min(y0, y - q.glow.r);
      x1 = Math.max(x1, x + q.glow.r);
      y1 = Math.max(y1, y + q.glow.r);
    }
    if (!at.length) return;
    this.x0 = Math.floor(x0) - 1;
    this.y0 = Math.floor(y0) - 1;
    this.w = Math.ceil(x1) + 1 - this.x0;
    this.h = Math.ceil(y1) + 1 - this.y0;
    const k = this.k;
    if (this.w * k * this.h * k > STILL_GLOWS.most) return;
    const can = document.createElement('canvas');
    can.width = this.w * k;
    can.height = this.h * k;
    const c = can.getContext('2d');
    if (!c) return;
    c.setTransform(k, 0, 0, k, 0, 0);
    c.imageSmoothingEnabled = this.smooth;
    for (const p of at) drawGlow(c, p.x - this.x0, p.y - this.y0, p.q.glow!.r, p.q.glow!.color, p.q.glow!.a);
    this.can = can;
    this.stats.made++;
  }
}
