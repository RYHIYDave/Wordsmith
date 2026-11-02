// (the floors 16 to 19 helper's own, while drawing) a strip of a thing painted on its own canvas: the horse, the banner, the mist.
//   npx tsx tools/action_f16_thing.ts <what> <view> <t,t,...> <out.png>
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { scaled } from '../src/dev/king_scene';
import { png } from './king_png';
const [what, view, ts, out] = process.argv.slice(2);
void (async (): Promise<void> => {
  const times = ts.split(',').map(Number);
  const g = await import('../src/art/action_f16_groom');
  const k = await import('../src/art/action_f16_knight');
  const paint = (t: number): Px => (what === 'horse' ? g.horsePainted(t, view as 'front', 1).px : what === 'banner' ? k.bannerPainted(t, view as 'front').px : what === 'cut' ? k.bannerPainted(2, view as 'front', -1, t).px : g.mistPainted(t).px);
  const ps = times.map(paint);
  const strip = new Px(ps[0].w * ps.length, ps[0].h);
  for (let y = 0; y < strip.h; y++) for (let x = 0; x < strip.w; x++) strip.set(x, y, Math.floor(x / ps[0].w) % 2 ? '#3a4a30' : '#34442c');
  ps.forEach((p, i) => {
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const j = (y * p.w + x) * 4;
      if (p.d[j + 3]) strip.set(i * p.w + x, y, '#' + [p.d[j], p.d[j + 1], p.d[j + 2]].map((v) => v.toString(16).padStart(2, '0')).join(''));
    }
  });
  writeFileSync(out, png(scaled(strip, 2)));
  console.log(out);
})();
