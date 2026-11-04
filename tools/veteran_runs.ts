// HIS RUN MADE NEW, BEFORE AND NOW (docs/mockups/brawler_looks/pictures/brawler_run.png). His words, 3 Nov 2026, 18:08:
// “And his running animation is reused which I explicitly said not to do”. This writes pictures of one run at its key
// moments, from in front and from behind, at the game's size (his floor point at the anchor written beside them):
//   vet       the Veteran's run as it is in the tree it is run in (run once in the old version's files, 92c4a95, for his old
//             run, and once in these, for the new one)
//   brawler   the old Brawler's run (dev/brawler_moves.ts), for what his old run was built on: brought in only here, only
//             for this picture (nothing of the Veteran's own brings it in: tests/veteran.test.ts)
// Each moment by name: a foot comes down; on it; springing off it; in the air (the frames of each run are its own). Then
//   python3 tools/veteran_runs.py <brawler dir> <old dir> <new dir> <out.png>
// lays them out side by side, three times the game's size. Nothing of the game imports it.
//   npx tsx tools/veteran_runs.ts <dir> vet 0,2,3,6     |     npx tsx tools/veteran_runs.ts <dir> brawler 0,2,3,5
import { mkdirSync, writeFileSync } from 'node:fs';
import { png } from './king_png';

const [dir = 'shots/veteran_runs', which = 'vet', list = '0,2,3,6'] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
const frames = list.split(',').map(Number);
const VIEWS: [string, number][] = [['front', 0], ['back', 90]];
const out: { file: string; view: string; f: number; ax: number; ay: number; long: number }[] = [];

async function main(): Promise<void> {
  if (which === 'brawler') {
    const bm = await import('../src/dev/brawler_moves');
    const skin = await import('../src/art/skin');
    const run = bm.brawlerMoves()[1];
    for (const f of frames) {
      for (const [view, turn] of VIEWS) {
        const d = bm.drawBrawlerAt('front', run, f / 30, turn);
        const file = `${view}_${f}.png`;
        writeFileSync(`${dir}/${file}`, png(d.px));
        out.push({ file, view, f, ax: skin.CANVAS3.ax, ay: skin.CANVAS3.ay, long: Math.round(run.long * 30) });
      }
    }
  } else {
    const vm = await import('../src/dev/veteran_moves');
    const sv = await import('../src/dev/sculpt_veteran');
    const run = vm.motionById('run');
    for (const f of frames) {
      for (const [view, turn] of VIEWS) {
        const d = sv.paintVeteran(vm.vetAt(run, f), turn + vm.placeOf(run, f).turn);
        const file = `${view}_${f}.png`;
        writeFileSync(`${dir}/${file}`, png(d.px));
        out.push({ file, view, f, ax: sv.VET_CANVAS.ax, ay: sv.VET_CANVAS.ay, long: run.long });
      }
    }
  }
  writeFileSync(`${dir}/shots.json`, JSON.stringify(out, null, 1));
  console.log(dir, out.length, 'pictures');
}
void main();
