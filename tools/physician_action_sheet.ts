// THE PHYSICIAN'S MOVES DONE THE ACTION WAY: THE SHEET's panels (docs/mockups/action_f14_physician/pictures/physician_action_sheet.png,
// put together with its captions by tools/physician_action_captions.py): the Diagnosis over the whole theatre at three moments; his
// old tonic beside the new Diagnosis; the Diagnosis and the operation close, from in front and from behind; key moments of the rap,
// the draw and the rounds, from in front and from behind, with the knight. Nothing of the game imports it.
//   npx tsx tools/physician_action_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { DRAW9, DRAW9_HIT, OP_HIT, RAP9_HIT, ROUNDS9_HITS, f } from '../src/art/physician_action';
import { LEAD, diagArena, diagArenaFull, diagCloseScene, diagClosePass, drawScene, oldTonicScene, rapScene, roundsScene, theatreFloor } from '../src/dev/physician_action_scene';
import type { View } from '../src/dev/physician_action_scene';
import { cut, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
function row(cells: Px[]): Px {
  const w = cells.reduce((a, c) => a + c.w, 0);
  const r = new Px(w, cells[0].h);
  let x = 0;
  for (const c of cells) {
    r.blit(c, x, 0);
    if (x) for (let y = 0; y < r.h; y++) r.set(x, y, '#07060c').set(x - 1, y, '#07060c');
    x += c.w;
  }
  return r;
}
const cell = (scene: Scene, view: View, m: number, w: number, h: number, cx: number, cy: number): Px => scene(view, LEAD + m, theatreFloor(w, h, cx, cy, false), cx, cy);
const save = (name: string, p: Px): void => writeFileSync(`${out}/${name}`, png(p));
// THE DIAGNOSIS OVER THE WHOLE THEATRE at three moments: in the open, the mark filling; hid behind the bed, draining; the mark full: the field marked
{
  const full = diagArenaFull();
  const A = (m: number): Px => cut(diagArena(LEAD + m, theatreFloor(1200, 676, 600, 336), 600, 336), 40, 0, 1120, 630);
  save('diag_arena1.png', A(1.6));
  save('diag_arena2.png', A(3.2));
  save('diag_arena3.png', A(full + OP_HIT - 0.15));
  save('diag_arena4.png', A(full + OP_HIT + f(2)));
}
// HIS OLD TONIC beside: the phials flung, the clouds lying
save('tonic_old.png', row([1.05, 2.4].map((t) => scaled(oldTonicScene(t, theatreFloor(300, 170, 80, 70, false), 80, 70), 2))));
// THE DIAGNOSIS AND THE OPERATION CLOSE: peering, the mark filling; full: the lens flung up, the instruments fanned, HELD; the strike
for (const v of ['front', 'back'] as const) {
  const op = diagClosePass(v) - OP_HIT - 1.2 - LEAD;
  const [cx, cy] = v === 'front' ? [150, 110] : [140, 205];
  save(`diag_${v}.png`, row([1.2, op + 0.7, op + OP_HIT + f(1)].map((m) => cell(diagCloseScene, v, m, 400, 270, cx, cy))));
}
// THE RAP: hauled up, HELD; struck; THE DRAW: en garde; the lunge; the word over his head; ROUNDS: hoisted, HELD; a rap and its ring; the third
// (twice the game's pixels, two to a row)
const two = (scene: Scene, v: View, ms: number[], cx: number, cy: number): Px => row(ms.map((m) => scaled(cell(scene, v, m, 300, 200, cx, cy), 2)));
save('rap_front.png', two(rapScene, 'front', [f(20), RAP9_HIT + f(1)], 70, 120));
save('rap_back.png', two(rapScene, 'back', [f(20), RAP9_HIT + f(1)], 80, 170));
save('draw_front.png', two(drawScene, 'front', [f(24), DRAW9_HIT + f(1)], 60, 110));
save('draw_word.png', two(drawScene, 'front', [DRAW9.fill[0] + 0.2, DRAW9.push[1] + 0.3], 60, 150));
save('draw_back.png', two(drawScene, 'back', [f(24), DRAW9_HIT + f(1)], 80, 170));
save('rounds_front.png', two(roundsScene, 'front', [f(22), ROUNDS9_HITS[0] + 0.25], 90, 95));
// (from behind, the game's own pixels, wide: the whole ring, the knight out past it)
save('rounds_back.png', cell(roundsScene, 'back', ROUNDS9_HITS[1] + 0.3, 1200, 420, 520, 330));
console.log('panels in', out);
