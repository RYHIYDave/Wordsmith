// Dev only: A FLOOR OF COLD STONE FLAGS to stand floor 19's king's knights on in their pictures (the Keep's own ground is
// not made yet: this is not it). Laid on the game's grid, a flag to a tile, so that tiles can be counted: one tile is
// 64 picture pixels across and 32 down. Nothing of the game imports it.
import { hash } from '../art/kit';

/** The cold stone of the Keep (its palette: cold stone, royal blue, old gold), a step quieter than the figures. */
const STONE: ReadonlyArray<readonly [number, number, number]> = [
  [52, 55, 66], [58, 61, 73], [48, 51, 61], [62, 64, 76], [55, 57, 70],
];
const SEAM: readonly [number, number, number] = [26, 27, 35];
const LIT: readonly [number, number, number] = [74, 77, 90];

/**
 * The floor `w` by `h` picture pixels, the world's tile (0, 0)'s top corner at (`ox`, `oy`): RGBA. A tile's diamond:
 * tile (i, j) has its top corner at (ox + (i - j) * 32, oy + (i + j) * 16).
 */
export function keepFloor(w: number, h: number, ox: number, oy: number): Uint8ClampedArray<ArrayBuffer> {
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // (where the pixel is in tiles: a = i, b = j)
      const px = x - ox + 0.5;
      const py = y - oy + 0.5;
      const a = (px / 32 + py / 16) / 2;
      const b = (py / 16 - px / 32) / 2;
      const i = Math.floor(a);
      const j = Math.floor(b);
      const fa = a - i;
      const fb = b - j;
      const k = (y * w + x) * 4;
      // each flag its own stone; a seam round it (lit along its upper left edges, dark along the rest)
      let c = STONE[Math.floor(hash(i, j, 9101) * STONE.length)];
      const edge = Math.min(fa, fb, 1 - fa, 1 - fb);
      if (edge < 0.035) c = fa < 0.035 || fb < 0.035 ? (edge < 0.018 ? SEAM : LIT) : SEAM;
      else {
        // (a little grain in it; now and then a crack)
        const g = hash(Math.floor(x / 2), Math.floor(y / 2), 9102);
        if (g < 0.07) c = [c[0] - 6, c[1] - 6, c[2] - 6];
        else if (g > 0.95) c = [c[0] + 5, c[1] + 5, c[2] + 6];
        if (hash(i, j, 9103) < 0.18 && Math.abs(fa - fb * (0.6 + 0.8 * hash(i, j, 9104)) - 0.2) < 0.012 && fa > 0.1 && fa < 0.85) c = SEAM;
      }
      d[k] = c[0];
      d[k + 1] = c[1];
      d[k + 2] = c[2];
      d[k + 3] = 255;
    }
  }
  return d;
}
