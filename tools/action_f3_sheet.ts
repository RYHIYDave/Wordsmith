// THE FLOOR 3 ACTION SHEET (docs/mockups/action_f3/pictures/action_f3_sheet.png): key frames of the green troll's rampage and
// bull rush, the slam's ring and the rush's lane, and the Boneward's shield wall. Raw panels are written here;
// tools/action_f3_captions.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/action_f3_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { BRUTE_CANVAS, RAMPAGE_HITS } from '../src/art/monster_brute';
import { WALL } from '../src/art/action_f3_fx';
import { tombFloor } from '../src/dev/action_f1_scene';
import { LEAD, figures, frameAt, rampageScene, rushScene, rushTimes, wallScene } from '../src/dev/action_f3_scene';
import type { View } from '../src/dev/action_f3_scene';
import { cut, lay, scaled, shadow } from '../src/dev/king_scene';
import type { Laid } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const { brute, boneward } = figures();

/** A row of cells side by side, made `k` times as big, a dark line between them. */
function row(cells: Px[], k: number): Px {
  const w = cells[0].w * k;
  const r = new Px(w * cells.length, cells[0].h * k);
  cells.forEach((c, i) => r.blit(scaled(c, k), i * w, 0));
  for (let i = 1; i < cells.length; i++) for (let y = 0; y < r.h; y++) r.set(i * w, y, '#07060c').set(i * w - 1, y, '#07060c');
  return r;
}
/** A cell of floor `w` by `h`, with a figure standing at (x, y). */
function cell(w: number, h: number, x: number, y: number, fig: Laid, sh = 9): Px {
  const p = new Px(w, h);
  p.d.set(tombFloor(w, h, x, y + 40).d);
  shadow(p, x, y, sh);
  lay(p, fig, x, y);
  return p;
}
const [h1, h2, h3] = RAMPAGE_HITS;
// THE RAMPAGE: wound, HELD; the swing (its second frame); the backhand; the club up, crouched, HELD; the leap; the slam (twice as big)
const RAMP = [0.5, h1, h2, 1.9, 2.2, h3];
for (const view of ['front', 'back'] as const) writeFileSync(`${out}/rampage_${view}.png`, png(row(RAMP.map((t) => cell(100, 132, 44, 112, frameAt(brute, view, 'attack', t), 13)), 2)));
// THE SLAM'S RING, in the scene: marked (the game's red circle) as he leaps; the slam's first frame; 0.15 s on; 0.7 s on (cracks, dust)
const rampScene = (t: number): Px => cut(rampageScene("front", LEAD + t, tombFloor(400, 250, 150, 112), 150, 112), 0, 16, 300, 170);
writeFileSync(`${out}/ring.png`, png(row([rampScene(2.2), rampScene(h3 + 0.02), rampScene(h3 + 0.15), rampScene(h3 + 0.7)], 1)));
// THE BULL RUSH: head down; the fist down, pawing; HELD; running; dug in; rocked back, shaking his head (twice as big)
const { go } = rushTimes();
const RUSH: [string, number][] = [['chargeWind', 0.2], ['chargeWind', 0.46], ['chargeWind', 0.9], ['charge', 1 / 30], ['chargeStop', 0.1], ['chargeStop', 0.5]];
for (const view of ['front', 'back'] as const) writeFileSync(`${out}/rush_${view}.png`, png(row(RUSH.map(([m, t]) => cell(100, 110, 48, 92, frameAt(brute, view, m, t), 13)), 2)));
// THE LANE, in the scene: marked as he paws; and as he runs it
const lane = (view: View, t: number): Px => cut(rushScene(view, t, tombFloor(600, 300, 290, 150), 290, 150), 0, 0, 600, 300);
writeFileSync(`${out}/lane.png`, png(row([lane('front', LEAD + 0.8), lane('front', go + 0.25)], 1)));
// THE BONEWARD: behind its wall, standing; advancing (two frames); the glance; struck from the side; lowering its shield to throw (three times as big)
const BW: [string, number][] = [['stand', 0], ['walk', 0.09], ['walk', 0.45], ['glance', 0.034], ['reel', 0.067], ['throw', 0.3]];
for (const view of ['front', 'back'] as const) writeFileSync(`${out}/boneward_${view}.png`, png(row(BW.map(([m, t]) => cell(66, 92, 30, 80, frameAt(boneward, view, m, t), 10)), 3)));
// THE GLANCE AND THE BLOW FROM THE SIDE, in the scene with the knight (three times as big)
const wall = (t: number): Px => cut(wallScene('front', t, tombFloor(260, 170, 105, 100), 105, 100), 25, 28, 200, 110);
writeFileSync(`${out}/wall_scene.png`, png(row([wall(2.25 + 0.02), wall(2.25 + WALL.glance + 0.5 + 0.03)], 3)));
void BRUTE_CANVAS;
console.log('panels in', out);
