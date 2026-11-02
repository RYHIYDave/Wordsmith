// THE THREE FIXES' SHEET (docs/mockups/action_fixes/pictures/action_fixes_sheet.png): the film's frames at the key moments of each
// fix, written out for tools/action_fixes_sheet.py to lay out beside the old (stills of the branch before, at the same scale, made by
// its own film tools) with their captions. Nothing of the game imports it.
//   npx tsx tools/action_fixes_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { parts } from './action_fixes_film';
import { png } from './king_png';

const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
/** [name, the film's part, seconds into it]. */
export const CELLS: [string, number, number][] = [
  ['q_held', 0, 1.2],
  ['q_hit', 0, 1.9],
  ['q_fountain', 0, 1.87],
  ['q_ring', 0, 2.25],
  ['q_hang', 1, 3.0],
  ['q_crater', 0, 3.5],
  ['rk_marked', 3, 1.5],
  ['rk_flood', 3, 3.0],
  ['rk_rollmarks', 4, 0.5],
  ['rk_rollflood', 4, 2.6],
  ['rk_held', 5, 1.2],
  ['rk_strike', 5, 1.6],
  ['rk_run', 5, 1.95],
  ['rk_open', 5, 2.7],
  ['d_gallop', 8, 1.6],
  ['d_hedge', 8, 2.4],
  ['d_stretch', 10, 0.5],
  ['d_gather', 10, 0.767],
  ['d_rise', 8, 1.75],
  ['d_wither', 11, 0.9],
];
for (const [name, i, t] of CELLS) writeFileSync(`${out}/${name}.png`, png(parts[i].frame(t)));
console.log('cells', CELLS.length, out);
