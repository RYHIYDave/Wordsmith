// THE RAT KING DONE THE ACTION WAY: THE SHEET's panels (docs/mockups/action_f12_ratking/pictures/ratking_action_sheet.png, put together
// with its captions by tools/ratking_action_captions.py): the sluices over the whole cistern at three moments; key moments of each
// move from in front and from behind, with the knight; his old roll beside the new. Nothing of the game imports it.
//   npx tsx tools/ratking_action_sheet.ts <raw dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { BITE9, BITE9_HIT, ROLL9, ROLL9_HIT, UNKNOT9, UNKNOT9_HIT, WORDS9, WORDS9_HIT } from '../src/art/ratking_action';
import { SLUICES } from '../src/art/ratking_action_fx';
import { FLOOD, SWARM9 } from '../src/art/ratking_action_fx';
import { ARENA, LEAD, arenaScene, biteScene, oldRollScene, rollScene, unknotScene, wordsScene } from '../src/dev/ratking_action_scene';
import type { View } from '../src/dev/ratking_action_scene';
import { cut, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const dir = process.argv[2] ?? 'sheet_raw';
mkdirSync(dir, { recursive: true });
const W = 1200;
const save = (name: string, p: Px): void => {
  writeFileSync(`${dir}/${name}`, png(p));
  console.log(name, p.w, p.h);
};
/** A row of cells side by side. */
function row(cells: Px[]): Px {
  const h = Math.max(...cells.map((c) => c.h));
  const out = new Px(W, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < W; x++) out.set(x, y, '#0c0a14');
  let x0 = 0;
  const gap = Math.floor((W - cells.reduce((a, c) => a + c.w, 0)) / (cells.length + 1));
  for (const c of cells) {
    x0 += gap;
    for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
      const i = (y * c.w + x) * 4;
      out.d.set(c.d.subarray(i, i + 4), (y * W + x0 + x) * 4);
    }
    x0 += c.w;
  }
  return out;
}

// THE WHOLE CISTERN FROM ABOVE, at three moments of the sluices opening
const arena = (t: number): Px => cut(arenaScene(t, W, 676, 600, 384), 0, 0, W, 660);
save('cistern_held.png', arena(ARENA.open1 + 1.3));
save('cistern_burst.png', arena(ARENA.open1 + SLUICES.burst + 0.1));
save('cistern_flood.png', arena(ARENA.open1 + SLUICES.burst + 1.6));

// KEY MOMENTS, close: each cell 380 by 330 of the sheet, `k` times as big, his floor point at (ax, ay) of it
type Scene = (view: View, t: number, w: number, h: number, cx: number, cy: number) => Px;
function cell(scene: Scene, view: View, m: number, k: number, ax: number, ay: number): Px {
  const cw = Math.round(380 / k);
  const chh = Math.round(330 / k);
  const p = scene(view, LEAD + m, cw, chh, Math.round(cw * ax), Math.round(chh * ay));
  return k === 1 ? p : cut(scaled(p, Math.ceil(k)), 0, 0, 380, 330);
}
/** Twice as big: a cell 600 by 330 of the sheet. */
const close2 = (scene: Scene, view: View, m: number, ax: number, ay: number): Px => scaled(scene(view, LEAD + m, 300, 165, Math.round(300 * ax), Math.round(165 * ay)), 2);
const FLIGHT = { front: 9.4 / WORDS9.speed, back: 5.6 / WORDS9.speed } as const;
for (const view of ['front', 'back'] as const) {
  const F = view === 'front';
  save(`sluice_${view}.png`, row([1.2, ROLL9_HIT + 0.03].map((m) => close2(rollScene, view, m, F ? 0.3 : 0.32, F ? 0.72 : 0.72))));
  save(`bite_${view}.png`, row([0.75, BITE9_HIT].map((m) => close2(biteScene, view, m, F ? 0.24 : 0.26, F ? 0.4 : 0.8))));
  save(`words_${view}.png`, row([0.8, WORDS9_HIT + 0.03, WORDS9_HIT + FLIGHT[view] + 0.18].map((m) => cell(wordsScene, view, m, 1, F ? 0.17 : 0.2, F ? 0.3 : 0.74))));
  save(`unknot_${view}.png`, row([0.85, UNKNOT9_HIT + 0.05, UNKNOT9.out + SWARM9.for * 0.42].map((m) => scaled(unknotScene(view, LEAD + m, 200, 165, F ? 72 : 52, F ? 62 : 128), 2))));
}

// HIS OLD ROLL BESIDE THE NEW: curled up, its lane marked; rolling down it | the flood
const oldRoll = (t: number): Px => scaled(oldRollScene(t, 290, 165, 60, 62), 2);
save('roll_old.png', row([oldRoll(0.6), oldRoll(1.15)]));
save('roll_new.png', row([ROLL9_HIT + 0.1, ROLL9.stop + 0.1].map((m) => scaled(rollScene('front', LEAD + m, 290, 165, 30, 30), 2))));
void FLOOD;
void ROLL9;
void WORDS9;
