// THE SWAMP COLOSSUS'S PICTURES BAKED (tools/bake_colossus.ts, painted once, slowly, then packed into .bake/colossus/: a few sheets
// and colossus.json) carried beside the page as colossus/<mark>/, the mark the hash of the files (render/colossus_baked.ts fetches
// them from there). No pack there: '' (the game then draws his stand-ins).
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT } from './lib.mjs';

/** Where the pack step leaves his pictures: `npx tsx tools/bake_colossus.ts pack <cache> .bake/colossus 1 <move ...>`. */
export const COLOSSUS_PACK = path.join(ROOT, '.bake', 'colossus');

/** Copy the pack into dist/colossus/<mark>/ (the old ones gone) and give the mark; '' when there is none. */
export function shipColossus() {
  fs.rmSync(path.join(ROOT, 'dist', 'colossus'), { recursive: true, force: true });
  if (!fs.existsSync(path.join(COLOSSUS_PACK, 'colossus.json'))) return { mark: '', files: [] };
  const files = fs.readdirSync(COLOSSUS_PACK).filter((f) => f === 'colossus.json' || /^colossus-[A-Za-z0-9_.-]+\.png$/.test(f)).sort();
  const h = createHash('sha256');
  for (const f of files) h.update(f).update(fs.readFileSync(path.join(COLOSSUS_PACK, f)));
  const mark = h.digest('hex').slice(0, 12);
  const to = path.join(ROOT, 'dist', 'colossus', mark);
  fs.mkdirSync(to, { recursive: true });
  for (const f of files) fs.copyFileSync(path.join(COLOSSUS_PACK, f), path.join(to, f));
  return { mark, files };
}
