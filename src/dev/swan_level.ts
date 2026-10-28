// A CORNER OF THE SWAN GARDENS LAID BY HAND on the game's tiles, as the first look was painted (dev/garden_paint.ts), for
// the dev pages and the checks: how a level of floor 16 may be laid with its ground (art/swangardens.ts) and its pieces
// (art/floor16.ts). How the real floor is laid is the main chat's. Nothing of the game imports it.
//
// The game walks on one level: a terrace's wall is a row of tiles that are floor, a wall piece on each (its face filling
// the row), the stairs up it two rows deep (the wall's row and the one below it). The top terrace is the maze's; its
// hedges, and the tall hedges round the gardens, are the tiles that are neither floor nor lake.

import { T_FLOOR, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import type { SwanLand } from '../art/swangardens';
import { hash } from '../art/kit';

export const LW = 48;
export const LH = 46;
/** The gardens' left edge (x) and back (y): tall hedge past them. */
export const L_LEFT = 10;
export const L_BACK = 4;
/** The maze: its corner, its cells (corridors two tiles wide, hedges one), across and deep; the way in, the middle cell. */
export const MZ = { x0: 15, y0: 4, nx: 7, ny: 3, pitch: 3 };
/** The terraces' walls (rows of y), and the stairs up them (x from SX0 to SX1). */
export const WALL2 = 16;
export const WALL1 = 26;
export const SX0 = 25;
export const SX1 = 27;
/** The fountain, in the middle of the parterre. */
export const FTN = { x: 26, y: 21.5, r: 1.7 };
/** The parterre's four beds (x0, x1, y0, y1); the fourth gone over to nettles. */
export const L_BEDS: readonly (readonly [number, number, number, number])[] = [
  [19, 23, 18, 20],
  [29, 33, 18, 20],
  [19, 23, 23, 25],
  [29, 33, 23, 25],
];
export const L_NETTLE_BED = 3;
/** The lake walk; the bed of nettles by it; the lake (rows of tiles), its island. */
export const L_WALK = { y0: 28, y1: 29.4 };
export const L_NETTLES = { x0: 12.5, x1: 17, y0: 29.6, y1: 30.9 };
export const L_LAKE = { y0: 32, y1: 39 };
export const L_ISLAND = { x: 36, y: 35.5, r: 2.6 };
/** The near shore, and the hedge past it. */
export const L_SHORE = 42;
/** The eleven swans on the lake (the first look's), and which way each faces: a long loose line, like a white ribbon. */
export const L_SWANS: readonly (readonly [number, number, 1 | -1])[] = [
  [16.2, 33.9, 1], [18.3, 34.2, 1], [20.4, 34.0, 1], [22.6, 34.5, 1], [24.9, 34.7, 1], [27.0, 34.4, 1],
  [40.5, 34.0, -1], [42.6, 34.4, -1], [44.9, 34.2, -1], [26.4, 37.6, -1], [21.0, 38.0, 1],
];
/** Where the hero stands: on the lake walk at the foot of the stair. */
export const L_HERO: readonly [number, number] = [26.4, 28.7];

/** The maze's hedges (true where a hedge stands), found the same every time. */
function mazeHedge(): (tx: number, ty: number) => boolean {
  const { x0, y0, nx, ny, pitch } = MZ;
  const openE = new Uint8Array(nx * ny);
  const openS = new Uint8Array(nx * ny);
  const seen = new Uint8Array(nx * ny);
  // (cells i across, j from the back: the way in is in the front row's middle cell)
  const start = (ny - 1) * nx + Math.floor(nx / 2);
  const stack = [start];
  seen[start] = 1;
  let r = 0;
  while (stack.length) {
    const c = stack[stack.length - 1];
    const i = c % nx;
    const j = Math.floor(c / nx);
    const nb: [number, number][] = [];
    if (i > 0 && !seen[c - 1]) nb.push([c - 1, 0]);
    if (i < nx - 1 && !seen[c + 1]) nb.push([c + 1, 1]);
    if (j > 0 && !seen[c - nx]) nb.push([c - nx, 2]);
    if (j < ny - 1 && !seen[c + nx]) nb.push([c + nx, 3]);
    if (!nb.length) {
      stack.pop();
      continue;
    }
    const [to, dir] = nb[Math.floor(hash(r++, c, 7161) * nb.length)];
    if (dir === 0) openE[to] = 1;
    else if (dir === 1) openE[c] = 1;
    else if (dir === 2) openS[to] = 1;
    else openS[c] = 1;
    seen[to] = 1;
    stack.push(to);
  }
  return (tx, ty) => {
    const u = tx - x0;
    const v = ty - y0;
    if (u < 0 || v < 0 || u > nx * pitch || v > ny * pitch) return false;
    const onX = u % pitch === 0;
    const onY = v % pitch === 0;
    const i = Math.floor(u / pitch);
    const j = Math.floor(v / pitch);
    if (onX && onY) return true;
    if (onY) {
      // a hedge along x at the back of row j (between row j - 1 and j); the front's broken for the way in
      if (j === 0) return true;
      if (j === ny) return i !== Math.floor(nx / 2);
      return !openS[(j - 1) * nx + i];
    }
    if (onX) {
      if (i === 0 || i === nx) return true;
      return !openE[j * nx + i - 1];
    }
    return false;
  };
}

/** Is a tile the lake? */
export function lakeTile(tx: number, ty: number): boolean {
  if (ty < L_LAKE.y0 || ty >= L_LAKE.y1 || tx < L_LEFT) return false;
  return true;
}

/** The level's tiles: floor, the lake and the yew (not floor); the island's edge and the maze's corners as the shape rounds them. */
export function swanFloor(): Floor {
  const tiles = new Uint8Array(LW * LH).fill(T_WALL);
  const cut = new Uint8Array(LW * LH);
  const hedge = mazeHedge();
  for (let ty = 0; ty < LH; ty++) {
    for (let tx = 0; tx < LW; tx++) {
      const i = ty * LW + tx;
      let floor = tx >= L_LEFT && ty >= L_BACK && ty < L_SHORE;
      if (hedge(tx, ty)) floor = false;
      if (ty >= L_LAKE.y0 && ty < L_LAKE.y1) floor = false;
      if (!floor) continue;
      tiles[i] = T_FLOOR;
      // (the island round: each tile at its edge whole or cut, whichever fits the round best)
    }
  }
  return { depth: 16, seed: 16, w: LW, h: LH, tiles, cut, variant: new Uint8Array(LW * LH), rooms: [], start: { x: L_HERO[0], y: L_HERO[1] } } as unknown as Floor;
}

/** What only this level knows, for its ground. */
export function swanLand(): SwanLand {
  const P = { x0: 18.5, x1: 33.5, y0: 17.5, y1: 25.5 };
  return {
    lake: lakeTile,
    walk: (x, y) => {
      // the maze's ways and the top terrace's front walk; the parterre's gravel, its middle walk and cross walk; the lake walk
      if (y < WALL2) return true;
      if (y >= L_WALK.y0 && y < L_WALK.y1) return true;
      if (x >= SX0 - 1 && x < SX1 && y < WALL1 + 2) return true;
      if (y >= WALL2 && y < WALL1) {
        if (x > P.x0 && x < P.x1 && y > P.y0 && y < P.y1) return true;
        if (y >= 21 && y < 22) return true;
      }
      if (y >= L_WALK.y1 && y < L_LAKE.y0 && x >= SX0 - 0.5 && x < SX1 + 0.5) return false;
      return false;
    },
    paved: (x, y) => {
      if (Math.hypot(x - FTN.x, y - FTN.y) < FTN.r + 0.55) return true;
      // (the rows of the terraces' walls, under their pieces, and the stairs' heads)
      return (y >= WALL2 && y < WALL2 + 1) || (y >= WALL1 && y < WALL1 + 1);
    },
    bed: (x, y) => L_BEDS.some((b, k) => k !== L_NETTLE_BED && x > b[0] && x < b[1] && y > b[2] && y < b[3]),
    nettles: (x, y) => {
      const b = L_BEDS[L_NETTLE_BED];
      const a = Math.min(x - b[0], b[1] - x, y - b[2], b[3] - y);
      const N = L_NETTLES;
      const c = Math.min(x - N.x0, N.x1 - x, y - N.y0, N.y1 - y);
      return Math.max(a, c);
    },
  };
}
