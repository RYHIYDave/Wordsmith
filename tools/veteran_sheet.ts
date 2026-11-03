// THE VETERAN'S MOVES, A SHEET FOR THE OWNER (docs/mockups/brawler_looks/pictures/veteran_moves_sheet.png): the key moments of
// every move (the held wind-up, the strike, the wind-down) and each combo's globes, from the film's own scenes
// (dev/veteran_scene.ts), each twice the game's size. Made outside a browser: this writes the pictures and what is said of
// each; tools/veteran_sheet.py lays them out with their captions. Nothing of the game imports it.
//   npx tsx tools/veteran_sheet.ts <dir>     then     python3 tools/veteran_sheet.py <dir> <out.png>
import { mkdirSync, writeFileSync } from 'node:fs';
import { scene, playLong } from '../src/dev/veteran_scene';
import type { Play } from '../src/dev/veteran_scene';
import { VET_FILM } from '../src/dev/veteran_plays';
import { VET_COMBOS } from '../src/dev/veteran_moves';
import { png } from './king_png';
import { scaled } from '../src/dev/king_scene';

const [dir = 'shots/veteran_sheet'] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
// (wide enough for his reach: his step in and the force on to 2½ tiles; the push kick's cone and the spinning kick's
// crescent, 3½, each a row of their own two)
const W = 192;
const H = 150;
interface Row { title: string; line: string; cells: { file: string; label: string }[] }
const rows: Row[] = [];
const cell = (play: Play, G: number, name: string, label: string, view = 0, ahead = 12, w = W, h = H, sy = 0.9, sx = 0.5): { file: string; label: string } => {
  const px = scene(play, Math.max(0, Math.min(playLong(play) - 1, G)), { w, h, view, sy, sx, ahead });
  writeFileSync(`${dir}/${name}.png`, png(scaled(px, 2)));
  return { file: `${name}.png`, label };
};
// EVERY MOVE: its own play from the film (the first thirteen parts), at its key moments (frames of the move)
const MOMENTS: [number[], string[]][] = [
  [[0, 7, 37], ['down in the bounce, in his guard', 'up on his toes', 'rolling his shoulders']],
  [[0, 3, 6], ['a stride', 'both feet off the floor', 'the next stride']],
  [[11, 18, 29], ['the wind-up, held', 'up and away', 'down deep in the dust']],
  [[11, 13, 20], ['the wind-up, held', 'a stamping step, the fist: its cone', 'the wind-down']],
  [[12, 15, 22], ['the wind-up, held', 'a stamping step, the fist: its cone', 'the wind-down']],
  [[13, 17, 23], ['the wind-up, held', 'a stamping step: its crescent', 'carried on round']],
  [[14, 18, 26], ['the knee cocked, held', 'a skipping step: its crescent', 'landed']],
  [[15, 22], ['the knee chambered, held', 'a skip in, the heel out: the cone to 3½ tiles']],
  [[18, 22, 27], ['the coil, held', 'sliding in, the elbow: its crescent', 'the turn in light']],
  [[13, 16, 31], ['coiled low, held', 'a flying leap, the fist up: launched', 'down hard in the dust']],
  [[14, 22], ['coiled, held', 'his crescent rolled out round him, 3½ tiles']],
  [[19, 22, 35], ['the lunge, held', 'a flying leap, the knee: its cone', 'landed heavy']],
  [[0, 3, 6], ['before', 'the blow lands', 'driven back']],
  [[7, 30, 58], ['staggering back', 'down on one knee', 'one last fist']],
];
VET_FILM.slice(0, MOMENTS.length).forEach((part, i) => {
  const [fs, labels] = MOMENTS[i];
  const id = part.play.steps[0].m.id;
  // (the push kick's cone and the spinning kick's crescent: two wide pictures; the blows with their reach: the camera on
  // ahead of him; the rest as before)
  const far = id === 'push' || id === 'spinkick';
  const reach = ['jab', 'cross', 'hook', 'roundkick', 'elbow', 'uppercut', 'knee'].includes(id);
  rows.push({ title: part.title, line: part.line, cells: fs.map((f, k) => far ? cell(part.play, part.play.lead + f, `m${i}_${k}`, labels[k], 0, id === 'push' ? 60 : 0, 288, 190, id === 'push' ? 0.5 : 0.7, id === 'push' ? 0.42 : 0.5) : cell(part.play, part.play.lead + f, `m${i}_${k}`, labels[k], 0, reach ? 44 : 12, W, reach ? 172 : H, reach ? (id === 'uppercut' || id === 'knee' ? 0.74 : 0.66) : 0.9)) });
});
// EACH COMBO: the globes over him as it is put in (the film's combo parts), at each move's blow
VET_FILM.slice(MOMENTS.length, MOMENTS.length + 6).forEach((part, i) => {
  const p = part.play;
  let t = p.lead;
  const cells: { file: string; label: string }[] = [];
  p.steps.forEach((st, k) => {
    const s = st.m.strikes[0];
    const f = s ? (s.cone ? s.at + 4 : s.force ? (s.force.from ?? s.at) + Math.min(s.force.long, 4) : Math.max(s.at, ...s.hits.map((h) => h.f))) : 18;
    cells.push(cell(p, t + f, `c${i}_${k}`, `${k + 1}. ${st.input === 'tap' ? 'tap' : st.input === 'hold' ? 'hold' : st.input === 'swipe' ? 'swipe' : st.input === 'swipeTap' ? 'swipe, then tap' : 'swipe, then hold'}: ${st.m.name.replace(/^The /, '').toLowerCase()}`, 0, 40, W, 182, 0.74));
    t += st.m.long;
  });
  rows.push({ title: part.title, line: `${VET_COMBOS[i].name}. ${VET_COMBOS[i].line}`, cells });
});
writeFileSync(`${dir}/sheet.json`, JSON.stringify({ rows }, null, 1));
console.log(rows.length, 'rows');
