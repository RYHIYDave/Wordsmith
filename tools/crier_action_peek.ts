// A LOOK AT FRAMES (the Crier helper's own, while drawing): a strip of frames of one of his new moves, on a plain dark ground,
// twice as big; a mark at his floor point. Nothing of the game imports it.
//   npx tsx tools/crier_action_peek.ts <move> <view> <t,t,...> <out.png> [cell] [scale]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { CR_ACT_CANVAS, crierActionMob } from '../src/art/crier_action';
import { paintMob } from '../src/art/new_mobs3';
import { lay, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [move, view, ts, out, cell = '300', k = '2'] = process.argv.slice(2);
const times = ts.split(',').map(Number);
const W = Number(cell);
const H = Math.round(W * 1.0);
const strip = new Px(W * times.length, H);
for (let y = 0; y < H; y++) for (let x = 0; x < strip.w; x++) strip.set(x, y, Math.floor(x / W) % 2 ? '#2a2436' : '#221e2e');
const mob = crierActionMob();
times.forEach((t, i) => {
  const p = paintMob(mob, move, t, view as 'front' | 'back');
  lay(strip, { px: p.px, ax: CR_ACT_CANVAS.ax, ay: CR_ACT_CANVAS.ay }, i * W + W / 2, H - 70);
  for (let q = -4; q <= 4; q++) strip.set(i * W + W / 2 + q, H - 70, '#ffffff');
});
writeFileSync(out, png(scaled(strip, Number(k))));
console.log(out);
