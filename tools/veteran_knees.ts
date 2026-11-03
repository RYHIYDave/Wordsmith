// HIS KNEES THROUGH HIS TROUSERS, BEFORE AND NOW (docs/mockups/brawler_looks/pictures/brawler_knees.png). His words, 3 Nov
// 2026, 18:07: “Well first off the brawlers knees are clipping through his pants which is against the rules which I reminded
// you to follow multiple times”. This writes pictures of one version of him (run once in the old version's tree, once in
// this one), each at the game's size, from the game's view (from in front), at the moments where his skin showed most
// through his trousers in the old version: in each of the moves named below, the frame with the most pixels of him through
// them (tests/veteran_checks.ts `coverFindings`), found in the old version and written to <dir>/frames.json; the new version
// is given that file and paints the same frames. tools/veteran_knees.py lays the two out, before above now, three times the
// game's size. Nothing of the game imports it.
//   npx tsx tools/veteran_knees.ts <before dir>                        (in the old version: finds the frames)
//   npx tsx tools/veteran_knees.ts <now dir> <before dir>/frames.json  (in this one: the same frames)
//   python3 tools/veteran_knees.py <before dir> <now dir> <out.png>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { VET_CANVAS, paintVeteran } from '../src/dev/sculpt_veteran';
import { motionById, placeOf, vetAt } from '../src/dev/veteran_moves';
import { coverFindings } from '../tests/veteran_checks';
import { png } from './king_png';

const [dir = 'shots/veteran_knees', given] = process.argv.slice(2);
mkdirSync(dir, { recursive: true });
/** The moves looked at, and what each moment is, in plain words. */
const MOVES: [string, string][] = [
  ['stand', 'Standing, bouncing on his toes'],
  ['dodge', 'The jump: sunk deep in his knees'],
  ['roundkick', 'The round kick: the knee hauled up'],
  ['push', 'The push kick: the knee coming up'],
  ['knee', 'The flying knee: landed low'],
  ['spinkick', 'The spinning jump kick: in the air, legs tucked'],
  ['elbow', 'The spinning elbow: the coil, sunk low'],
  ['uppercut', 'The flying uppercut: landed low'],
];
const labelOf = (id: string): string => (MOVES.find((x) => x[0] === id) as [string, string])[1];
const trousers = (xs: string[]): number => xs.filter((x) => x.includes('through the trousers')).reduce((n, x) => n + Number(x.split(' ')[0]), 0);
type Pick = { id: string; f: number; label: string; worst: number };
let picks: Pick[];
if (given) picks = JSON.parse(readFileSync(given, 'utf8')) as Pick[];
else {
  picks = MOVES.map(([id, label]) => {
    const m = motionById(id);
    let best = { f: 0, n: -1 };
    for (let f = 0; f < m.long + (m.loops ? 0 : 1); f++) {
      const turn = placeOf(m, f).turn;
      const n = trousers(coverFindings(paintVeteran(vetAt(m, f), turn), turn, VET_CANVAS.ax, VET_CANVAS.ay));
      if (n > best.n) best = { f, n };
    }
    console.log(`${id}: worst at frame ${best.f}, ${best.n} pixels of him through his trousers`);
    return { id, f: best.f, label, worst: best.n };
  });
  writeFileSync(`${dir}/frames.json`, JSON.stringify(picks, null, 1));
}
const out: { file: string; id: string; f: number; label: string; worst: number; now: number }[] = [];
for (const p of picks) {
  const m = motionById(p.id);
  const turn = placeOf(m, p.f).turn;
  const d = paintVeteran(vetAt(m, p.f), turn);
  const now = trousers(coverFindings(d, turn, VET_CANVAS.ax, VET_CANVAS.ay));
  const file = `${p.id}_${p.f}.png`;
  writeFileSync(`${dir}/${file}`, png(d.px));
  out.push({ file, id: p.id, f: p.f, label: labelOf(p.id), worst: p.worst, now });
  console.log(`${p.id} f${p.f}: ${now} pixels of him through his trousers here`);
}
writeFileSync(`${dir}/shots.json`, JSON.stringify(out, null, 1));
