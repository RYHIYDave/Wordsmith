// FLOOR 9'S SIDE BOSSES' MOVES WITH WHAT THEY DO TO THE FLOOR, at the game's own size, a frame at a time on a sheet (a look before a film):
//   node node_modules/tsx/dist/cli.mjs tools/f9_bosses_fxsheet.ts <out.png> <chief|wolf> <move> <view> <seconds,...>
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { chiefMovePainted, wolfMovePainted } from '../src/art/f9_bosses_art';
import type { F9View } from '../src/art/f9_bosses_art';
import { F9_FX_CANVAS, chiefFxPaint, wolfFxPaint } from '../src/art/f9_bosses_fx';
import { chiefCarry, wolfCarry } from '../src/art/f9_bosses_moves';
import { CK, WK } from '../src/art/f9_bosses_sculpt';
import { project } from '../src/art/skeleton';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = '/tmp/fx.png', who = 'chief', move = 'smash', view = 'front', list = '1'] = process.argv.slice(2);
const ts = list.split(',').map(Number);
const C = F9_FX_CANVAS;
const sheet = new Px(C.w * Math.min(3, ts.length), C.h * Math.ceil(ts.length / 3));
for (let i = 0; i < sheet.w * sheet.h; i++) sheet.set(i % sheet.w, Math.floor(i / sheet.w), (Math.floor((i % sheet.w) / 16) + Math.floor(i / sheet.w / 16)) % 2 ? '#3a3a2c' : '#34342a');
const lay = (src: Px, ox: number, oy: number, x0: number, y0: number): void => {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const c = src.get(x, y);
    const X = ox + x;
    const Y = oy + y;
    if (c && X >= x0 && X < x0 + C.w && Y >= y0 && Y < y0 + C.h) sheet.set(X, Y, c);
  }
};
ts.forEach((t, k) => {
  const x0 = (k % 3) * C.w;
  const y0 = Math.floor(k / 3) * C.h;
  const g = new Px(C.w, C.h);
  const a = new Px(C.w, C.h);
  if (who === 'chief') {
    chiefFxPaint(g, 'ground', move as never, t, view as F9View);
    chiefFxPaint(a, 'air', move as never, t, view as F9View);
  } else {
    wolfFxPaint(g, 'ground', move as never, t, view as F9View);
    wolfFxPaint(a, 'air', move as never, t, view as F9View);
  }
  lay(g, x0, y0, x0, y0);
  const f = who === 'chief' ? chiefMovePainted(view as F9View, move as never, Math.round(t * 30)) : wolfMovePainted(view as F9View, move as never, Math.round(t * 30));
  // (the figure over the floor point the move has carried it to)
  const d = who === 'chief' ? chiefCarry(move as never, t) * CK : wolfCarry(move as never, t) * WK;
  const s = project([d, 0, 0], view as 'front' | 'rear');
  lay(f.px, x0 + C.ax + Math.round(s[0]) - f.ax, y0 + C.ay + Math.round(s[1]) - f.ay, x0, y0);
  lay(a, x0, y0, x0, y0);
});
writeFileSync(out, png(sheet));
console.log(out);
