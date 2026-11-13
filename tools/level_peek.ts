// THE TWENTY LEVELING UNIQUES' BAG PICTURES, LOOKED AT (art/items_unique.ts LEVEL_PAINTERS, switched on for this only): each at
// eight times, and their names, levels and cards as JSON, for his page. Writes docs/mockups/level_uniques_art/bag_<id>.png.
//   run: tsx tools/level_peek.ts [out dir]
import { LEVEL_ART, LEVEL_ART_IDS, paintUnique } from '../src/art/items_unique';
import { LEVEL_DEFS, uniqueLines } from '../src/game/uniques';
import { writePng } from './px_png';
// @ts-ignore
import { writeFileSync } from 'node:fs';

const out = process.argv[2] ?? 'docs/mockups/level_uniques_art';
LEVEL_ART.on = true;
for (const id of LEVEL_ART_IDS) writePng(paintUnique(id)!, `${out}/bag_${id}.png`, 8);
const cards = LEVEL_DEFS.map((d) => ({ id: d.id, name: d.name, level: d.level, cls: d.cls ?? null, lines: uniqueLines(d, d.cls ?? 'warrior').filter((l) => l.kind === 'does' || l.kind === 'price').map((l) => l.text) }));
writeFileSync(`${out}/cards.json`, JSON.stringify(cards, null, 1));
console.log('written', LEVEL_ART_IDS.length);
