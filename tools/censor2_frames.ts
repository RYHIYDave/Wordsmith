// THE CENSOR MADE AGAIN, HIS FRAMES AS THE GAME WILL HOLD THEM (art/censor2_art.ts), on a sheet:
//   node node_modules/tsx/dist/cli.mjs tools/censor2_frames.ts <out.png> <slash|strike|redact|hush|still|walk|reel|die> <front|rear> <i,i,...>
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { censorFramePainted } from '../src/art/censor2_art';
import type { CensorView } from '../src/art/censor2_art';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = '/tmp/frames.png', what = 'slash', view = 'front', list = '0'] = process.argv.slice(2);
const idx = list.split(',').map(Number);
const fs = idx.map((i) => censorFramePainted(view as CensorView, what as never, i));
const W = 560;
const H = 560;
const cols = Math.min(fs.length, 4);
const rows = Math.ceil(fs.length / cols);
const sheet = new Px(W * cols, H * rows);
for (let i = 0; i < sheet.w * sheet.h; i++) sheet.set(i % sheet.w, Math.floor(i / sheet.w), (Math.floor((i % sheet.w) / 16) + Math.floor(i / sheet.w / 16)) % 2 ? '#241c16' : '#1c1612');
fs.forEach((f, k) => {
  const cx = (k % cols) * W;
  const cy = Math.floor(k / cols) * H;
  const ox = cx + W / 2 - f.ax;
  const oy = cy + H - 70 - f.ay;
  for (let y = 0; y < f.px.h; y++) for (let x = 0; x < f.px.w; x++) {
    const c = f.px.get(x, y);
    const X = ox + x;
    const Y = oy + y;
    if (c && X >= cx && X < cx + W && Y >= cy && Y < cy + H) sheet.set(X, Y, c);
  }
});
writeFileSync(out, png(sheet));
console.log(out);
