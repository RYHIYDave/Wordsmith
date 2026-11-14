// THE CENSOR MADE AGAIN, HIS POSES ON A SHEET (art/censor2_moves.ts): a move, his stand, his glide, struck or his death, at times given.
//   node node_modules/tsx/dist/cli.mjs tools/censor2_poses.ts <out.png> <move:NAME@t,t,..|still|walk|reel|die@t,..> [front|rear]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { CENSOR2_CANVAS, sculptCensor2 } from '../src/art/censor2_sculpt';
import { censorDie, censorPose, censorReel, censorStill, censorWalk } from '../src/art/censor2_moves';
import type { CensorMove } from '../src/art/censor2_moves';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = '/tmp/censor_poses.png', what = 'move:slash@0,0.34,0.64,0.8,0.9,1.3', view = 'front'] = process.argv.slice(2);
const C = CENSOR2_CANVAS;
const [kind, list] = what.split('@');
const ts = (list ?? '0').split(',').map(Number);
const cols = Math.min(ts.length, 6);
const rows = Math.ceil(ts.length / cols);
const sheet = new Px(C.w * cols, C.h * rows);
for (let i = 0; i < sheet.w * sheet.h; i++) sheet.set(i % sheet.w, Math.floor(i / sheet.w), (Math.floor((i % sheet.w) / 16) + Math.floor(i / sheet.w / 16)) % 2 ? '#241c16' : '#1c1612');
ts.forEach((t, k) => {
  const pose = kind.startsWith('move:') ? censorPose(kind.slice(5) as CensorMove, t) : kind === 'still' ? censorStill(t) : kind === 'walk' ? censorWalk(t) : kind === 'reel' ? censorReel(t) : censorDie(t);
  const d = sculptCensor2(view as 'front' | 'rear', pose, 45, C);
  const ox = (k % cols) * C.w;
  const oy = Math.floor(k / cols) * C.h;
  for (let y = 0; y < C.h; y++) for (let x = 0; x < C.w; x++) {
    const c = d.px.get(x, y);
    if (c) sheet.set(ox + x, oy + y, c);
  }
  for (let q = -3; q <= 3; q++) {
    sheet.set(ox + C.ax + q, oy + C.ay, '#ff00ff');
    sheet.set(ox + C.ax, oy + C.ay + q, '#ff00ff');
  }
});
writeFileSync(out, png(sheet));
console.log(out, sheet.w, sheet.h);
