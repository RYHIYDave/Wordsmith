// Where the Swan Gardens' pieces (art/floor16.ts) stand on the level laid by hand (dev/swan_level.ts), for the dev pages,
// laid as art/floor16.ts says the game may lay them. Nothing of the game imports it.
import type { Sprite } from '../engine/px';
import { swanGardensPieces } from '../art/floor16';
import type { Piece } from '../art/floorkit';
import { FTN, L_BEDS, L_ISLAND, L_LEFT, L_NETTLE_BED, LW, SX0, WALL1, WALL2 } from './swan_level';

export interface Laid { d: number; s: Sprite; x: number; y: number; shadow: number; under?: boolean; name: string }

/** Every piece laid on the level. */
export function laySwanPieces(): Laid[] {
  const P = swanGardensPieces();
  const of = (n: string): Piece => {
    const p = P.find((q) => q.name === n);
    if (!p) throw new Error(`no piece named ${n}`);
    return p;
  };
  const out: Laid[] = [];
  const put = (n: string, x: number, y: number, f = 0, under = false, d = x + y): void => {
    const p = of(n);
    out.push({ d, s: p.frames![f], x, y, shadow: p.shadow ?? 0, under, name: n });
  };
  // THE TERRACES' WALLS: a wall on each tile of the row; the stair's feet on (SX0, R + 1) and (SX0 + 1, R + 1); the row
  // open from SX0 - 1 to SX0 + 1, a pier either side of that
  for (const R of [WALL2, WALL1]) {
    for (let x = L_LEFT; x < LW; x++) {
      if (x >= SX0 - 1 && x <= SX0 + 1) continue;
      put(x === SX0 - 2 || x === SX0 + 2 ? "a stair's pier" : 'a terrace wall', x + 0.5, R + 0.5);
    }
    put('the terrace stair', SX0 + 0.5, R + 1.5, 0, true);
    put('the terrace stair', SX0 + 1.5, R + 1.5, 0, true);
  }
  // THE PARTERRE: the fountain; in three beds, roses edged with box; the fourth gone over to nettles
  put('the still fountain', FTN.x, FTN.y);
  L_BEDS.forEach((b, k) => {
    for (let y = b[2]; y < b[3]; y++) {
      for (let x = b[0]; x < b[1]; x++) {
        if (k === L_NETTLE_BED) put('nettles', x + 0.5, y + 0.5, (x + y) % 5 === 0 ? 1 : 0, false);
        else put('a rose bush', x + 0.5, y + 0.5);
      }
    }
    if (k === L_NETTLE_BED) return;
    for (let x = b[0] - 1; x <= b[1]; x++) {
      put('box edging', x + 0.5, b[2] - 0.5, 0);
      put('box edging', x + 0.5, b[3] + 0.5, 0);
    }
    for (let y = b[2]; y < b[3]; y++) {
      put('box edging', b[0] - 0.5, y + 0.5, 1);
      put('box edging', b[1] + 0.5, y + 0.5, 1);
    }
  });
  // yew cones against the walls' feet; bay trees at the parterre's corners; urns of roses at its near corners
  for (const x of [19.5, 21.5, 30.5, 32.5, 14.5, 37.5]) put('a yew cone', x, WALL2 + 1.5);
  for (const x of [17.5, 21.5, 31.5, 35.5, 13.5, 40.5]) put('a yew cone', x, WALL1 + 1.5);
  put('a bay tree in its tub', 17.5, 18.5);
  put('a bay tree in its tub', 35.5, 18.5);
  put('an urn of roses', 17.5, 24.5);
  put('an urn of roses', 35.5, 24.5, 1);
  // the rose arbours over the cross walk and the lake walk
  put('a rose arbour', 15.0, 21.5, 0);
  put('a rose arbour', 38.0, 21.5, 0);
  put('a rose arbour', 18.6, 28.7, 0);
  // statues, a sundial, a topiary swan on the middle terrace's lawns
  put('a topiary swan', 12.5, 23.5);
  put('a sundial', 12.5, 19.5);
  put('a stone swan on its plinth', 41.5, 21.5);
  // the maze's way in: a gate in it, standing open; the gardeners' things on the top walk
  put('a garden gate', 26.0, 13.5, 1);
  put("a gardener's barrow", 20.5, 14.6);
  put('clippings and shears', 19.0, 14.5, 0, true);
  // by the lake: lanterns at the stair's foot, the nettles, the bench and the shirt she left, the landing, the nest
  put('a lantern on a post', 23.5, 27.5);
  put('a lantern on a post', 28.5, 27.5);
  for (let x = 12; x < 17; x++) put('nettles', x + 0.5, 30.5, x === 14 ? 1 : 0);
  put('a stone bench', 29.5, 31.4, 0);
  put('a nettle shirt, half woven', 32.4, 31.3, 0, true);
  put('trodden nettles, for their flax', 34.5, 31.4, 0, true);
  put('a boat at the landing', 19.5, 31.3);
  put("a swan's nest", 41.5, 31.4);
  put('swan feathers', 40.0, 30.8, 0, true);
  put('swan feathers', 25.0, 30.9, 0, true);
  // THE SWAN PAVILION on its island, standing in the lake
  put('the Swan Pavilion on its island', L_ISLAND.x, L_ISLAND.y);
  return out;
}
