// THE FLOORS 11 TO 15 ACTION SHEET (docs/mockups/action_f11/pictures/action_f11_sheet.png): key moments of each new move, each with the
// knight in its scene (from in front and from behind), and each old move beside its new one at the same scale. Raw panels are written
// here; tools/action_f11_captions.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/action_f11_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import type { ActorArt } from '../src/art/actor_types';
import { CHOP_HIT, LOB_HIT } from '../src/art/action_f11_watch';
import { HARVEST_HITS } from '../src/art/action_f11_field';
import { BLOW_HIT, GURNEY_HIT } from '../src/art/action_f11_orderly';
import { BARRAGE_HIT, SLAM_HIT } from '../src/art/action_f11_warden';
import { WA_ROUND, WA_SWEEP, makeWatchArt3 } from '../src/art/hushed_watch_moves';
import { FH_SLASH, makeFieldArt3 } from '../src/art/fieldhands_moves';
import { OD_BLOW, OD_QUAKE, makeOrderlyArt3 } from '../src/art/orderlies_moves';
import { WB_SLAM, WB_STORM, makeBookwardenArt3 } from '../src/art/bookwardens_moves';
import { frameAt } from '../src/dev/action_f3_scene';
import { LEAD, barrageScene, blowScene, chopScene, figures, gurneyScene, gurneyTimes, harvestScene, lobScene, lobTimes, slamScene, standInFloor } from '../src/dev/action_f11_scene';
import type { Ground, View } from '../src/dev/action_f11_scene';
import { cut, lay, scaled, shadow } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const F = figures();
const f = (n: number): number => n / 30;

