// THE CARRION QUEEN'S MOVES DONE THE ACTION WAY: THE SHEET (docs/mockups/action_f7_queen/pictures/queen_action_sheet.png): key
// moments of each move from in front and from behind, on her eyrie with the knight; her old gust beside the new; the Eclipse over the
// whole ledge at three moments. Panels are laid out here with their captions by tools/action_f7_queen_captions.py. Nothing of the
// game imports it.
//   npx tsx tools/action_f7_queen_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { QA_DIVE, QA_ECLIPSE, QA_GUST, QA_RAKE, f } from '../src/art/carrion_queen_action';
import { Q2_GUST } from '../src/art/carrion_queen2_moves';
import { LEAD, arenaDives, arenaFloor, closeFloor, diveScene, eclipseArena, eclipseCloseScene, gustScene, rakeScene } from '../src/dev/action_f7_queen_scene';
import type { View } from '../src/dev/action_f7_queen_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A row of cells side by side, a dark line between them. */
function row(cells: Px[]): Px {
  const w = cells.reduce((a, c) => a + c.w, 0);
  const r = new Px(w, cells[0].h);
  let x = 0;
  for (const c of cells) {
    for (let y = 0; y < c.h; y++) r.d.set(c.d.subarray(y * c.w * 4, (y + 1) * c.w * 4), (y * w + x) * 4);
    if (x) for (let y = 0; y < r.h; y++) r.set(x, y, '#07060c').set(x - 1, y, '#07060c');
    x += c.w;
  }
  return r;
}
const BASES = new Map<string, Px>();
function cell(scene: Scene, view: View, m: number, w: number, h: number, cx: number, cy: number): Px {
  const key = `${view}${w}x${h}@${cx},${cy}`;
  if (!BASES.has(key)) BASES.set(key, closeFloor(view, w, h, cx, cy));
  return scene(view, LEAD + m, BASES.get(key) as Px, cx, cy);
}
const three = (scene: Scene, view: View, ms: number[], cx: number, cy: number, h = 338): Px => row(ms.map((m) => cell(scene, view, m, 400, h, cx, cy)));
// HER RAKE: hung high, HELD, the wedge lit; raked down, the gouges torn out; burning, she mantles
const RK = [f(22), QA_RAKE.hit, QA_RAKE.hit + 0.3];
writeFileSync(`${out}/rake_front.png`, png(three(rakeScene, 'front', RK, 160, 330, 420)));
writeFileSync(`${out}/rake_back.png`, png(three(rakeScene, 'back', RK, 150, 380, 420)));
// HER GUST: reared, HELD, its rays marked; clapped, the blast out along them; the knight shoved straight away from her
const GU = [f(24), QA_GUST.hit + f(2), QA_GUST.hit + 0.3];
writeFileSync(`${out}/gust_front.png`, png(three(gustScene, 'front', GU, 120, 220)));
writeFileSync(`${out}/gust_back.png`, png(three(gustScene, 'back', GU, 120, 300)));
// HER OLD GUST BESIDE THE NEW: the old drawn back, and clapped; the new held, and clapped
{
  const old = (m: number): Px => cell((v, t, b, cx, cy) => gustScene(v, t, b, cx, cy, true), 'front', m, 300, 338, 100, 230);
  const neu = (m: number): Px => cell(gustScene, 'front', m, 300, 338, 100, 230);
  writeFileSync(`${out}/gust_old.png`, png(row([old(Q2_GUST.warn + 0.15), old(Q2_GUST.hit + f(4)), neu(f(24)), neu(QA_GUST.hit + f(4))])));
}
// HER DIVE: up out of sight, her line marked, HELD; down it, talons in the rock; ripped free, beating home
const DV = [f(40), QA_DIVE.hit, QA_DIVE.hit + 0.45];
writeFileSync(`${out}/dive_front.png`, png(three(diveScene, 'front', DV, 110, 200)));
writeFileSync(`${out}/dive_back.png`, png(three(diveScene, 'back', DV, 110, 300)));
// THE ECLIPSE CLOSE UP: screaming, HELD, the flock gathering; the sweep, the flock pouring over, the light going; the dark, a pool
const EC = [f(40), QA_ECLIPSE.hit + f(4), QA_ECLIPSE.hit + 1.3];
writeFileSync(`${out}/eclipse_front.png`, png(three(eclipseCloseScene, 'front', EC, 190, 480, 520)));
writeFileSync(`${out}/eclipse_back.png`, png(three(eclipseCloseScene, 'back', EC, 190, 480, 520)));
// THE ECLIPSE OVER THE WHOLE LEDGE: the light going; a dive marked at the knight crossing the dark; the dive that finds him
{
  const base = arenaFloor(1200, 676, 640, 330);
  const dives = arenaDives();
  const hit = dives.find((d) => d.hits) ?? dives[0];
  const ms = [QA_ECLIPSE.hit + 0.5, hit.mark + QA_ECLIPSE.warn * 0.75, hit.mark + QA_ECLIPSE.warn + f(2)];
  ms.forEach((m, i) => writeFileSync(`${out}/arena_${i}.png`, png(eclipseArena(LEAD + m, base, 640, 330))));
}
console.log('done', out);
