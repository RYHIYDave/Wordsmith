// ENDLESS MODE'S KEY (src/art/endless_tablet.ts), big, for whoever paints it: no browser.
//   npx tsx tools/endless_tablet_peek.ts <what> <out.png> [scale]
// what: quarters (the four as items, beside the game's own items at their rarities), socket (the bench with none, some, all four
// set, and the four burning, frame by frame), sockettrue (the same at the game's size, three to a game pixel as a phone shows it).
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { QUARTER_N, SOCKET_LIT_FRAMES, paintQuarter, paintSocketTablet } from '../src/art/endless_tablet';
import { paintItemA } from '../src/art/items_a';
import { paintSocketSlab } from '../src/art/shaft_props';
import { RIM_SLAB } from '../src/art/shaft_town';
import { png } from './king_png';

const what = process.argv[2] ?? 'quarters';
const out = process.argv[3] ?? 'peek.png';
const k = Number(process.argv[4] ?? 6);
const BG = '#0e0c24';
const FLOOR = '#2a2228';
type Cell = { px: Px; bg?: string };
function sheet(rows: Cell[][], cw: number, ch: number, kk = k): Px {
  const per = Math.max(...rows.map((r) => r.length));
  const s = new Px(per * (cw * kk + 6) + 6, rows.length * (ch * kk + 6) + 6);
  s.rect(0, 0, s.w, s.h, '#1a1648');
  rows.forEach((row, j) =>
    row.forEach((c, i) => {
      const bx = 6 + i * (cw * kk + 6);
      const by = 6 + j * (ch * kk + 6);
      s.rect(bx, by, cw * kk, ch * kk, c.bg ?? BG);
      const ox = Math.floor((cw - c.px.w) / 2);
      const oy = Math.floor((ch - c.px.h) / 2);
      for (let y = 0; y < c.px.h; y++) for (let x = 0; x < c.px.w; x++) { const col = c.px.get(x, y); if (col) s.rect(bx + (ox + x) * kk, by + (oy + y) * kk, kk, kk, col); }
    }),
  );
  return s;
}
const slabStone = RIM_SLAB;
const benchWith = (held: boolean[], lit: number, frame = 0): Px => {
  const slab = paintSocketSlab(slabStone, frame);
  const t = paintSocketTablet(held, lit);
  const p = new Px(t.px.w, t.px.h);
  p.blit(slab.px, t.ox - slab.ox, t.oy - slab.oy);
  p.blit(t.px, 0, 0);
  return p;
};
let s: Px;
if (what === 'quarters') {
  const row1: Cell[] = [0, 1, 2, 3].map((q) => ({ px: paintQuarter(q) }));
  const row2: Cell[] = (['ring', 'amulet', 'tome', 'helm'] as const).map((kind) => ({ px: paintItemA(kind, 3) }));
  s = sheet([row1, row2], QUARTER_N, QUARTER_N);
} else if (what === 'socket') {
  const rows: Cell[][] = [
    [[false, false, false, false], [true, false, false, false], [true, true, false, true], [true, true, true, true]].map((h) => ({ px: benchWith(h, -1), bg: FLOOR })),
    [0, 3, 9, 15, 21, 27].map((f) => ({ px: benchWith([true, true, true, true], f), bg: FLOOR })),
    [28, 30, 33, 37, 42, 48].map((f) => ({ px: benchWith([true, true, true, true], f), bg: FLOOR })),
    [54, 62, 70, 80, 90, SOCKET_LIT_FRAMES + 10].map((f) => ({ px: benchWith([true, true, true, true], f), bg: FLOOR })),
  ];
  s = sheet(rows, 68, 140);
} else {
  s = sheet([[0, 30, 60].map((f) => ({ px: benchWith([true, true, true, true], f), bg: FLOOR }))], 68, 140, 3);
}
writeFileSync(out, png(s));
console.log(out, s.w, s.h);
