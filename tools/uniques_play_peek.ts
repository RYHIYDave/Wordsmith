// WHAT THE UNIQUE ITEMS SHOW IN PLAY (src/art/unique_play_art.ts), big, for whoever paints them: no browser.
//   npx tsx tools/uniques_play_peek.ts <what> <out.png> [scale]
// what: tome (the book every way round, at every frame of its beat), flames (its fire's tongues), touch (its fire on the one it
// touches), brand (the brand under the risen elite, turning, its time running out), cracks (the floor where it rose),
// globes (the Brawler's four).
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { BRAND, RISE_CRACKS, TOME, TOME_FLAME, TOME_TOUCH_FRAMES, paintBrand, paintRiseCracks, paintTome, paintTomeFlame, paintTomeTouch } from '../src/art/unique_play_art';
import { paintGlobes } from '../src/dev/veteran_globes';
import type { Globe } from '../src/dev/veteran_globes';
import { png } from './king_png';

const what = process.argv[2] ?? 'tome';
const out = process.argv[3] ?? 'peek.png';
const k = Number(process.argv[4] ?? 6);
/** The game's floor, about: so a picture is judged on what it will be seen on. */
const FLOOR = '#1c1a4a';
type Cell = { px: Px; ax?: number; ay?: number };
function sheet(rows: Cell[][], cw: number, ch: number): Px {
  const per = Math.max(...rows.map((r) => r.length));
  const s = new Px(per * (cw * k + 6) + 6, rows.length * (ch * k + 6) + 6);
  s.rect(0, 0, s.w, s.h, '#0e0c24');
  rows.forEach((row, j) =>
    row.forEach((c, i) => {
      const bx = 6 + i * (cw * k + 6);
      const by = 6 + j * (ch * k + 6);
      s.rect(bx, by, cw * k, ch * k, FLOOR);
      const ox = Math.floor((cw - c.px.w) / 2);
      const oy = Math.floor((ch - c.px.h) / 2);
      for (let y = 0; y < c.px.h; y++) for (let x = 0; x < c.px.w; x++) { const col = c.px.get(x, y); if (col) s.rect(bx + (ox + x) * k, by + (oy + y) * k, k, k, col); }
    }),
  );
  return s;
}
let s: Px;
if (what === 'tome') {
  const rows: Cell[][] = [];
  for (let f = 0; f < TOME.flaps; f += 2) rows.push([...Array(TOME.headings).keys()].filter((h) => h % 2 === 0).map((h) => ({ px: paintTome(h, f) })));
  s = sheet(rows, TOME.w, TOME.h);
} else if (what === 'tomeall') {
  const rows: Cell[][] = [];
  for (let f = 0; f < TOME.flaps; f++) rows.push([...Array(TOME.headings).keys()].map((h) => ({ px: paintTome(h, f) })));
  s = sheet(rows, TOME.w, TOME.h);
} else if (what === 'flames') {
  const rows: Cell[][] = TOME_FLAME.sizes.map((size) => [...Array(TOME_FLAME.frames).keys()].map((f) => paintTomeFlame(size, f, f % 3 === 0 ? -1 : f % 3 === 1 ? 0 : 1)));
  s = sheet(rows, 44, 44);
} else if (what === 'touch') {
  s = sheet([[...Array(TOME_TOUCH_FRAMES).keys()].map((a) => paintTomeTouch(a, 1))], 64, 60);
} else if (what === 'brand') {
  const rows: Cell[][] = [
    [0, 6, 12, 18, 24, 30].map((t) => paintBrand(26, t, BRAND.steps)),
    [24, 18, 12, 6, 2, 0].map((l, i) => paintBrand(26, i * 5, l)),
    [paintBrand(26, 0, BRAND.steps, true), paintBrand(34, 9, 20), paintBrand(20, 30, 14)],
  ];
  s = sheet(rows, 84, 44);
} else if (what === 'cracks') {
  const rows: Cell[][] = [[...Array(RISE_CRACKS.grow).keys()].map((g) => paintRiseCracks(g, 0, 3)), [...Array(RISE_CRACKS.cool).keys()].map((c) => paintRiseCracks(RISE_CRACKS.grow, c, 3))];
  s = sheet(rows, 60, 34);
} else {
  const g = (kind: 'punch' | 'kick' | 'jump', level = 1): Globe => ({ kind, level });
  const e: Globe = { kind: 'empty' };
  const rows: Cell[][] = [
    [{ px: paintGlobes({ globes: [e, e, e] }) }, { px: paintGlobes({ globes: [e, e, e, e] }) }],
    [{ px: paintGlobes({ globes: [g('punch'), g('punch'), g('kick', 0.6)] }) }, { px: paintGlobes({ globes: [g('punch'), g('punch'), g('kick'), g('punch', 0.5)] }) }],
    [{ px: paintGlobes({ globes: [g('punch'), g('punch'), g('kick')], locked: true }) }, { px: paintGlobes({ globes: [g('punch'), g('kick'), g('jump'), { kind: 'fire', of: 'kick' }], locked: true, flick: 3 }) }],
  ];
  s = sheet(rows, 62, 26);
}
writeFileSync(out, png(s));
console.log(out, s.w, s.h);
