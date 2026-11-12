// THE TINKERER AND THE BRAWLER (THE VETERAN) FROM EIGHT SIDES: raw pictures of each side, for the sheets of
// docs/mockups/eight_sides (tools/eight_sides_sheet.py lays them out). Not in the game.
//   npx tsx tools/eight_sides_raw.ts <out dir> [stand|run|moves]
import fs from 'node:fs';
import path from 'node:path';
import { encodePng } from './png.mjs';
import type { Px } from '../src/engine/px';
import { WU_SIDES, WU_SPIN } from '../src/art/warrior_up';
import { paintVeteran } from '../src/dev/sculpt_veteran';
import { VET_RUN, VET_STAND, motionById, spinAt, vetAt } from '../src/dev/veteran_moves';
import { TRUN_ROUND, drawTinkerAt, tinkerMoves } from '../src/dev/tinkerer_moves';

const out = process.argv[2] ?? 'shots/eight';
const what = process.argv[3] ?? 'stand';
fs.mkdirSync(out, { recursive: true });
const save = (px: Px, name: string): void => {
  fs.writeFileSync(path.join(out, name), encodePng(px.w, px.h, Buffer.from(px.d.buffer, px.d.byteOffset, px.d.byteLength)));
};
const t0 = Date.now();
const moves = tinkerMoves();
const stand = moves.find((m) => m.name.startsWith('Standing'))!;
const run = moves.find((m) => m.name.startsWith('Running'))!;
for (const side of WU_SIDES) {
  const turn = WU_SPIN[side].spin;
  if (what === 'stand') {
    save(drawTinkerAt('front', stand, 0, turn).px, `tinkerer_stand_${side}.png`);
    const p = vetAt(VET_STAND, 0);
    save(paintVeteran(p, turn + spinAt(VET_STAND, 0)).px, `brawler_stand_${side}.png`);
  } else if (what === 'run') {
    save(drawTinkerAt('front', run, TRUN_ROUND * 0.25, turn).px, `tinkerer_run_${side}.png`);
    const f = Math.round(VET_RUN.long * 0.25);
    save(paintVeteran(vetAt(VET_RUN, f), turn + spinAt(VET_RUN, f)).px, `brawler_run_${side}.png`);
  } else {
    const m = motionById('cross');
    const f = Math.min(...m.strikes.map((s) => s.at));
    save(paintVeteran(vetAt(m, f), turn + spinAt(m, f)).px, `brawler_cross_${side}.png`);
  }
  console.log(side, turn, `${Date.now() - t0} ms`);
}
