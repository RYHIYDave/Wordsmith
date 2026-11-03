// THE NEW ITEM PICTURES, STYLE A (src/art/items_a.ts): every kind at its four rarities, big, for whoever paints them.
//   npx tsx tools/items_a_peek.ts <out.png> [scale] [kinds,comma,separated]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { ITEM_A_KINDS, ITEM_A_N, paintItemA } from '../src/art/items_a';
import type { ItemAKind } from '../src/art/items_a';
import { png } from './king_png';

const out = process.argv[2] ?? 'peek.png';
const k = Number(process.argv[3] ?? 4);
const kinds = (process.argv[4] ? process.argv[4].split(',') : [...ITEM_A_KINDS]) as ItemAKind[];
const cell = ITEM_A_N * k + 6;
const per = 2; // kinds to a row, each with its four rarities
const rows = Math.ceil(kinds.length / per);
const sheet = new Px(per * (4 * cell + 14) + 6, rows * (cell + 6) + 6);
sheet.rect(0, 0, sheet.w, sheet.h, '#1a1648');
kinds.forEach((kind, i) => {
  const x0 = 6 + (i % per) * (4 * cell + 14), y0 = 6 + Math.floor(i / per) * (cell + 6);
  for (let r = 0; r < 4; r++) {
    const p = paintItemA(kind, r as 0 | 1 | 2 | 3);
    const bx = x0 + r * cell;
    sheet.rect(bx, y0, ITEM_A_N * k, ITEM_A_N * k, '#0e0c24');
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c) sheet.rect(bx + x * k, y0 + y * k, k, k, c); }
  }
});
writeFileSync(out, png(sheet));
console.log(out, sheet.w, sheet.h);
