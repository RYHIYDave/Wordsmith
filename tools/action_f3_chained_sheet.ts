// THE CHAINED ONE'S MOVES DONE THE ACTION WAY: THE SHEET (docs/mockups/action_f3_chained/pictures/chained_action_sheet.png): key
// frames of each of his four new moves from in front and from behind, his old lash beside the new, and what they leave on the
// floor. Raw panels are written here; tools/action_f3_chained_captions.py lays them out with their captions. Nothing of the game
// imports it.
//   npx tsx tools/action_f3_chained_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { CHAINED } from '../src/art/bosses3';
import { BALL_LAND, HOOK_BLOW, LASH_HITS, WHIRL_HIT } from '../src/art/chained_action';
import { tombFloor } from '../src/dev/action_f1_scene';
import { LEAD, WHIRL_EXTRA, ballScene, figures, hookScene, lashScene, whirlScene } from '../src/dev/action_f3_chained_scene';
import { frameAt } from '../src/dev/action_f3_scene';
import { cut, frameOf, lay, shadow } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const { co } = figures(0);

/** A row of cells side by side, a dark line between them. */
function row(cells: Px[]): Px {
  const w = cells[0].w;
  const r = new Px(w * cells.length, cells[0].h);
  cells.forEach((c, i) => r.blit(c, i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
/** A cell of floor `w` by `h`, with a figure standing at (x, y). */
function cell(w: number, h: number, x: number, y: number, fig: Laid, sh = 14): Px {
  const p = new Px(w, h);
  p.d.set(tombFloor(w, h, x + 20, y + 30).d);
  shadow(p, x, y, sh);
  lay(p, fig, x, y);
  return p;
}
const f = (n: number): number => n / 30;
const W = 240;
const H = 230;
/** Where he stands in a cell, by the way he is seen: room before him for his chains (in his lash, further back: he steps in). */
const spot = (view: 'front' | 'back', move = ''): [number, number] => (move === 'attack' ? (view === 'front' ? [62, 186] : [62, 222]) : view === 'front' ? [100, 196] : [100, 214]);
const frames = (move: string, ts: number[], view: 'front' | 'back'): Px => row(ts.map((t) => cell(W, H, ...spot(view, move), frameAt(co, view, move, t))));
// THE LASH: cocked and held; the forehand; the backhand; both fists up, held; the finisher
const LASH = [f(20), LASH_HITS[0], LASH_HITS[1], f(82), LASH_HITS[2]];
// THE WHIRL: gathered, held; spinning; his fists up as he slows; held; the slam
const WHIRL = [f(26), f(48), f(72), f(80), WHIRL_HIT];
// THE HOOK: aimed, held; flung; hauling; fists up, held; the blow waiting
const HOOK = [f(42), f(49), f(63), f(87), HOOK_BLOW];
// THE BALL: held high; drawn back, held; whipped over; whipped down; hauling it back
const BALL = [f(50), f(65), f(68), f(69), 3.1];
for (const view of ['front', 'back'] as const) {
  writeFileSync(`${out}/lash_${view}.png`, png(frames('attack', LASH, view)));
  writeFileSync(`${out}/whirl_${view}.png`, png(frames('whirl', WHIRL, view)));
  writeFileSync(`${out}/hook_${view}.png`, png(frames('hook', HOOK, view)));
  writeFileSync(`${out}/ball_${view}.png`, png(frames('ball', BALL, view)));
}
// HIS OLD LASH, BESIDE THE NEW: cocked; held; over the top; snapped down; through (the game's own, as it is)
const OLD = [0.46, 0.62, 0.74, 0.86, 1.14];
writeFileSync(`${out}/lash_old.png`, png(row(OLD.map((t) => cell(W, H, ...spot('front', 'attack'), frameOf(CHAINED, 'attack', t, 'front'))))));
// WHAT THEY LEAVE ON THE FLOOR, in his pit with the knight: the crack; the whirl's ring; the ball's; the blow waiting's
const sc = (scene: typeof lashScene, t: number, cx: number, cy: number, x: number, y: number): Px => cut(scene('front', t, tombFloor(600, 340, cx, cy), cx, cy), x, y, 300, 200);
writeFileSync(`${out}/floor1.png`, png(row([sc(lashScene, LEAD + LASH_HITS[2] + 0.1, 300, 230, 180, 110), sc(whirlScene, LEAD + WHIRL_HIT + WHIRL_EXTRA + 0.08, 270, 215, 190, 90)])));
writeFileSync(`${out}/floor2.png`, png(row([sc(ballScene, LEAD + BALL_LAND + 0.08, 270, 250, 150, 110), sc(hookScene, LEAD + HOOK_BLOW + 0.08, 300, 250, 110, 90)])));
console.log('panels in', out);
