// THE HOLLOW STAG DONE THE ACTION WAY: THE SHEET's panels (docs/mockups/action_f9_stag/pictures/stag_action_sheet.png, put together with
// its captions by tools/stag_action_captions.py): the clearing from above at full, 3/4, 1/2 and 1/4, his bounds round it as a path;
// key moments of each move from in front and from behind, with the knight; his old root lines beside the wood closing in. Nothing of
// the game imports it.
//   npx tsx tools/stag_action_sheet.ts <raw dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { CHARGE9, CLOSE, CLOSE_HIT, GORE9, GORE9_HIT, STOT9, charge9Carry } from '../src/art/stag_action';
import { ROOT_CANVAS, ROOT_SNAKE, ROOT_STRETCH, STAG_CANVAS, STAG_ROOTS, rootSnakePainted, stagPainted, stagRootTime } from '../src/art/hollow_stag';
import { BOUND_LONG, LEAD, arenaScene, boundScene, chargeScene, clearingFloor, closeScene, fightMoments, goreScene } from '../src/dev/stag_action_scene';
import type { View } from '../src/dev/stag_action_scene';
import { onFloor } from '../src/dev/action_f1_scene';
import { cut, lay, scaled, shadow } from '../src/dev/king_scene';
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
/** A row of cells side by side, each `w` wide. */
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

// THE CLEARING FROM ABOVE, at full, 3/4, 1/2 and 1/4, his bounds as a path
const M = fightMoments();
const C = M.closes;
const arena = (t: number, path: readonly [number, number], h: number): Px => cut(arenaScene(t, W, 676, 600, 362, { path }), 0, 362 - Math.round(h / 2) - 20, W, h);
save('clearing_full.png', arena(C[0] - 0.4, [0, C[0]], 640));
save('clearing_34.png', arena(M.gore + 0.55, [C[0] + CLOSE.long, M.gore], 560));
save('clearing_12.png', arena(M.charge + 0.75, [C[1] + CLOSE.long, M.charge], 470));
save('clearing_14.png', arena(M.long - 0.9, [C[2] + CLOSE.long, M.long], 400));

// KEY MOMENTS, close (twice as big): each cell `cw` by `ch` picture pixels round him
type Scene = (view: View, t: number, w: number, h: number, cx: number, cy: number) => Px;
function cell(scene: Scene, view: View, m: number, at: readonly [number, number], cw = 190, chh = 165, ax = 0.5, ay = 0.74): Px {
  const [x, y] = onFloor(at[0], at[1], 0, 0);
  return scaled(scene(view, LEAD + m, cw, chh, Math.round(cw * ax - x), Math.round(chh * ay - y)), 2);
}
const fwd = (view: View, d: number): [number, number] => (view === 'front' ? [d, 0] : [0, -d]);
for (const view of ['front', 'back'] as const) {
  save(`gore_${view}.png`, row([0.65, GORE9_HIT, GORE9_HIT + 0.25].map((m) => cell(goreScene, view, m, fwd(view, view === 'front' ? 0.9 : 0.6), 190, 165, 0.42))));
  save(`charge_${view}.png`, row([0.85, CHARGE9.hit, CHARGE9.crash + 0.06].map((m) => cell(chargeScene, view, m, fwd(view, -4.2 + charge9Carry(m) + (m > 1.2 ? 1.2 : 0.6)), 190, 165, 0.5))));
}
save('close_front.png', row([1.0, CLOSE_HIT, CLOSE_HIT + 0.5].map((m) => cell(closeScene, 'front', m, [0.3, 0.3], 190, 175, 0.5, 0.7))));
save('close_back.png', row([1.0, CLOSE_HIT, CLOSE_HIT + 0.5].map((m) => cell(closeScene, 'back', m, [0.3, -0.3], 190, 175, 0.5, 0.7))));
// (his bounds: landing, springing, at the top, landing again; then the heavy landing and the stare)
const run = 2 * STOT9.bound - STOT9.down / 2;
const bAt = (m: number): [number, number] => [-3.4 + (m < run ? STOT9.pace * m : STOT9.pace * run + 0.36), 0];
save('bounds_front.png', row([0.02, 0.2, 0.33, 0.6].map((m) => cell(boundScene, 'front', m, bAt(m), 145, 175, 0.5, 0.78))));
save('stare_front.png', row([run + 0.1, run + 0.45, run + 1.0].map((m) => cell(boundScene, 'front', m, bAt(m), 190, 165, 0.45, 0.76))));

// HIS OLD ROOT LINES BESIDE THE NEW: reared, slammed, three lines of roots worming out toward you (the game's own pictures) | the wood closing in
function oldRoots(t: number): Px {
  const w = 300;
  const h = 175;
  const cx = 64;
  const cy = 128;
  const base = clearingFloor(w, h, cx, cy, 1);
  const px = new Px(w, h);
  px.d.set(base.d);
  shadow(px, cx, cy, 16, 1);
  const stag = stagPainted('roots', t, 'front');
  for (const [j, along] of [-24, 0, 24].entries()) {
    for (let d = ROOT_SNAKE.from + ROOT_STRETCH / 2; d <= STAG_ROOTS.reach + 1e-9; d += ROOT_STRETCH) {
      const a = (along * Math.PI) / 180;
      const [X, Y] = onFloor(Math.cos(a) * d, Math.sin(a) * d, cx, cy);
      const r = rootSnakePainted(t - stagRootTime(d), 'front', along, j + 1);
      lay(px, { px: r.px, ax: ROOT_CANVAS.ax, ay: ROOT_CANVAS.ay }, X, Y);
    }
  }
  lay(px, { px: stag.px, ax: STAG_CANVAS.ax, ay: STAG_CANVAS.ay }, cx, cy);
  return scaled(px, 2);
}
save('roots_old.png', row([oldRoots(0.75), oldRoots(STAG_ROOTS.slam + STAG_ROOTS.freeze + 0.45)]));
save('roots_new.png', row([CLOSE_HIT + 0.12, CLOSE_HIT + 0.6].map((m) => cell(closeScene, 'front', m, [0.3, 0.3], 290, 175, 0.5, 0.7))));
void BOUND_LONG;
void GORE9;
