// THE CHIP'S MARCH IN THE CPU'S OWN NUMBERS, ROUND 2 AS MADE (or with its passing over of empty cells for every figure,
// `--hop`), HELD AGAINST THE CPU'S PICTURES on every so many frames (docs/mockups/gpu_sculpt/README.md, "Round 2"): how many
// pixels differ from the march's own changes alone, the chip's 32-bit sums aside.
//   npx tsx tools/gpu_sample_emul.ts --who warlock [--only <regex>] [--every 8] [--hop]
// @ts-ignore
import { GPU_ROUND2, GPU_SCULPT, GPU_SCULPT_TEST } from '../src/dev/gpu_sculpt';
import { listsOf } from './cheap_heroes';
import { paintingOf } from '../tests/helpers';
import { INK } from '../src/art/kit';
import { rgba } from '../src/engine/px';
import type { Who } from './cheap_heroes';
declare const process: { argv: string[] };
const arg = (n: string, d: string): string => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : d; };
const every = Number(arg('every', '8'));
const who = arg('who', 'warlock') as Who;
const only = new RegExp(arg('only', '.'));
if (process.argv.includes('--hop')) GPU_ROUND2.hop = true;
const ink = rgba(INK);
const A = listsOf(who);
const B = listsOf(who);
const rows: number[] = [];
let worst = { share: 0, name: '' };
let edgeAll = 0;
let inkAll = 0;
for (let li = 0; li < A.length; li++) {
  if (!only.test(A[li].name)) continue;
  for (let i = 0; i < A[li].frames.length; i += every) {
    GPU_SCULPT.on = false;
    const a = A[li].frames[i];
    GPU_SCULPT.on = true;
    GPU_SCULPT_TEST.mode = 'emulate';
    const b = B[li].frames[i];
    GPU_SCULPT.on = false;
    const pa = paintingOf(a), pb = paintingOf(b);
    let fig = 0, diff = 0, edge = 0, inkN = 0;
    for (let k = 0; k < pa.d.length; k += 4) {
      if (pa.d[k + 3]) fig++;
      if (pa.d[k] !== pb.d[k] || pa.d[k + 1] !== pb.d[k + 1] || pa.d[k + 2] !== pb.d[k + 2] || pa.d[k + 3] !== pb.d[k + 3]) {
        diff++;
        if ((pa.d[k + 3] > 0) !== (pb.d[k + 3] > 0)) edge++;
        else if ((pa.d[k + 3] > 0 && pa.d[k] === ink[0] && pa.d[k + 1] === ink[1] && pa.d[k + 2] === ink[2]) !== (pb.d[k + 3] > 0 && pb.d[k] === ink[0] && pb.d[k + 1] === ink[1] && pb.d[k + 2] === ink[2])) inkN++;
      }
    }
    const share = diff / Math.max(1, fig);
    rows.push(share);
    edgeAll += edge;
    inkAll += inkN;
    if (share > worst.share) worst = { share, name: `${A[li].name}[${i}] ${diff} of ${fig} (edge ${edge} ink ${inkN})` };
  }
}
rows.sort((x, y) => x - y);
console.log(`${who}${GPU_ROUND2.hop ? ' (passing over empty cells for every figure)' : ''}: ${rows.length} frames; median ${(100 * rows[rows.length >> 1]).toFixed(3)}%, p90 ${(100 * rows[Math.floor(rows.length * 0.9)]).toFixed(3)}%, worst ${(100 * worst.share).toFixed(3)}% ${worst.name}; edge ${edgeAll} ink ${inkAll}`);
