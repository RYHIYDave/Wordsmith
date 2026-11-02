// THE CHIP'S MARCH IN THE CPU'S OWN NUMBERS, held against every pinned frame (docs/mockups/gpu_sculpt/README.md).
// `listMarch` (dev/gpu_sculpt.ts) is the shader's march, sum for sum, in 64-bit numbers: if its frames hash as the pinned
// ones do, the cells' lists leave out nothing that matters, and the chip differs only by its 32-bit sums.
//   npx tsx tools/gpu_sculpt_emul.ts [every] [list-name-part...]
// @ts-ignore
import { readFileSync } from 'node:fs';
import { GPU_ROUND2, GPU_SCULPT, GPU_SCULPT_TEST } from '../src/dev/gpu_sculpt';
import { hashSprite, listsOf } from './cheap_heroes';
import type { Who } from './cheap_heroes';

declare const process: { argv: string[]; exit(code: number): never };
const PINNED = JSON.parse(readFileSync(new URL('../tests/cheap_heroes.hashes.json', import.meta.url), 'utf8')) as { lists: Record<string, string[]> };
const args = process.argv.slice(2);
const every = Number(args.find((a) => /^\d+$/.test(a)) ?? 9);
const parts = args.filter((a) => !/^\d+$/.test(a) && !a.startsWith('--'));
GPU_SCULPT.on = true;
GPU_SCULPT_TEST.mode = 'emulate';
// (round 2's savings that keep every pixel; --round1: none of them)
Object.assign(GPU_ROUND2, process.argv.includes('--round1') ? { cullSkip: false, raySkip: false, hop: false, hopBig: false } : { hop: false, hopBig: false });
let n = 0;
let bad = 0;
const t0 = performance.now();
for (const w of ['warlock', 'tinkerer', 'tinkerer-kit', 'brawler'] as Who[]) {
  for (const l of listsOf(w)) {
    if (parts.length && !parts.some((p) => l.name.includes(p))) continue;
    const want = PINNED.lists[l.name];
    for (let i = 0; i < l.frames.length; i += every) {
      n++;
      const h = hashSprite(l.frames[i]);
      if (h !== want[i]) {
        bad++;
        console.log(`${l.name}[${i}] DIFFERS`);
      }
    }
  }
}
console.log(`${n} frames, ${bad} differ, ${((performance.now() - t0) / 1000).toFixed(1)} s`);
process.exit(bad ? 1 : 0);
