// THE FIRST FIVE FLOORS' NEW LOOKS, AS THE RENDERER ASKS THEM (render.ts): floor 1's king's tomb (render/tomb.ts), floor 3's black
// iron prison (render/prison.ts), floor 4's buried chapel of bones (render/chapel.ts), floor 5's mine that becomes his temple
// (render/lair.ts); and the first town's castle hall (render/castle.ts): the art chat's, each behind its switch, off until his yes
// to it in play. Each draws its floor in place of the Crypt's: its flags and its own tiles, its
// walls, its dark and its lights, and what it stands on the floor of its own.

import type { Sprite } from '../engine/px';
import type { Level } from '../game/state';

/** Where a light burns: its floor point (tiles), how far up from it and across (game pixels), the hole's radius and strength, its glow. */
export interface LookLight {
  x: number;
  y: number;
  up: number;
  dx?: number;
  r: number;
  strength: number;
  glow: { r: number; color: string; a: number } | null;
  /** A steady light, the day's (no flicker, as a fire has). */
  still?: boolean;
}
/** What a look stands on the floor: a floor point, its picture, its depth (x + y if none). */
export interface LookStand {
  x: number;
  y: number;
  s: Sprite;
  d?: number;
  /** Drawn added to what is under it ('lighter'), as light is: floor 1's daylight. */
  add?: boolean;
}
export interface LookView {
  /** The dark between its lights (the Crypt's is FAR_DARK, 0.88), and its colour if not the Crypt's (6, 4, 14). */
  readonly dark: number;
  readonly tint?: readonly [number, number, number];
  /** Its vignette, if not the game's (the first town's castle hall: a day's, 0.26). */
  readonly vignette?: number;
  /**
   * THE PLACE IS STEADY, AND SEEN WHOLE (the castle's hall): what it draws behind everything (`back`) and its floor's tiles
   * (`laid`, `flags`) are the same pictures at every moment while the place is stood in, and its steady lights (`still`) are
   * all lit from the first. The renderer may then lay each of them once into one picture and draw that in their place: the
   * floor (render/still_floor.ts), the steady glows (render/still_glows.ts), the dark with the steady lights' holes
   * (render/still_dark.ts). A look that does not say so is drawn piece by piece, as ever.
   */
  readonly steady?: boolean;
  /** Is this look to be drawn on this level? */
  on(L: Level): boolean;
  /** Let its pictures go (another floor is come into). */
  forget?(): void;
  /** Make its pictures now (as the floor is come into). */
  warm(): void;
  /** One of its own floor tiles at (tx, ty), or null (`t` the clock). */
  laid(L: Level, tx: number, ty: number, t: number): Sprite | null;
  /** Its flags at (tx, ty). */
  flags(tx: number, ty: number): Sprite;
  /** The face of wall tile (tx, ty): `left` the face turned to screen-left (a wall along x). */
  face(L: Level, left: boolean, tx: number, ty: number, t: number): Sprite;
  /** The faces of wall tile `i` to draw (`which`, render/walls.ts wallFaces): none where a picture of its own takes their place. */
  unfaced(L: Level, i: number, which: number): number;
  /** What it sets in a wall's faces besides (the prison's fire baskets): `put(picture, side)`. */
  walls?(L: Level, i: number, faces: number, t: number, put: (s: Sprite, side: 0 | 1) => void): void;
  /** One of the game's own pictures (a slanting wall) in its colours. */
  graded(s: Sprite): Sprite;
  /** Where the dark is cut. */
  lights(L: Level): readonly LookLight[];
  /** What it stands on the floor, at clock `t`. */
  stands(L: Level, t: number): readonly LookStand[];
  /** What it lays flat over the floor, after the floor's tiles and what lies on them, before anything stands (floor 1's pools of daylight, the town's slats of sun). */
  flats?(L: Level, t: number): readonly LookStand[];
  /** What it draws behind everything, before the floor (the first town's roof over the dark above its back walls). */
  back?(L: Level, t: number): readonly LookStand[];
}

/** One of the game's own pictures with each of its colours put through `grade` (a canvas the page paints on; where there is none, the picture as it is). */
export function gradeOnPage(s: Sprite, grade: (hex: string) => string): Sprite {
  try {
    const src = s.img as unknown as CanvasImageSource & { width: number; height: number };
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const g = c.getContext('2d');
    if (!g || !c.width || !c.height) return s;
    g.drawImage(src, 0, 0);
    const im = g.getImageData(0, 0, c.width, c.height);
    const d = im.data;
    const memo = new Map<number, number>();
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
      let v = memo.get(key);
      if (v === undefined) memo.set(key, (v = parseInt(grade(`#${key.toString(16).padStart(6, '0')}`).slice(1, 7), 16)));
      d[i] = (v >> 16) & 255;
      d[i + 1] = (v >> 8) & 255;
      d[i + 2] = v & 255;
    }
    g.putImageData(im, 0, 0);
    return { ...s, img: c };
  } catch {
    return s;
  }
}
