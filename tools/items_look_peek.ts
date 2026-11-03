// THE NEW ITEM PICTURES: a quick look at every one painted so far, big, in each style (for whoever is painting them).
//   npx tsx tools/items_look_peek.ts <out.png> [scale]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { LOOK_N, LOOK_READY, LOOK_STYLES, paintItemLook } from '../src/dev/items_look';
import { png } from './king_png';

const out = process.argv[2] ?? 'peek.png';
const k = Number(process.argv[3] ?? 6);
const kinds = LOOK_READY();
const only = (process.argv[4] ?? 'ABC').split('') as typeof LOOK_STYLES[number][];
const per = 6;
const rowsPer = Math.ceil(kinds.length / per);
const cell = LOOK_N * k + 8;
const sheet = new Px(cell * per + 8, (cell + 8) * rowsPer * only.length + LOOK_N * 2 + 30);
sheet.rect(0, 0, sheet.w, sheet.h, '#1a1648');
const blit = (p: Px, x0: number, y0: number, s: number): void => {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const c = p.get(x, y);
    if (c) sheet.rect(x0 + x * s, y0 + y * s, s, s, c);
  }
};
only.forEach((st, r) => {
  kinds.forEach((kind, i) => {
    const x0 = 8 + (i % per) * cell, y0 = 8 + (r * rowsPer + Math.floor(i / per)) * (cell + 8);
    sheet.rect(x0 - 2, y0 - 2, LOOK_N * k + 4, LOOK_N * k + 4, '#0e0c24');
    blit(paintItemLook(kind, st, st === 'B' ? 2 : 0), x0, y0, k);
  });
});
// the rarities of the sword, small, at 2 to a picture pixel
const y1 = 8 + only.length * rowsPer * (cell + 8);
only.forEach((st, r) => {
  for (let rar = 0; rar < 4; rar++) {
    const x0 = 8 + (r * 4 + rar) * (LOOK_N * 2 + 10);
    sheet.rect(x0 - 2, y1 - 2, LOOK_N * 2 + 4, LOOK_N * 2 + 4, '#0e0c24');
    blit(paintItemLook('sword', st, rar as 0 | 1 | 2 | 3), x0, y1, 2);
  }
});
writeFileSync(out, png(sheet));
console.log(out, sheet.w, sheet.h);
