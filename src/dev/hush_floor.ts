// A QUIET FLOOR TO SHOW THE SHAPES OF THE HUSH ON (dev only: the art chat's pictures; NOT floor 20's ground, which is not
// made yet). Grey flags with bone-white wear on their edges and dark joints, laid on the game's tiles (32 by 16 game
// pixels, two picture pixels to one), lit in the middle and falling into the dark at the edges: “Grey fog, bone white, no
// colour at all”, a step quieter than the figures on it. Nothing of the game imports it.

import { hash } from '../art/kit';

/** The floor as RGBA picture pixels, `w` by `h`, the tile grid's corner at (`ox`, `oy`); dark toward the edges if `dark`. */
export function towerFloor(w: number, h: number, ox = 0, oy = 0, dark = true): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  const TW = 64;
  const TH = 32;
  const stone = [[50, 49, 56], [54, 53, 60], [47, 46, 53], [57, 56, 62]];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // (which tile of the diamond grid, and where in it)
      const u = (x - ox) / TW + (y - oy) / TH;
      const v = (y - oy) / TH - (x - ox) / TW;
      const tu = Math.floor(u);
      const tv = Math.floor(v);
      const fu = u - tu;
      const fv = v - tv;
      const edge = Math.min(fu, fv, 1 - fu, 1 - fv);
      const k = Math.floor(hash(tu, tv, 9101) * stone.length);
      let [r, g, b] = stone[k];
      // (each flag worn a little paler toward its upper-left, the joints dark, a few bone-white chips)
      const lit = (1 - fu) * 0.5 + (1 - fv) * 0.5;
      r += 6 * lit;
      g += 6 * lit;
      b += 6 * lit;
      if (edge < 0.03) {
        r -= 12;
        g -= 12;
        b -= 11;
      } else if (edge < 0.06 && (fu < 0.06 || fv < 0.06)) {
        r += 10;
        g += 10;
        b += 9;
      } else if (hash(Math.floor(x / 2), Math.floor(y / 2), 9103) > 0.985) {
        r += 16;
        g += 15;
        b += 13;
      } else if (hash(Math.floor(x / 2), Math.floor(y / 2), 9104) > 0.97) {
        r -= 8;
        g -= 8;
        b -= 8;
      }
      if (dark) {
        const dx = (x - w / 2) / (w / 2);
        const dy = (y - h / 2) / (h / 2);
        const fall = Math.max(0.42, 1 - 0.5 * (dx * dx * 0.7 + dy * dy));
        r *= fall;
        g *= fall;
        b *= fall;
      }
      const i = (y * w + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = 255;
    }
  }
  return out;
}
