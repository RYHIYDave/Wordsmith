// THE CHAINED ONE IN HIS NEW LOOK, THE GAUNT CHAIN-WRAITH: THE SHEET (docs/mockups/chained_look/pictures/chained_look_sheet.png):
// him standing, from in front and from behind, three times as big, beside the knight; before (as he is now) beside now; his face
// cage close; at the game's size in his pit; as his chains break. Raw panels are written here; tools/chained_look_captions.py lays
// them out with their captions. Nothing of the game imports it.
//   npx tsx tools/chained_look_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { chainedActionMob } from '../src/art/chained_action';
import { chainedLookMob } from '../src/art/chained_look';
import { CO_SNAP_BALL, CO_SNAP_L } from '../src/art/bosses3';
import { paintViewOf, skeletonAt } from '../src/art/new_mobs3';
import { project } from '../src/art/skeleton';
import { BALL_LAND, WHIRL_STILL } from '../src/art/chained_action';
import { tombFloor } from '../src/dev/action_f1_scene';
import { LEAD, WHIRL_EXTRA, ballScene, lashScene, whirlScene } from '../src/dev/chained_look_scene';
import { cut, frameOf, knight, lay, scaled, shadow } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const now = chainedLookMob(0);
const before = chainedActionMob(0);

/** A cell of floor `w` by `h`, figures standing in it at their floor points (each with its shadow). */
function cell(w: number, h: number, figs: ReadonlyArray<readonly [number, number, Laid, number?]>, cx = w / 2, cy = h * 0.6): Px {
  const p = new Px(w, h);
  p.d.set(tombFloor(w, h, cx, cy).d);
  for (const [x, y, , sh] of figs) shadow(p, x, y, sh ?? 14);
  for (const [x, y, l] of [...figs].sort((a, b) => a[1] - b[1])) lay(p, l, x, y);
  return p;
}
function row(cells: Px[]): Px {
  const w = cells.reduce((a, c) => a + c.w, 0);
  const r = new Px(w, cells[0].h);
  let x = 0;
  for (const c of cells) {
    r.blit(c, x, 0);
    x += c.w;
  }
  x = 0;
  for (const c of cells.slice(0, -1)) {
    x += c.w;
    for (let y = 0; y < r.h; y++) r.set(x, y, '#07060c').set(x - 1, y, '#07060c');
  }
  return r;
}
const T = Number(process.argv[3] ?? 0);
// 1. HIM STANDING, FROM IN FRONT AND FROM BEHIND, BESIDE THE KNIGHT, THREE TIMES AS BIG
writeFileSync(`${out}/standing.png`, png(scaled(cell(400, 176, [[112, 160, frameOf(now, 'stand', T, 'front')], [214, 158, knight('front'), 9], [316, 160, frameOf(now, 'stand', T, 'back')]]), 3)));
// 2. BEFORE (AS HE IS NOW IN THE GAME) AND NOW, FROM IN FRONT, BESIDE THE KNIGHT, TWICE AS BIG
writeFileSync(`${out}/before_now.png`, png(scaled(cell(600, 200, [[150, 182, frameOf(before, 'stand', T, 'front')], [300, 180, knight('front'), 9], [452, 186, frameOf(now, 'stand', T, 'front')]]), 2)));
// 3. HIS FACE CAGE, CLOSE: from in front; roaring as his chain breaks; from behind
{
  const close = (move: string, t: number, view: 'front' | 'back'): Px => {
    const l = frameOf(now, move, t, view);
    const h = project(skeletonAt(now, move, t).head, paintViewOf(now, view));
    const x = Math.round(l.ax + h[0]);
    const y = Math.round(l.ay + h[1]);
    const p = cell(l.px.w, l.px.h, [[l.ax, l.ay, l, 0]], l.ax, l.ay);
    return scaled(cut(p, x - 33, y - 24, 66, 50), 6);
  };
  writeFileSync(`${out}/cage.png`, png(row([close('stand', T, 'front'), close('breakL', 1.3, 'front'), close('stand', T, 'back')])));
}
// 4. AT THE GAME'S SIZE, IN HIS PIT, THE KNIGHT BEFORE HIM: as he lashes; as his chains whirl; with the ball held high
{
  const sc = (scene: typeof lashScene, t: number, cx: number, cy: number, x: number, y: number): Px => cut(scene('front', t, tombFloor(700, 420, cx, cy), cx, cy), x, y, 400, 270);
  writeFileSync(`${out}/game_size.png`, png(row([sc(lashScene, LEAD + 0.6, 300, 300, 40, 90), sc(whirlScene, LEAD + WHIRL_STILL - 0.9 + WHIRL_EXTRA, 300, 260, 100, 80), sc(ballScene, LEAD + BALL_LAND - 0.75, 300, 330, 110, 75)])));
}
// 5. AS HIS CHAINS BREAK: whole; the first break (his left chain snapping under his foot); the second (the ball's chain torn from his collar); from in front, twice as big
{
  const st = [
    cell(200, 210, [[96, 186, frameOf(now, 'stand', T, 'front')]], 100, 150),
    cell(200, 210, [[96, 186, frameOf(now, 'breakL', CO_SNAP_L + 0.1, 'front')]], 100, 150),
    cell(200, 210, [[80, 186, frameOf(chainedLookMob(1), 'breakBall', CO_SNAP_BALL + 0.12, 'front')]], 100, 150),
  ];
  writeFileSync(`${out}/breaking.png`, png(scaled(row(st), 2)));
}
console.log('panels in', out);
