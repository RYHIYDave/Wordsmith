// The helper's own look at the three fixes (docs/mockups/action_fixes): stills of one scene at chosen moments, for looking at before
// the film is made. Nothing of the game imports it.
//   npx tsx tools/action_fixes_peek.ts <out dir> <part index,...> <seconds,...>
import { mkdirSync, writeFileSync } from 'node:fs';
import { parts } from './action_fixes_film';
import { png } from './king_png';

const [out = 'peek', which = '', at = ''] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const ids = which ? which.split(',').map(Number) : parts.map((_, i) => i);
const ts = at.split(',').filter(Boolean).map(Number);
for (const i of ids) {
  const p = parts[i];
  for (const t of ts.length ? ts : [0.2, 0.4, 0.6, 0.8].map((k) => k * p.long)) {
    if (t > p.long) continue;
    writeFileSync(`${out}/p${i}_${t.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, t))));
  }
}
console.log('peeked', ids.join(','));
