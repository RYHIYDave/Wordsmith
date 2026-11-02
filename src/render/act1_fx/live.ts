// A PICTURE PAINTED AFRESH EACH FRAME for what a move sends out over the floor, too big and too many-framed to keep every frame of
// (the Fleshmancer's rings, his fire and its lanes, his shards in flight): the art chat's own painters (each paints onto plain
// picture pixels through an `at`, a floor point and a height to the picture, as its scenes do) painted onto one picture kept for
// it, its pixels laid onto one canvas kept for it, and drawn at its anchor, two picture pixels to a game pixel (art/kit.ts GRAIN).
// Painted once a frame of its own clock however many times it is drawn in that frame.

import { GRAIN } from '../../art/kit';
import { Px } from '../../engine/px';
import type { Sprite } from '../../engine/px';

interface Live {
  px: Px;
  cv: HTMLCanvasElement;
  im: ImageData;
  stamp: string;
  s: Sprite;
}
const LIVE = new Map<string, Live>();

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
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d');
    if (!g) return null;
    L = { px: new Px(w, h), cv, im: g.createImageData(w, h), stamp: '', s: { img: cv, w: w / GRAIN, h: h / GRAIN, ax: ax / GRAIN, ay: ay / GRAIN, density: GRAIN } };
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
  return L.s;
}

/** Let a picture go (its move over): its room given back. */
export function liveDone(key: string): void {
  LIVE.delete(key);
}
