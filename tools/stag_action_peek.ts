// A LOOK AT FRAMES (the Hollow Stag helper's own, while drawing): a strip of frames of one of his new moves (or his old ones), on a
// plain dark ground, twice as big; a mark at his floor point. Nothing of the game imports it.
//   npx tsx tools/stag_action_peek.ts <move> <view> <t,t,...> <out.png> [cell] [old]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { stag9Painted, STAG9_CANVAS } from '../src/art/stag_action';
import type { Move9 } from '../src/art/stag_action';
import { STAG_CANVAS, stagPainted } from '../src/art/hollow_stag';
import { lay, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [move, view, ts, out, cell = '300', old = '', k = '2'] = process.argv.slice(2);
const times = ts.split(',').map(Number);
const W = Number(cell);
const H = Math.round(W * 0.85);
const strip = new Px(W * times.length, H);
for (let y = 0; y < H; y++) for (let x = 0; x < strip.w; x++) strip.set(x, y, Math.floor(x / W) % 2 ? '#2a2436' : '#221e2e');
times.forEach((t, i) => {
  const p = old ? stagPainted(move, t, view as 'front' | 'back') : stag9Painted(move as Move9, t, view as 'front' | 'back');
  const C = old ? STAG_CANVAS : STAG9_CANVAS;
  lay(strip, { px: p.px, ax: C.ax, ay: C.ay }, i * W + W / 2, H - 60);
  for (let k = -4; k <= 4; k++) strip.set(i * W + W / 2 + k, H - 60, '#ffffff');
  for (let k = 0; k < W; k += 6) strip.set(i * W + k, H - 60, '#555066');
});
writeFileSync(out, png(scaled(strip, Number(k))));
console.log(out);
