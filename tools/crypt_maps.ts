// THE CRYPT'S FLOORS AS MAPS (game/dungeon.ts, CRYPT_LAYOUT): each of the five floors laid with its
// layout on, and one with it off for comparison, written out as JSON for tools/crypt_pictures.py.
// Not a test. The seeds are the map-maker's for a run's floors (tools/scenarios/crypt_cells.mjs logs them).
//   tsx tools/crypt_maps.ts out.json 1:176031 2:280791 3:385551 4:490311 5:595071 4:490311:off
import { writeFileSync } from 'node:fs';
import { generateFloor, CRYPT_LAYOUT } from '../src/game/dungeon';
import { doorTiles } from '../src/game/doors';

const [out, ...specs] = process.argv.slice(2);
const floors = specs.map((spec) => {
  const [d, seed, off] = spec.split(':');
  CRYPT_LAYOUT.on = off !== 'off';
  const f = generateFloor(Number(d), Number(seed));
  CRYPT_LAYOUT.on = false;
  return {
    depth: f.depth,
    seed: f.seed,
    on: off !== 'off',
    w: f.w,
    h: f.h,
    tiles: Array.from(f.tiles),
    rooms: f.rooms.map((r) => ({ x: r.x, y: r.y, w: r.w, h: r.h, kind: r.kind, cell: !!r.cell, block: !!r.block })),
    doors: (f.doors ?? []).map((d) => ({ kind: d.kind, tile: doorTiles(f, d)[1] })),
    start: f.start,
    boss: f.boss,
  };
});
writeFileSync(out, JSON.stringify(floors));
console.log(`${floors.length} floors written to ${out}`);
