// THE FOREST AS A FEW PICTURES (speed only: what is on the screen is the same, to the pixel).
//
// The Pinewood's trees stand on a grid twelve game pixels by nine, each a tree up to 125 wide and 118 tall: some 1,300
// of them on the screen at once, laid over each other about a hundred deep, every one drawn every frame. (Measured, 17
// Oct 2026: 1,373 pictures a frame covering 99 screens, against 400 and 5 to 8 screens on the other floors; the slowest
// place in the game.) Nearly all of them stand where nothing ever comes between them; so they are laid down here once,
// in their order, into pictures, and the pictures drawn in their place.
//
// HOW, SO THAT NOTHING CHANGES: what stands is drawn back to front by its depth (x + y). The trees are cut into SLABS by
// their depth (SLAB deep) and the screen into COLUMNs; the trees of one slab in one column are one picture (a CHUNK),
// laid down back to front as the game lays them (by depth, and in the order the game came to them where two are as
// deep). A chunk's picture is drawn where the first of its slab would be: before anything deeper, after anything less
// deep. Every tree picture is either wholly solid or wholly clear at each pixel (measured), so laying them into a
// picture first and that picture on the screen is the same as laying each on the screen.
// A chunk is drawn as its trees, one by one (each cut to its column, so that its neighbour's picture is untouched), when:
//   - something else that stands this frame (a monster, the hero, a prop, a shot) is in its slab and overlaps one of
//     its trees that is deeper than it (the picture would be under it where that tree should be over it);
//   - one of its trees is seen through this frame (someone behind it: the game's SEEN_THROUGH);
//   - its picture is not made yet (a few are made each frame, the rest as the camera comes to them).
// Its trees then are drawn exactly as before. (render/render.ts, standTops and resolveTops.)

import type { Sprite } from '../engine/px';
import type { Top } from './act1_pieces';

/** The switch, and the floors it is used on (the descent's: the Pinewood, the forest; the others draw a few hundred things a frame). */
export const TOPS_CACHE = {
  on: true,
  floors: new Set<number>([9]),
  /** How deep a slab is (tiles of x + y): its trees are one picture a column. */
  slab: 4,
  /** How wide a column is (game pixels). */
  column: 64,
};
/** Chunks kept that have not been near the screen for this many frames are let go of. */
const KEEP_FRAMES = 240;

/** A tree as the chunk holds it: where it is drawn relative to the camera (game pixels), its depth, and the game's order. */
export interface CachedTree {
  top: Top;
  d: number;
  /** Its anchor, relative to the camera (the screen's (cam.ox, cam.oy)). */
  sx: number;
  sy: number;
  /** Its picture's box, likewise. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** The order the game comes to it in (for two as deep). */
  order: number;
}

export interface Chunk {
  key: number;
  s: number;
  c: number;
  trees: CachedTree[];
  /** Its picture (null: not made yet, or nothing in it). */
  sp: Sprite | null;
  /** Its box, relative to the camera (game pixels). */
  x0: number;
  y0: number;
  w: number;
  h: number;
  /** The frame it was last near the screen. */
  used: number;
}

export const chunkKey = (s: number, c: number): number => (s + 32768) * 65536 + (c + 32768);

export class TopsCache {
  private chunks = new Map<number, Chunk>();
  private owner: unknown = null;
  /** The slab and column the chunks held were cut to. */
  private cut = '';
  /** For measuring: chunks made, drawn as pictures and drawn as their trees this frame; trees drawn one by one this frame. */
  readonly stats = { made: 0, pictures: 0, fell: 0, trees: 0, held: 0 };

  /** This frame's floor: a new one lets go of every picture of the last. */
  begin(owner: unknown): void {
    const cut = `${TOPS_CACHE.slab}/${TOPS_CACHE.column}`;
    if (owner === this.owner && cut === this.cut) return;
    this.clear();
    this.owner = owner;
    this.cut = cut;
  }

  /** Drawn without the chunks on this floor: those of another floor let go of. */
  leave(owner: unknown): void {
    if (owner !== this.owner && this.chunks.size > 0) this.clear();
  }

  clear(): void {
    for (const ch of this.chunks.values()) drop(ch);
    this.chunks.clear();
    this.owner = null;
    this.stats.held = 0;
  }

  /** The chunk of slab `s`, column `c`: its trees gathered the first time it is asked for (`gather`), sorted as the game draws them. */
  chunk(s: number, c: number, frame: number, gather: (s: number, c: number) => CachedTree[]): Chunk {
    const key = chunkKey(s, c);
    let ch = this.chunks.get(key);
    if (!ch) {
      const trees = gather(s, c).sort((a, b) => a.d - b.d || a.order - b.order);
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const t of trees) {
        if (t.y0 < y0) y0 = t.y0;
        if (t.y1 > y1) y1 = t.y1;
      }
      const top = trees.length ? Math.floor(y0) : 0;
      ch = { key, s, c, trees, sp: null, x0: c * TOPS_CACHE.column, y0: top, w: TOPS_CACHE.column, h: trees.length ? Math.ceil(y1) - top : 0, used: frame };
      this.chunks.set(key, ch);
    }
    ch.used = frame;
    return ch;
  }

  /** Lay a chunk's trees into its picture (`res`: picture pixels a game pixel, the screen's). */
  paint(ch: Chunk, res: number): void {
    if (ch.sp || ch.trees.length === 0 || typeof document === 'undefined') return;
    const cv = document.createElement('canvas');
    cv.width = ch.w * res;
    cv.height = ch.h * res;
    const g = cv.getContext('2d');
    if (!g) return;
    g.setTransform(res, 0, 0, res, 0, 0);
    g.imageSmoothingEnabled = false;
    for (const t of ch.trees) {
      const sp = t.top.sp;
      g.drawImage(sp.img, t.x0 - ch.x0, t.y0 - ch.y0, sp.w, sp.h);
    }
    ch.sp = { img: cv, w: ch.w, h: ch.h, ax: 0, ay: 0, density: res };
    this.stats.made++;
    this.stats.held++;
  }

  /** Let go of the chunks that have not been near the screen for a while. */
  forget(frame: number): void {
    for (const [key, ch] of this.chunks) {
      if (frame - ch.used <= KEEP_FRAMES) continue;
      if (ch.sp) this.stats.held--;
      drop(ch);
      this.chunks.delete(key);
    }
  }
}

function drop(ch: Chunk): void {
  if (!ch.sp) return;
  ch.sp.img.width = 0;
  ch.sp.img.height = 0;
  ch.sp = null;
}
