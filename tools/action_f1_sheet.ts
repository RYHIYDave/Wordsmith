// THE FLOOR 1 ACTION SHEET (docs/mockups/action_f1/pictures/action_f1_sheet.png): key frames of the bone archer's arrow rain and
// the Warden's Lockdown, from in front and from behind, with what each leaves on the floor, the knight for size. Raw panels are
// written here; tools/action_f1_captions.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/action_f1_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { LOCKDOWN, RAIN, RAIN_CANVAS, lockBarsPainted, lockCanvas, lockShadowPainted, rainPainted } from '../src/art/action_f1_fx';
import type { View } from '../src/art/action_f1_fx';
import { RAIN_LOOSE } from '../src/art/monster_bones';
import { LOCKDOWN_HIT } from '../src/art/monster_warden';
import { compose, figures, frameAt, laid, onFloor, tombFloor } from '../src/dev/action_f1_scene';
import { knight, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const { archer, warden } = figures();

/** A row of cells side by side, each `w` by `h` picture pixels, made `k` times as big. */
function row(cells: Px[], k: number): Px {
  const w = cells[0].w * k;
  const r = new Px(w * cells.length, cells[0].h * k);
  cells.forEach((c, i) => r.blit(scaled(c, k), i * w, 0));
  // (a dark line between cells)
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}

// 1. THE ARCHER: rest, the hand to the string, the bow swung up, drawn and held, the loose (one frame), the bow held up, the fresh arrow
const ARCHER_AT = [0, 0.14, 0.3, 0.7, RAIN_LOOSE, RAIN_LOOSE + 0.17, RAIN_LOOSE + 0.55];
for (const view of ['front', 'back'] as View[]) {
  const cells = ARCHER_AT.map((t) => {
    const base = tombFloor(56, 112, 26, 102);
    return compose(base, [], [{ at: [26, 102], l: frameAt(archer, view, 'rain', t), shadow: 9 }]);
  });
  writeFileSync(`${out}/archer_${view}.png`, png(row(cells, 3)));
}
// 2. THE RAIN: the ring comes down; filling; dense, the last moments; the strike's first frame; struck; stuck, the dust; crumbling
const RING_AT = [0.25, 0.8, RAIN.delay - 0.12, RAIN.strike[0], RAIN.delay, RAIN.delay + 0.3];
const ringCell = (t: number, view: View): Px => {
  const base = tombFloor(200, 170, 100, 112);
  const K: [number, number] = [100, 112];
  return compose(base, [{ at: K, l: laid(rainPainted(t, view, 'floor'), RAIN_CANVAS.ax, RAIN_CANVAS.ay) }], [
    { at: K, l: knight('back', 0), flip: true, shadow: 9 },
    { at: [K[0], K[1] - 0.5], l: laid(rainPainted(t, view, 'air', RAIN.radius, 'behind'), RAIN_CANVAS.ax, RAIN_CANVAS.ay) },
    { at: [K[0], K[1] + 0.5], l: laid(rainPainted(t, view, 'air', RAIN.radius, 'before'), RAIN_CANVAS.ax, RAIN_CANVAS.ay) },
  ]);
};
writeFileSync(`${out}/ring_1.png`, png(row(RING_AT.slice(0, 3).map((t) => ringCell(t, 'front')), 2)));
writeFileSync(`${out}/ring_2.png`, png(row(RING_AT.slice(3).map((t) => ringCell(t, 'front')), 2)));
// 3. THE WARDEN: at rest; the keys taken at his hip; up over his helm and held; wrenched down (one frame, the smear); the keys swinging at his hip
const WARDEN_AT = [0, 0.2, 0.95, LOCKDOWN_HIT, LOCKDOWN_HIT + 0.12];
for (const view of ['front', 'back'] as View[]) {
  const cells = WARDEN_AT.map((t) => {
    const base = tombFloor(120, 150, 52, 140);
    return compose(base, [], [{ at: [52, 140], l: frameAt(warden, view, 'lockdown', t), shadow: 20 }]);
  });
  writeFileSync(`${out}/warden_${view}.png`, png(row(cells, 2)));
}
// 4. THE BARS: a row three tiles long along the x way, the knight in the cell before it: the shadow soft; sharp, pink-edged; the
// crash's first frame (a streak); planted; standing; rising away
const BARS_AT = [-0.8, -0.15, LOCKDOWN.strike[0], 0.02, 0.8, LOCKDOWN.stand + 0.22];
const C = lockCanvas(3);
const barCell = (t: number): Px => {
  const base = tombFloor(200, 170, 100, 118);
  const at = onFloor(0, 0, 100, 118);
  const kn = onFloor(0.4, LOCKDOWN.cell / 2, 100, 118);
  return compose(base, [{ at, l: laid(lockShadowPainted('x', t, 3), C.ax, C.ay) }], [
    { at, l: laid(lockBarsPainted('x', t, 3, 1), C.ax, C.ay) },
    { at: kn, l: knight('back', 0), flip: true, shadow: 9 },
  ]);
};
writeFileSync(`${out}/bars_1.png`, png(row(BARS_AT.slice(0, 3).map(barCell), 2)));
writeFileSync(`${out}/bars_2.png`, png(row(BARS_AT.slice(3).map(barCell), 2)));
console.log('done', out);
