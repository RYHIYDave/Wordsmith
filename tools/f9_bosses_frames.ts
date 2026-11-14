// FLOOR 9'S SIDE BOSSES' FRAMES AS THE GAME WILL HOLD THEM (art/f9_bosses_art.ts), a row of them on a sheet:
//   node node_modules/tsx/dist/cli.mjs tools/f9_bosses_frames.ts <out.png> <chief|wolf> <move> <view> <i,i,...>
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { chiefMovePainted, wolfMovePainted } from '../src/art/f9_bosses_art';
import type { F9View } from '../src/art/f9_bosses_art';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = '/tmp/frames.png', who = 'chief', move = 'smash', view = 'front', list = '0'] = process.argv.slice(2);
const idx = list.split(',').map(Number);
const fs = idx.map((i) => (who === 'chief' ? chiefMovePainted(view as F9View, move as never, i) : wolfMovePainted(view as F9View, move as never, i)));
const W = 700;
const H = 620;
const sheet = new Px(W * fs.length, H);
for (let i = 0; i < sheet.w * sheet.h; i++) sheet.set(i % sheet.w, Math.floor(i / sheet.w), (Math.floor((i % sheet.w) / 16) + Math.floor(i / sheet.w / 16)) % 2 ? '#3a4a2c' : '#34442a');
fs.forEach((f, k) => {
  const ox = k * W + 380 - f.ax;
  const oy = 520 - f.ay;
  for (let y = 0; y < f.px.h; y++) for (let x = 0; x < f.px.w; x++) {
    const c = f.px.get(x, y);
    const X = ox + x;
    const Y = oy + y;
    if (c && X >= k * W && X < (k + 1) * W && Y >= 0 && Y < H) sheet.set(X, Y, c);
  }
});
writeFileSync(out, png(sheet));
console.log(out);
