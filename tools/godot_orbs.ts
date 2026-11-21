// THE GODOT PORT: A MONSTER'S BALL OF LIGHT IN FLIGHT (render.ts: a hostile shot that is not an arrow, the Warden's bolts among them,
// is its element's orb, art/icons.ts orbFrame: three frames a turn, at twelve a second), for godot/scripts/arrow.gd:
//   godot/assets/fx/orbs.png + orbs.json  each element's three frames, two picture pixels to a game pixel, keyed `orb:<el>:<frame>`,
//     with where each is anchored (its middle).
//   npx tsx tools/godot_orbs.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { pngRGBA } from './mage_up_sheet';
import { Px } from '../src/engine/px';
import { makeIconArt } from '../src/art/icons';

paintWithoutCanvas();
const icons = makeIconArt();
const OUT = 'godot/assets/fx';
mkdirSync(OUT, { recursive: true });
const frames: { key: string; s: ReturnType<typeof paintingOf>; ax: number; ay: number; k: number }[] = [];
for (const [el, list] of Object.entries(icons.orb)) {
  list.forEach((sp, f) => frames.push({ key: `orb:${el}:${f}`, s: paintingOf(sp), ax: sp.ax, ay: sp.ay, k: 2 / (sp.density ?? 1) }));
}
const cell = Math.max(...frames.map((f) => Math.max(f.s.w, f.s.h) * f.k)) + 1;
const cols = 3;
const rows = Math.ceil(frames.length / cols);
const sheet = new Px(cols * cell, rows * cell);
const placed: { key: string; x: number; y: number; w: number; h: number; ax: number; ay: number }[] = [];
frames.forEach((f, n) => {
  const x0 = (n % cols) * cell;
  const y0 = Math.floor(n / cols) * cell;
  for (let j = 0; j < f.s.h * f.k; j++)
    for (let i = 0; i < f.s.w * f.k; i++) {
      const o = (Math.floor(j / f.k) * f.s.w + Math.floor(i / f.k)) * 4;
      const d = ((y0 + j) * sheet.w + x0 + i) * 4;
      for (let c = 0; c < 4; c++) sheet.d[d + c] = f.s.d[o + c];
    }
  placed.push({ key: f.key, x: x0, y: y0, w: f.s.w * f.k, h: f.s.h * f.k, ax: f.ax * 2, ay: f.ay * 2 });
});
writeFileSync(`${OUT}/orbs.png`, pngRGBA(sheet));
writeFileSync(`${OUT}/orbs.json`, JSON.stringify(placed) + '\n');
console.log(`orbs: ${frames.length} frames in a ${sheet.w}x${sheet.h} sheet`);
