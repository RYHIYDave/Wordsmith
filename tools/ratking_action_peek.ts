// A LOOK AT FRAMES (the Rat King helper's own, while drawing): a strip of frames of one of his new moves (or his old ones), on a
// plain dark ground; a mark at his floor point and a tick every tile along the floor's way across. Nothing of the game imports it.
//   npx tsx tools/ratking_action_peek.ts <move> <view> <t,t,...> <out.png> [cell] [old] [k]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { RK9_CANVAS, king9Painted } from '../src/art/ratking_action';
import type { Move9 } from '../src/art/ratking_action';
import { RK_CANVAS, ratKingPainted } from '../src/art/rat_king';
import { lay, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [move, view, ts, out, cell = '360', old = '', k = '1'] = process.argv.slice(2);
const times = ts.split(',').map(Number);
const W = Number(cell);
const H = Math.round(W * 0.8);
const strip = new Px(W * times.length, H);
for (let y = 0; y < H; y++) for (let x = 0; x < strip.w; x++) strip.set(x, y, Math.floor(x / W) % 2 ? '#2a2436' : '#221e2e');
times.forEach((t, i) => {
  const p = old ? ratKingPainted(move, t, view as 'front' | 'back') : king9Painted(move as Move9, t, view as 'front' | 'back');
  const C = old ? RK_CANVAS : RK9_CANVAS;
  const ox = i * W + W / 2;
  const oy = H - 90;
  for (let j = -4; j <= 4; j++) for (let s = -3; s <= 3; s++) strip.set(ox + 32 * j + s * 0, oy + 16 * j, '#555066');
  lay(strip, { px: p.px, ax: C.ax, ay: C.ay }, ox, oy);
  for (let j = -4; j <= 4; j++) strip.set(ox + j, oy, '#ffffff');
});
writeFileSync(out, png(scaled(strip, Number(k))));
console.log(out);
