// SET 1's BAG PICTURES, LOOKED AT: each of the six (art/items_unique.ts paintUnique) beside its base's orange look, at the game's
// size and larger, for his look. Writes docs/mockups/set1_uniques/bag_<id>.png and a sheet of all six.
//   run: tsx tools/set1_peek.ts [out dir]
import { Px } from '../src/engine/px';
import { paintUnique, SET1_ART_IDS } from '../src/art/items_unique';
import { writePng } from './px_png';

const out = process.argv[2] ?? 'docs/mockups/set1_uniques';
const N = 32;
const sheet = new Px(SET1_ART_IDS.length * (N + 4) + 4, N + 8);
SET1_ART_IDS.forEach((id, i) => {
  const p = paintUnique(id)!;
  writePng(p, `${out}/bag_${id}.png`, 8);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = p.get(x, y);
    if (c) sheet.set(4 + i * (N + 4) + x, 4 + y, c);
  }
});
writePng(sheet, `${out}/bag_all.png`, 6);
console.log('written', SET1_ART_IDS.join(', '));
