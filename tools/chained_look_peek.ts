// Scratch: a few frames of the new look beside the old, to look at while drawing. npx tsx tools/chained_look_peek.ts <out dir> <move> <t,t,...> [k]
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { chainedActionMob } from '../src/art/chained_action';
import { chainedLookMob } from '../src/art/chained_look';
import { tombFloor } from '../src/dev/action_f1_scene';
import { cut, frameOf, knight, lay, scaled, shadow } from '../src/dev/king_scene';
import { png } from './king_png';
(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = 'peek', move = 'stand', ts = '0', kk = '2', freedS = '0'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const freed = Number(freedS) as 0 | 1 | 2;
const oldM = chainedActionMob(freed);
const newM = chainedLookMob(freed);
const k = Number(kk);
for (const t of ts.split(',').map(Number)) {
  const W = 620, H = 330;
  const p = new Px(W, H);
  p.d.set(tombFloor(W, H, 300, 250).d);
  const spots: [number, number, 'front' | 'back', 'old' | 'new' | 'knight'][] = [[120, 270, 'front', 'old'], [300, 285, 'front', 'new'], [480, 285, 'back', 'new'], [400, 280, 'front', 'knight']];
  for (const [x, y, view, who] of spots) {
    shadow(p, x, y, 14);
    const l = who === 'knight' ? knight(view) : frameOf(who === 'old' ? oldM : newM, move, t, view);
    lay(p, l, x, y);
  }
  writeFileSync(`${out}/${move}_${t.toFixed(2)}.png`, png(k === 1 ? p : scaled(p, k)));
  writeFileSync(`${out}/${move}_${t.toFixed(2)}_close.png`, png(scaled(cut(p, 200, 90, 360, 220), 3)));
}
console.log('done');