/** A row of cells side by side, made `k` times as big, a dark line between them. */
function row(cells: Px[], k: number): Px {
  const w = cells[0].w * k;
  const r = new Px(w * cells.length, cells[0].h * k);
  cells.forEach((c, i) => r.blit(scaled(c, k), i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
/** A cell of a figure's move at `t`, standing at (x, y) on its floor. */
function cell(ground: Ground, w: number, h: number, x: number, y: number, art: ActorArt, view: View, move: string, t: number, sh = 12): Px {
  const p = standInFloor(ground, w, h, x, y);
  shadow(p, x, y, sh);
  lay(p, frameAt(art, view, move, t), x, y, 1);
  return p;
}
const put = (name: string, p: Px): void => writeFileSync(`${out}/${name}.png`, png(p));
type SceneFn = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A cut of a scene at `t`: the scene made `w` by `h` round (cx, cy), cut to (x, y, cw, ch). */
const shot = (ground: Ground, scene: SceneFn, view: View, t: number, w: number, h: number, cx: number, cy: number, x: number, y: number, cw: number, ch: number): Px => cut(scene(view, t, standInFloor(ground, w, h, cx, cy), cx, cy), x, y, cw, ch);
/** Six moments of a move, from in front, twice as big. */
const six = (name: string, ground: Ground, art: ActorArt, move: string, ts: number[], x = 46, y = 110, h = 130): void => put(name, row(ts.map((t) => cell(ground, 100, h, x, y, art, 'front', move, t)), 2));
/** Old and new, two moments of each, at the same scale (twice as big). */
const oldNew = (name: string, ground: Ground, a: ActorArt, am: string, at: number[], b: ActorArt, bm: string, bt: number[], x = 62, y = 112, h = 130): void =>
  put(name, row([...at.map((t) => cell(ground, 150, h, x, y, a, 'front', am, t)), ...bt.map((t) => cell(ground, 150, h, x, y, b, 'front', bm, t))], 2));

// FLOOR 11: THE WATCHMAN
const oldWatch = makeWatchArt3();
six('chop', 'street', F.watch, 'attack', [0.27, 0.6, f(25), CHOP_HIT, 1.1, 1.7], 40, 132, 150);
put('chop_scene', row([shot('street', chopScene, 'front', LEAD + 0.6, 400, 225, 190, 172, 50, 40, 300, 150), shot('street', chopScene, 'back', LEAD + CHOP_HIT + 0.2, 400, 225, 178, 171, 50, 30, 300, 150)], 2));
oldNew('chop_old_new', 'street', oldWatch, 'attack', [0.5, WA_SWEEP.hit], F.watch, 'attack', [0.6, CHOP_HIT], 62, 132, 150);
six('lob', 'street', F.watch, 'lantern', [0.34, 0.6, f(27), LOB_HIT, 1.12, 1.62], 40, 132, 150);
const lt = lobTimes();
put('lob_scene', row([shot('street', lobScene, 'front', lt.hit + (lt.lands - lt.hit) * 0.5, 600, 338, 300, 165, 120, 40, 300, 150), shot('street', lobScene, 'back', lt.lands + 0.9, 600, 338, 300, 205, 130, 120, 300, 150)], 2));
oldNew('lob_old_new', 'street', oldWatch, 'round', [0.6, WA_ROUND.hit], F.watch, 'lantern', [0.6, LOB_HIT], 62, 132, 150);

// FLOOR 13: THE REAPER
const oldField = makeFieldArt3();
six('harvest', 'fields', F.field, 'attack', [0.45, HARVEST_HITS[0], 1.04, HARVEST_HITS[1], 1.72, HARVEST_HITS[2]], 16, 86, 120);
put('harvest_scene', row([shot('fields', harvestScene, 'front', LEAD + HARVEST_HITS[1], 400, 225, 170, 110, 40, 20, 300, 150), shot('fields', harvestScene, 'back', LEAD + HARVEST_HITS[2] + 0.18, 400, 225, 170, 160, 40, 30, 300, 150)], 2));
oldNew('harvest_old_new', 'fields', oldField, 'attack', [0.35, FH_SLASH.hit], F.field, 'attack', [0.45, HARVEST_HITS[2]], 44, 90, 120);

// FLOOR 14: THE ORDERLY
const oldOrderly = makeOrderlyArt3();
six('blow', 'ward', F.orderly, 'attack', [0.25, 0.6, f(25), BLOW_HIT, 1.3, 1.9], 46, 122, 150);
oldNew('blow_old_new', 'ward', oldOrderly, 'attack', [0.5, OD_BLOW.floor], F.orderly, 'attack', [0.6, BLOW_HIT], 62, 122, 150);
six('gurney', 'ward', F.orderly, 'gurney', [0.3, 0.7, f(28), GURNEY_HIT, 1.2, 1.75], 50, 122, 150);
const gt = gurneyTimes();
put('gurney_scene_a', row([shot('ward', (v, t, b, cx, cy) => gurneyScene(v, t, b, cx, cy, false), 'front', gt.hit - 0.2, 600, 338, 300, 150, 70, 20, 300, 150), shot('ward', (v, t, b, cx, cy) => gurneyScene(v, t, b, cx, cy, false), 'front', gt.hit + 0.18, 600, 338, 300, 150, 140, 60, 300, 150)], 2));
put('gurney_scene_b', row([shot('ward', (v, t, b, cx, cy) => gurneyScene(v, t, b, cx, cy, false), 'front', gt.hit + 0.5, 600, 338, 300, 150, 190, 90, 300, 150), shot('ward', (v, t, b, cx, cy) => gurneyScene(v, t, b, cx, cy, true), 'back', gt.hit + 1.05, 600, 338, 300, 190, 270, 40, 300, 150)], 2));
oldNew('gurney_old_new', 'ward', oldOrderly, 'quake', [0.7, OD_QUAKE.floor], F.orderly, 'gurney', [0.7, GURNEY_HIT], 70, 122, 150);

// FLOOR 15: THE BOOKWARDEN
const oldWarden = makeBookwardenArt3();
six('slam', 'library', F.warden, 'attack', [0.3, 0.6, f(25), SLAM_HIT, 1.2, 1.7], 40, 132, 150);
oldNew('slam_old_new', 'library', oldWarden, 'attack', [f(27), WB_SLAM.floor], F.warden, 'attack', [f(25), SLAM_HIT], 50, 132, 150);
six('barrage', 'library', F.warden, 'barrage', [0.25, 0.8, f(31), BARRAGE_HIT, 1.4, 2.2], 46, 132, 150);
put('barrage_scene', row([shot('library', barrageScene, 'front', LEAD + 0.85, 600, 338, 300, 170, 110, 60, 300, 150), shot('library', barrageScene, 'front', LEAD + BARRAGE_HIT + 0.42, 600, 338, 300, 170, 140, 70, 300, 150)], 2));
put('barrage_scene_b', row([shot('library', barrageScene, 'back', LEAD + BARRAGE_HIT + 0.3, 600, 338, 300, 200, 130, 70, 300, 150), shot('library', barrageScene, 'back', LEAD + BARRAGE_HIT + 0.6, 600, 338, 300, 200, 150, 90, 300, 150)], 2));
oldNew('barrage_old_new', 'library', oldWarden, 'storm', [0.8, WB_STORM.open[1] + 0.1], F.warden, 'barrage', [0.8, BARRAGE_HIT], 62, 132, 150);
void blowScene;
void slamScene;
console.log('panels in', out);
