// A PICTURE PAINTED AFRESH EACH FRAME for what a move sends out over the floor, too big and too many-framed to keep every frame of
// (the Fleshmancer's rings, his fire and its lanes, his shards in flight): the art chat's own painters (each paints onto plain
// picture pixels through an `at`, a floor point and a height to the picture, as its scenes do) painted onto one picture kept for
// it, its pixels laid onto one canvas kept for it, and drawn at its anchor, two picture pixels to a game pixel (art/kit.ts GRAIN).
// Painted once a frame of its own clock however many times it is drawn in that frame.

import { GRAIN } from '../../art/kit';
import { Px } from '../../engine/px';
import type { Light, Sprite } from '../../engine/px';

interface Live {
  px: Px;
  cv: HTMLCanvasElement;
  im: ImageData;
  stamp: string;
  s: Sprite;
  used: number;
}
const LIVE = new Map<string, Live>();
/** No more than this many kept: the longest unused let go first (each perils' own key, and a floor sends out many in a fight). */
const MOST = 40;
let clock = 0;

/** A floor point (tiles from the picture's anchor) and a height over it (picture pixels) to the picture (its anchor at `ax`, `ay`). */
export type PicAt = (x: number, y: number, z?: number) => readonly [number, number];
/** Where floor points are on a picture whose anchor (`ax`, `ay`, picture pixels) is at the floor point (0, 0): straight, as the floor's own axes run. */
export function picAt(ax: number, ay: number): PicAt {
  return (x, y, z = 0) => [ax + 32 * (x - y), ay + 16 * (x + y) - z];
}
/**
 * The same, for a painter that paints as one facing +x with his left along -y (the art's own way, facing in front: art/
 * fleshmancer_action_fx.ts `facing`), turned to one at the anchor facing (fx, fy) and drawn with `hand` (his left the game's: game/
 * facing.ts beside).
 */
export function picAtFacing(ax: number, ay: number, fx: number, fy: number, hand: number): PicAt {
  const base = picAt(ax, ay);
  return (x, y, z = 0) => {
    // (art: x before him, -y to his left)
    const left = -y;
    return base(fx * x + fy * hand * left, fy * x - fx * hand * left, z);
  };
}

/**
 * The picture `key` (`w` by `h` picture pixels, its anchor at `ax`, `ay`) as `paint` paints it, painted afresh when `stamp` is not
 * what it was last painted at. Null where there is no canvas (the tests).
 */
export function livePicture(key: string, w: number, h: number, ax: number, ay: number, stamp: string, paint: (px: Px) => void): Sprite | null {
  if (typeof document === 'undefined') return null;
  let L = LIVE.get(key);
  if (!L || L.px.w !== w || L.px.h !== h) {
    if (LIVE.size >= MOST) {
      let old: string | null = null;
      let at = Infinity;
      for (const [k, v] of LIVE) if (v.used < at) [old, at] = [k, v.used];
      if (old !== null) LIVE.delete(old);
    }
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d');
    if (!g) return null;
    L = { px: new Px(w, h), cv, im: g.createImageData(w, h), stamp: '', s: { img: cv, w: w / GRAIN, h: h / GRAIN, ax: ax / GRAIN, ay: ay / GRAIN, density: GRAIN }, used: 0 };
    LIVE.set(key, L);
  }
  if (L.stamp !== stamp) {
    L.px.d.fill(0);
    paint(L.px);
    L.im.data.set(L.px.d);
    L.cv.getContext('2d')!.putImageData(L.im, 0, 0);
    L.stamp = stamp;
  }
  L.s.ax = ax / GRAIN;
  L.s.ay = ay / GRAIN;
  L.used = ++clock;
  return L.s;
}

/** Let a picture go (its move over): its room given back. */
export function liveDone(key: string): void {
  LIVE.delete(key);
}

/**
 * The same, for a painter that hands back a picture of its own each time (the art's `…Painted(t)`: its pixels and its lights): its
 * pixels laid onto the canvas kept for `key`, its lights given to the sprite (in game pixels, as art/kit.ts toSprite gives them).
 */
export function liveFrom(key: string, stamp: string, ax: number, ay: number, make: () => { px: Px; lights?: ReadonlyArray<Light> }): Sprite | null {
  if (typeof document === 'undefined') return null;
  let lights: ReadonlyArray<Light> = [];
  let made: Px | null = null;
  const L0 = LIVE.get(key);
  if (L0 && L0.stamp === stamp) return L0.s;
  const f = make();
  made = f.px;
  lights = f.lights ?? [];
  const s = livePicture(key, made.w, made.h, ax, ay, stamp, (px) => px.d.set(made!.d));
  if (s) s.lights = lights.map((l) => ({ ...l, x: l.x / GRAIN, y: l.y / GRAIN, r: l.r / GRAIN }));
  return s;
}
