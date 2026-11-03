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
const W = 192;
const H = 134;
interface Row { title: string; line: string; cells: { file: string; label: string }[] }
const rows: Row[] = [];
const cell = (play: Play, G: number, name: string, label: string, view = 0, ahead = 12): { file: string; label: string } => {
  const px = scene(play, Math.max(0, Math.min(playLong(play) - 1, G)), { w: W, h: H, view, sy: 0.9, ahead });
  writeFileSync(`${dir}/${name}.png`, png(scaled(px, 2)));
  return { file: `${name}.png`, label };
};
// EVERY MOVE: its own play from the film (the first thirteen parts), at its key moments (frames of the move)
const MOMENTS: [number[], string[]][] = [
  [[0, 7, 37], ['down in the bounce', 'up on his toes', 'rolling his shoulders']],
  [[0, 3, 6], ['a stride', 'both feet off the floor', 'the next stride']],
  [[11, 18, 29], ['the wind-up, held', 'up and away', 'down deep in the dust']],
  [[11, 12, 20], ['the wind-up, held', 'the strike (1 frame)', 'the wind-down']],
  [[12, 14, 22], ['the wind-up, held', 'the strike (2 frames)', 'the wind-down']],
  [[13, 15, 23], ['the wind-up, held', 'the strike (2 frames)', 'carried on round']],
  [[14, 16, 23], ['the knee cocked, held', 'the strike (2 frames)', 'carried round']],
  [[12, 14, 22], ['coiled, held', 'the strike (2 frames)', 'round to his stance']],
  [[13, 15, 31], ['coiled low, held', 'the strike (2 frames)', 'down hard in the dust']],
  [[14, 18, 30], ['coiled, held', 'the leg round (each 2 frames)', 'down in a ring of dust']],
  [[13, 15, 27], ['the lunge, held', 'the strike (2 frames)', 'dropped down']],
  [[0, 3, 6], ['before', 'the blow lands', 'driven back']],
  [[7, 30, 58], ['staggering back', 'down on one knee', 'one last fist']],
];
VET_FILM.slice(0, 13).forEach((part, i) => {
  const [fs, labels] = MOMENTS[i];
  rows.push({ title: part.title, line: part.line, cells: fs.map((f, k) => cell(part.play, part.play.lead + f, `m${i}_${k}`, labels[k])) });
});
// EACH COMBO: the globes over him as it is put in (the film's combo parts), at each move's blow
VET_FILM.slice(13, 19).forEach((part, i) => {
  const p = part.play;
  let t = p.lead;
  const cells: { file: string; label: string }[] = [];
  p.steps.forEach((st, k) => {
    const s = st.m.strikes[0];
    const f = s ? Math.max(s.at, ...s.hits.map((h) => h.f)) : 18;
    cells.push(cell(p, t + f, `c${i}_${k}`, `${k + 1}. ${st.input === 'tap' ? 'tap' : st.input === 'hold' ? 'hold' : st.input === 'swipe' ? 'swipe' : st.input === 'swipeTap' ? 'swipe, then tap' : 'swipe, then hold'}: ${st.m.name.replace(/^The /, '').toLowerCase()}`, 0, 22));
    t += st.m.long;
  });
  rows.push({ title: part.title, line: `${VET_COMBOS[i].name}. ${VET_COMBOS[i].line}`, cells });
});
writeFileSync(`${dir}/sheet.json`, JSON.stringify({ rows }, null, 1));
console.log(rows.length, 'rows');
