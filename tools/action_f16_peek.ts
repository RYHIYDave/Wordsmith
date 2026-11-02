// A LOOK AT FRAMES (the floors 16 to 19 helper's own, while drawing): a strip of moments of a figure's move, twice as big, on a plain
// dark ground, the knight beside the first for size. Nothing of the game imports it.
//   npx tsx tools/action_f16_peek.ts <mobExport@module> <move> <view> <t,t,...> <out.png> [cellW] [cellH]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { Mob } from '../src/art/new_mobs3';
import { frameOf, knight, lay, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [which, move, view, ts, out, cw = '170', ch = '170'] = process.argv.slice(2);
void (async (): Promise<void> => {
  const [name, mod] = which.split('@');
  const m = (await import(`../src/art/${mod}`)) as Record<string, Mob>;
  const mob = m[name];
  const times = ts.split(',').map(Number);
  const W = Number(cw);
  const H = Number(ch);
  const strip = new Px(W * times.length, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < strip.w; x++) strip.set(x, y, Math.floor(x / W) % 2 ? '#2a2436' : '#221e2e');
  times.forEach((t, i) => {
    if (i === 0) lay(strip, knight(view === 'back' ? 'back' : 'front'), 18, H - 34);
    lay(strip, frameOf(mob, move, t, view as 'front' | 'back'), i * W + W / 2, H - 34);
  });
  writeFileSync(out, png(scaled(strip, 2)));
  console.log(out);
})();
