// THE AMALGAMATION'S MOVES DONE THE ACTION WAY: THE SHEET (docs/mockups/action_f4_amalgam/pictures/amalgam_action_sheet.png): key
// frames of each of its four moves from in front and from behind, with the knight for size; its old swipe beside the new; the bone
// rain over the whole floor. Panels are laid out here with their captions by tools/action_f4_amalgam_captions.py. Nothing of the
// game imports it.
//   npx tsx tools/action_f4_amalgam_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { AMALGAM } from '../src/art/bosses3';
import { ARMS_HIT, DEVOUR_HITS, RAIN_HIT, SWIPE_HITS } from '../src/art/amalgam_action';
import { RAIN } from '../src/art/amalgam_action_fx';
import { tombFloor } from '../src/dev/action_f1_scene';
import { LEAD, figures, rainArena } from '../src/dev/action_f4_amalgam_scene';
import { frameAt } from '../src/dev/action_f3_scene';
import { cut, frameOf, lay, shadow } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const { am, knight } = figures();

/** A row of cells side by side, a dark line between them. */
function row(cells: Px[]): Px {
  const w = cells[0].w;
  const r = new Px(w * cells.length, cells[0].h);
  cells.forEach((c, i) => r.blit(c, i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
const f = (n: number): number => n / 30;
/** A cell `w` by `h`: the floor, the knight a little way before it for size, it at its floor point. */
function cell(view: 'front' | 'back', fig: Laid, w: number, h: number): Px {
  const p = new Px(w, h);
  const [x, y] = view === 'front' ? [Math.round(w * 0.4), 150] : [Math.round(w * 0.42), 178];
  p.d.set(tombFloor(w, h, x + 30, y - 10).d);
  const [kx, ky] = view === 'front' ? [w - 46, 206] : [w - 50, 96];
  shadow(p, x, y, 30);
  shadow(p, kx, ky, 9);
  const kn = frameAt(knight, view === 'front' ? 'back' : 'front', 'stand', 0);
  if (ky < y) {
    lay(p, kn, kx, ky, 1, undefined, true);
    lay(p, fig, x, y);
  } else {
    lay(p, fig, x, y);
    lay(p, kn, kx, ky, 1, undefined, true);
  }
  return p;
}
/** Key moments of a move, one way round: in rows of `per` cells across 1200. */
function frames(move: string, ts: number[], view: 'front' | 'back', per = 4, h = 240, mob = am): Px {
  const w = 1200 / per;
  const rows: Px[] = [];
  for (let i = 0; i < ts.length; i += per) rows.push(row(ts.slice(i, i + per).map((t) => cell(view, mob === am ? frameAt(am, view, move, t) : frameOf(AMALGAM, move, t, view), w, h))));
  const out = new Px(1200, h * rows.length);
  rows.forEach((r, i) => out.blit(r, 0, i * h));
  for (let i = 1; i < rows.length; i++) for (let x = 0; x < 1200; x++) out.set(x, i * h, '#07060c').set(x, i * h - 1, '#07060c');
  return out;
}
// THE SWIPE: the right drawn back, held; raked; the left drawn back, held; raked; reared, held; slammed
const SWIPE = [f(18), SWIPE_HITS[0], f(46), SWIPE_HITS[1], f(82), SWIPE_HITS[2]];
// THE BONE RAIN: rearing; roaring, held; slammed; pressed, shuddering
const RAINF = [f(12), f(32), RAIN_HIT, f(58)];
// THE FLOOR ARMS: reared higher, held; slammed; pressed; letting go
const ARMSF = [f(30), ARMS_HIT, f(55), f(74)];
// DEVOUR: reared, maw gaping, arms wide, held; the rake; the drag; the bite
const DEVOURF = [f(30), DEVOUR_HITS[0], f(52), DEVOUR_HITS[1]];
for (const view of ['front', 'back'] as const) {
  writeFileSync(`${out}/swipe_${view}.png`, png(frames('attack', SWIPE, view, 3)));
  writeFileSync(`${out}/rain_${view}.png`, png(frames('rain', RAINF, view)));
  writeFileSync(`${out}/arms_${view}.png`, png(frames('floorArms', ARMSF, view)));
  writeFileSync(`${out}/devour_${view}.png`, png(frames('devour', DEVOURF, view)));
}
// ITS OLD SWIPE, BESIDE THE NEW (the game's own, as it is): drawn back; held; raked; back down
writeFileSync(`${out}/swipe_old.png`, png(frames('attack', [0.36, 0.62, 0.82, 1.3], 'front', 4, 240, null as unknown as typeof am)));
// THE BONE RAIN OVER THE WHOLE FLOOR: the shadows down, the skulls coming; the waves bursting; the piles lying
const base = tombFloor(1200, 676, 600, 370);
const at = (m: number): Px => cut(rainArena(LEAD + m, base, 600, 370), 0, 100, 1200, 540);
writeFileSync(`${out}/arena1.png`, png(at(RAIN_HIT + RAIN.first + RAIN.fly * 0.8)));
writeFileSync(`${out}/arena2.png`, png(at(RAIN_HIT + RAIN.first + RAIN.gap + RAIN.fly + 0.06)));
writeFileSync(`${out}/arena3.png`, png(at(RAIN_HIT + RAIN.first + 2 * RAIN.gap + RAIN.ripple + RAIN.fly + 0.6)));
console.log('panels in', out);
