// The opening's spreads painted and written out as PNGs (tools/px_png.ts), to look at: tsx tools/opening_png.ts <out dir> [t]
import { paintSpread } from '../src/art/opening';
import { writePng } from './px_png';
// @ts-ignore
const argv: string[] = process.argv;
const out = argv[2] ?? '.';
const t = Number(argv[3] ?? 0);
for (const k of [0]) {
  const t0 = Date.now();
  const p = paintSpread(k, t);
  writePng(p, `${out}/spread${k / 2 + 1}.png`, 1);
  console.log('spread', k / 2 + 1, p.w, 'x', p.h, Date.now() - t0, 'ms');
}
