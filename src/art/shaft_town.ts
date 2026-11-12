// THE ENDLESS TOWN, THE SHAFT'S RIM: THE GAME'S OWN THINGS IN ITS STONE. Nothing is drawn here: this is what the art chat's
// pictures of the town were made with (its dev page, the Shaft's Rim's preview page under src/dev: the stone and the theme below are that
// page's, to the letter; his yes to those pictures, 11 Nov 2026, by 13:43: “Yes, hand it to main (Recommended)”), set where the
// game can reach it. Behind ENDLESS_TOWN (art/shaft_rim.ts), off.
//
//   RIM_THEME      the rim's stone: the town's stone at the top of the stair with no bottom (art/endless_stair.ts STONES, its
//                  last), a little violet in the night. The town's own things (makeTownProps) and the waypoint's dais
//                  (makeWaypointArt) are painted in it.
//   RIM_SLAB       the wordsmith's slab's stone, for its picture with the tablet's socket (art/shaft_props.ts paintSocketSlab).
//   RIM_SHADOWS    the soft shadow under each thing that stands, as the pictures have them (the dev page's `stand(..., shadow)`):
//                  how wide (tiles), by what stands.
//   rimShadow()    that shadow as a picture: black, 0.45 through its inner half, thinning to nothing at its edge.

import type { Sprite } from '../engine/px';
import type { Theme } from './ground';
import { stoneOf } from './props';
import type { SlabStone } from './shaft_props';

const STONE = ['#1c161e', '#3a3038', '#52444c', '#6e5e64', '#958474', '#ae9a88'] as const;

export const RIM_THEME: Theme = {
  id: 'shaftrim',
  mortar: STONE[0],
  slab: [STONE[1], STONE[2], STONE[3], STONE[4]],
  slabs: 1.6,
  cap: [STONE[0], STONE[3], STONE[4], STONE[4], STONE[5]],
  capLow: [STONE[0], STONE[2], STONE[3], STONE[3], STONE[4]],
  lit: [STONE[0], STONE[2], STONE[3], STONE[4], STONE[5]],
  shade: [STONE[0], STONE[1], STONE[2], STONE[3], STONE[4]],
};

export const RIM_SLAB: SlabStone = { stone: stoneOf(RIM_THEME), lit: RIM_THEME.lit, shade: RIM_THEME.shade };

/** The shadow under each thing that stands on the rim (tiles: its half breadth is 34 game pixels to one, its half height 17); none under what is not named. */
export const RIM_SHADOWS: Readonly<Record<string, number>> = {
  forge: 0.5,
  rack: 0.3,
  trough: 0.36,
  anvil: 0.36,
  armourer: 0.36,
  mystic: 0.36,
  tentTable: 0.3,
  wordsmith: 0.36,
  runeSlab: 0.36,
  runeStone: 0.3,
  lexicon: 0.36,
  stash: 0.36,
  stranger: 0.36,
  brazier: 0.3,
  torch: 0.22,
  gate: 0.9,
  record: 0.4,
  trophies: 0.9,
};

const made = new Map<number, Sprite>();
/** The soft shadow `r` tiles wide, laid with its middle on the foot of what throws it (made once for each breadth). */
export function rimShadow(r: number): Sprite {
  const had = made.get(r);
  if (had) return had;
  const w = Math.ceil(r * 34);
  const h = Math.ceil(r * 17);
  const cv = document.createElement('canvas');
  cv.width = (w * 2 + 1) * 2;
  cv.height = (h * 2 + 1) * 2;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  const im = g.createImageData(cv.width, cv.height);
  // (a game pixel a step, as the pictures' own: each two picture pixels by two)
  for (let y = -h; y <= h; y++) {
    for (let x = -w; x <= w; x++) {
      const n = Math.hypot((x + 0.5) / (r * 34), (y + 0.5) / (r * 17));
      if (n >= 1) continue;
      const a = Math.round(255 * 0.45 * (n < 0.5 ? 1 : 1 - (n - 0.5) / 0.5));
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) im.data[(((y + h) * 2 + j) * cv.width + (x + w) * 2 + i) * 4 + 3] = a;
    }
  }
  g.putImageData(im, 0, 0);
  const s: Sprite = { img: cv, w: w * 2 + 1, h: h * 2 + 1, ax: w, ay: h, density: 2 };
  made.set(r, s);
  return s;
}
