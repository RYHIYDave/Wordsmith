// THE CENSOR MADE AGAIN, HIS LOOK (art/censor2_sculpt.ts): standing, from in front and from behind, beside the Brawler, on a stand-in
// of the Reading Room's floor, at the game's own size and twice it. Nothing of the game imports it.
//   node node_modules/tsx/dist/cli.mjs tools/censor2_look.ts <out.png> [pose json]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { makeHeroArt3 } from '../src/art/heroes3';
import { frameAt } from '../src/dev/action_f1_scene';
import { CENSOR2_CANVAS, sculptCensor2 } from '../src/art/censor2_sculpt';
import type { CensorPose } from '../src/art/censor2_sculpt';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = '/tmp/censor_look.png', poseArg = '{}'] = process.argv.slice(2);
const pose = JSON.parse(poseArg) as Partial<CensorPose>;
const C = CENSOR2_CANVAS;
const BRAWLER = makeHeroArt3().of('brawler' as never, {} as never) as never;
const cell = { w: 640, h: 720 };
const sheet = new Px(cell.w * 2, cell.h);
for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) {
  // (the Reading Room's floor: dark boards in a diamond, warm candle-light on them)
  const u = (x / 2 + y) / 16;
  const v = (-x / 2 + y) / 16;
  const k = (Math.floor(u) + Math.floor(v)) % 2 === 0;
  sheet.set(x, y, k ? '#1c1612' : '#241c16');
}
const lay = (src: Px, ox: number, oy: number): void => {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const c = src.get(x, y);
    if (c && ox + x >= 0 && oy + y >= 0 && ox + x < sheet.w && oy + y < sheet.h) sheet.set(ox + x, oy + y, c);
  }
};
(['front', 'rear'] as const).forEach((view, i) => {
  const d = sculptCensor2(view, pose, 45, C);
  const ox = i * cell.w + cell.w / 2 - C.ax + 40;
  const oy = cell.h - 60 - C.ay;
  // (the Brawler beside him, for size)
  const b = frameAt(BRAWLER, view === 'front' ? 'front' : 'back', 'stand', 0) as { px: Px; ax: number; ay: number };
  lay(b.px, i * cell.w + cell.w / 2 - 170 - b.ax, cell.h - 60 - b.ay);
  lay(d.px, ox, oy);
});
writeFileSync(out, png(sheet));
console.log(out);
