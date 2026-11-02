// THE CHIP'S WORK, COUNTED (docs/mockups/gpu_sculpt/README.md, "Round 2"): a few frames marched as the chip marches them, in
// the CPU's own numbers (`listMarch`), with every saving of round 2 off (round 1) or as made (round 2): how many rays, how
// many marched, the steps, the list entries walked and the solids' distances worked out (in the march, and after it: the way
// the skin faces, its creases, whose), the first pass's bounds asked and worked out, the cells and solids; and how many of
// the frame's pixels differ from the CPU's own picture in these 64-bit numbers (the chip's 32-bit sums aside).
//   npx tsx tools/gpu_counts.ts [round1|round2] [--only <part of a list's name>]
// (one way a run: the Brawler keeps a frame painted once for a pose, so a second way in the same run would paint nothing)
// @ts-ignore
import { COUNT, GPU_ROUND2, GPU_SCULPT, GPU_SCULPT_TEST, GRID_SEEN, countReset } from '../src/dev/gpu_sculpt';
import { hashSprite, listsOf } from './cheap_heroes';
// @ts-ignore
import { readFileSync } from 'node:fs';
import { paintingOf } from '../tests/helpers';
import { INK } from '../src/art/kit';
import { rgba } from '../src/engine/px';
import type { Who } from './cheap_heroes';

declare const process: { argv: string[] };
const PICK: [Who, string, number, string][] = [
  ['warlock', 'warlock:dungeon/front.idle', 16, 'the Warlock standing'],
  ['warlock', 'warlock:dungeon/front.clips.attack.frames', 12, 'his bolt'],
  ['warlock', 'warlock:dungeon/front.clips.change.frames', 24, 'the change'],
  ['warlock', 'warlock:demon/front.idle', 16, 'the demon standing'],
  ['warlock', 'warlock:demon/front.clips.attack.frames', 12, 'its rake'],
  ['tinkerer', 'tinkerer:dungeon/front.idle', 16, 'the Tinkerer standing'],
  ['brawler', 'brawler:dungeon/front.idle', 17, 'the Brawler standing'],
];
const way = process.argv[2] === 'round1' ? 'round1' : 'round2';
const oi = process.argv.indexOf('--only');
const only = oi >= 0 ? process.argv[oi + 1] : '';
if (way === 'round1') Object.assign(GPU_ROUND2, { cullSkip: false, raySkip: false, hop: false, hopBig: false, keep: false });
// (--tetra: round 2 with the way the skin faces from four sums, not six: tried, not kept)
if (process.argv.includes('--tetra')) {
  GPU_SCULPT_TEST.tetra = true;
  Object.assign(GPU_ROUND2, { hop: false, hopBig: false });
}
const ink = rgba(INK);
const PINNED = JSON.parse(readFileSync(new URL('../tests/cheap_heroes.hashes.json', import.meta.url), 'utf8')) as { lists: Record<string, string[]> };
const M = (x: number): string => (x / 1e6).toFixed(2);
console.log(`| ${way} | rays | marched | steps | cells passed over | list entries walked: march, after (M) | distances: march, after (M) | first pass: bounds asked, worked out (M) | cells | solids | pixels differing from the CPU's (64-bit) |`);
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const [who, name, i, label] of PICK) {
  if (only && !name.includes(only)) continue;
  // (the chip's march first: some classes keep a frame painted once for a pose, so the CPU's would be painted no more after)
  GPU_SCULPT.on = true;
  GPU_SCULPT_TEST.mode = 'emulate';
  countReset();
  const b = listsOf(who).find((x) => x.name === name)!.frames[i];
  GPU_SCULPT.on = false;
  GPU_SCULPT_TEST.mode = 'gpu';
  const a = listsOf(who).find((x) => x.name === name)!.frames[i];
  if (a === b) {
    // (the CPU's own picture is the one pinned for it)
    const same = hashSprite(b) === PINNED.lists[name][i];
    const c = COUNT;
    console.log(`| ${label} | ${c.rays} | ${c.rays - c.skipped} | ${c.steps} | ${c.hops} | ${M(c.marchEnts)}, ${M(c.ents - c.marchEnts)} | ${M(c.marchDists)}, ${M(c.dists - c.marchDists)} | ${M(c.ups)}, ${M(c.upsDone)} | ${GRID_SEEN.cells} | ${GRID_SEEN.solids} | ${same ? 'none (the very picture pinned)' : 'some (not the picture pinned)'} |`);
    continue;
  }
  const pa = paintingOf(a);
  const pb = paintingOf(b);
  let fig = 0;
  let diff = 0;
  let edge = 0;
  let inkN = 0;
  const isInk = (d: Uint8ClampedArray | Uint8Array, k: number): boolean => d[k + 3] > 0 && d[k] === ink[0] && d[k + 1] === ink[1] && d[k + 2] === ink[2];
  for (let k = 0; k < pa.d.length; k += 4) {
    if (pa.d[k + 3]) fig++;
    if (pa.d[k] !== pb.d[k] || pa.d[k + 1] !== pb.d[k + 1] || pa.d[k + 2] !== pb.d[k + 2] || pa.d[k + 3] !== pb.d[k + 3]) {
      diff++;
      if ((pa.d[k + 3] > 0) !== (pb.d[k + 3] > 0)) edge++;
      else if (isInk(pa.d, k) !== isInk(pb.d, k)) inkN++;
    }
  }
  const c = COUNT;
  if (!c.rays) {
    console.log(`| ${label} | (a pose painted already: nothing marched) |||||||||| `);
    continue;
  }
  console.log(
    `| ${label} | ${c.rays} | ${c.rays - c.skipped} | ${c.steps} | ${c.hops} | ${M(c.marchEnts)}, ${M(c.ents - c.marchEnts)} | ${M(c.marchDists)}, ${M(c.dists - c.marchDists)} | ${M(c.ups)}, ${M(c.upsDone)} | ${GRID_SEEN.cells} | ${GRID_SEEN.solids} | ${diff} of ${fig} (edge ${edge}, ink ${inkN}) |`,
  );
}
