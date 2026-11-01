// THE AMALGAMATION'S ACTION REWORK, SECOND ROUND: THE SHEET (docs/mockups/action_f4_amalgam/pictures/amalgam_action2_sheet.png):
// the new rakes from in front and from behind, with the knight for size; the first round's rake beside the new; a bone mite close
// (forming, skittering, the bite held and snapped, struck dead), from in front and from behind; the mites swarming the knight; the
// bone rain over the whole floor. Panels are laid out with their captions by tools/action_f4_amalgam_captions2.py. Nothing of the
// game imports it.
//   npx tsx tools/action_f4_amalgam_sheet2.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { SWIPE1_HITS, SWIPE_HITS } from '../src/art/amalgam_action';
import { RAIN } from '../src/art/amalgam_action_fx';
import { BONE_MITE, MITE } from '../src/art/amalgam_mites';
import { deathOfMob, paintMob } from '../src/art/new_mobs3';
import { RAIN_HIT } from '../src/art/amalgam_action';
import { tombFloor } from '../src/dev/action_f1_scene';
import { LEAD, figures, rainArena } from '../src/dev/action_f4_amalgam_scene';
import { frameAt } from '../src/dev/action_f3_scene';
import { cut, lay, scaled, shadow } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet2';
mkdirSync(out, { recursive: true });
const { am, am1, knight } = figures();
const f = (n: number): number => n / 30;

/** A row of cells side by side, a dark line between them. */
function row(cells: Px[]): Px {
  const w = cells[0].w;
  const r = new Px(w * cells.length, cells[0].h);
  cells.forEach((c, i) => r.blit(c, i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
/** Rows of cells, a dark line between them. */
function rows(list: Px[][]): Px {
  const rs = list.map(row);
  const o = new Px(rs[0].w, rs.reduce((a, r) => a + r.h, 0));
  let y = 0;
  for (const r of rs) {
    o.blit(r, 0, y);
    if (y) for (let x = 0; x < o.w; x++) o.set(x, y, '#07060c').set(x, y - 1, '#07060c');
    y += r.h;
  }
  return o;
}
/** A cell `w` by `h`: the floor, it at its floor point, the knight 2.7 tiles before it (as in the film), for size. */
function cell(view: 'front' | 'back', fig: Laid, w: number, h: number): Px {
  const p = new Px(w, h);
  const [x, y] = view === 'front' ? [Math.round(w * 0.36), 132] : [Math.round(w * 0.4), 200];
  p.d.set(tombFloor(w, h, x + 30, y - 10).d);
  // (2.7 tiles before it: from in front down-right, from behind up-right)
  const [kx, ky] = view === 'front' ? [x + 86, y + 43] : [x + 86, y - 43];
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
const RAKEF = [f(10), f(21), SWIPE_HITS[0], f(30), f(54), SWIPE_HITS[1]];
for (const view of ['front', 'back'] as const) {
  const cells = RAKEF.map((t) => cell(view, frameAt(am, view, 'attack', t), 400, 250));
  writeFileSync(`${out}/rakes_${view}.png`, png(rows([cells.slice(0, 3), cells.slice(3)])));
}
// BEFORE AND NOW: the first round's right rake as it lands, and the new one's
writeFileSync(`${out}/beside.png`, png(row([cell('front', frameAt(am1, 'front', 'attack', SWIPE1_HITS[0] + f(1)), 600, 250), cell('front', frameAt(am, 'front', 'attack', SWIPE_HITS[0]), 600, 250)])));

// A BONE MITE, CLOSE (three times the game's pictures): forming, skittering, its bite held, the snap, struck dead
const K = 3;
function miteCell(p: Px, w = 200, h = 200): Px {
  const c = new Px(w, h);
  c.d.set(tombFloor(w, h, w / 2, h - 80, K).d);
  const ax = 84;
  const ay = 132;
  const big = scaled(p, K);
  lay(c, { px: big, ax: ax * K, ay: ay * K }, Math.round(w * 0.4), h - 80);
  return c;
}
const MITEF: [string, number][] = [['form', 0.04], ['form', 0.3], ['walk', f(1)], ['attack', f(9)], ['attack', MITE.bite.hit], ['die', 0.26]];
for (const view of ['front', 'back'] as const) {
  const cells = MITEF.map(([mv, t]) => miteCell(mv === 'die' ? deathOfMob(BONE_MITE, t / MITE.die, view).px : paintMob(BONE_MITE, mv, t, view).px));
  writeFileSync(`${out}/mite_${view}.png`, png(row(cells)));
}
// THE MITES SWARMING THE KNIGHT, twice the game's pixels; and THE BONE RAIN OVER THE WHOLE FLOOR
const base = tombFloor(1200, 676, 600, 370);
const at = (m: number): Px => rainArena(LEAD + m, base, 600, 370);
const third = RAIN_HIT + RAIN.first + 2 * RAIN.gap + RAIN.ripple + RAIN.fly;
writeFileSync(`${out}/arena1.png`, png(cut(at(RAIN_HIT + RAIN.first + RAIN.gap + RAIN.fly + 0.3), 0, 100, 1200, 540)));
writeFileSync(`${out}/arena2.png`, png(cut(at(third + 0.9), 0, 100, 1200, 540)));
{
  const p = at(third + 1.5);
  // (round the knight: where most of them are)
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const i = (y * p.w + x) * 4;
    if (p.d[i] > 200 && p.d[i + 1] < 120 && p.d[i + 2] < 120) {
      sx += x;
      sy += y;
      n++;
    }
  }
  const cx = n ? Math.round(sx / n) : 600;
  const cy = n ? Math.round(sy / n) : 370;
  writeFileSync(`${out}/swarm.png`, png(scaled(cut(p, Math.max(0, cx - 300), Math.max(0, cy - 110), 600, 220), 2)));
}
console.log('panels in', out);
