// FLOOR 9'S SIDE BOSSES' NEW POSES ON A SHEET (their walks, deaths, stands and flinches as the game will show them; art/f9_bosses_moves.ts):
//   node node_modules/tsx/dist/cli.mjs tools/f9_bosses_poses.ts <out.png> <chief|wolf> <walk|die|still|reel|move:NAME> [view] [n] [scale]
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { CHIEF9_CANVAS, WOLF9_CANVAS, sculptChief9, sculptWolf9 } from '../src/art/f9_bosses_sculpt';
import { CHIEF_MOVES, CHIEF_PLAY, WOLF_MOVES, WOLF_PLAY, chiefDie, chiefInPlay, chiefReel, chiefStill, chiefWalk, wolfDie, wolfInPlay, wolfReel, wolfStill, wolfWalk } from '../src/art/f9_bosses_moves';
import type { ChiefMove, WolfMove } from '../src/art/f9_bosses_moves';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const [out = '/tmp/poses.png', who = 'chief', what = 'walk', view = 'front', nArg = '8', scaleArg = '1'] = process.argv.slice(2);
const n = Number(nArg);
const scale = Number(scaleArg);
const chief = who === 'chief';
const C = chief ? { w: 300, h: 300, ax: 150, ay: 250 } : { w: 380, h: 280, ax: 190, ay: 236 };
void CHIEF9_CANVAS;
void WOLF9_CANVAS;
const long = what === 'walk' ? (chief ? CHIEF_PLAY.walk.frames / CHIEF_PLAY.walk.fps : WOLF_PLAY.walk.frames / WOLF_PLAY.walk.fps) : what === 'die' ? (chief ? CHIEF_PLAY.dies : WOLF_PLAY.dies) : what === 'still' ? 2 : what === 'reel' ? 0.3 : chief ? CHIEF_MOVES[what.slice(5) as ChiefMove].long : WOLF_MOVES[what.slice(5) as WolfMove].long;
const cols = Math.min(n, 6);
const rows = Math.ceil(n / cols);
const sheet = new Px(C.w * cols * scale, C.h * rows * scale);
for (let i = 0; i < sheet.w * sheet.h; i++) sheet.set(i % sheet.w, Math.floor(i / sheet.w), (Math.floor(i % sheet.w / 16) + Math.floor(i / sheet.w / 16)) % 2 ? '#3a4a2c' : '#34442a');
for (let i = 0; i < n; i++) {
  const t = what === 'walk' ? (i / n) * long : (i / Math.max(1, n - 1)) * long;
  const v = view as 'front' | 'rear';
  const d = chief
    ? sculptChief9(v, what === 'walk' ? chiefWalk(t) : what === 'die' ? chiefDie(t) : what === 'still' ? chiefStill(t) : what === 'reel' ? chiefReel(t) : chiefInPlay(what.slice(5) as ChiefMove, t), 45, C)
    : sculptWolf9(v, what === 'walk' ? wolfWalk(t) : what === 'die' ? wolfDie(t) : what === 'still' ? wolfStill(t) : what === 'reel' ? wolfReel(t) : wolfInPlay(what.slice(5) as WolfMove, t), 45, C);
  const ox = (i % cols) * C.w * scale;
  const oy = Math.floor(i / cols) * C.h * scale;
  for (let y = 0; y < C.h; y++) for (let x = 0; x < C.w; x++) {
    const c = d.px.get(x, y);
    if (!c) continue;
    for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) sheet.set(ox + x * scale + a, oy + y * scale + b, c);
  }
  // (the floor point)
  for (let k = -3; k <= 3; k++) {
    sheet.set(ox + C.ax * scale + k, oy + C.ay * scale, '#ff00ff');
    sheet.set(ox + C.ax * scale, oy + C.ay * scale + k, '#ff00ff');
  }
}
writeFileSync(out, png(sheet));
console.log(out, sheet.w, sheet.h);
