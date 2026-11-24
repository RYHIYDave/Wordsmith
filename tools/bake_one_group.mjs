// GROUPS OF THE HEROES' BAKE, FOR THE GODOT COPY (the web game is finished: a skin added since is Godot's alone): bakes just the
// groups named (tools/bake_heroes.mjs `only`) and copies each one's file and sheets into godot/assets/heroes, touching nothing
// else there. A group kept in packs (the Warlock's, the Brawler's) is cut into a sheet for each pack, as tools/godot_heroes.mjs
// cuts them.
//   node tools/bake_one_group.mjs warrior-barndoor[,mage-icicle,...]
import fs from 'node:fs';
import path from 'node:path';
import { bakeHeroes } from './bake_heroes.mjs';

const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
if (!groups.length) throw new Error('which groups?');
const r = await bakeHeroes({ only: groups });
const OUT = 'godot/assets/heroes';
for (const g of groups) {
  const f = JSON.parse(fs.readFileSync(path.join(r.dir, `${g}.json`), 'utf8'));
  let n = 0;
  const packed = new Map();
  for (const pk of f.packs ?? []) {
    if (pk.off === undefined) continue;
    if (!packed.has(pk.sheet)) packed.set(pk.sheet, fs.readFileSync(path.join(r.dir, pk.sheet)));
    const name = `${f.group}-${pk.name.replace(/:/g, '-')}.png`;
    fs.writeFileSync(path.join(OUT, name), packed.get(pk.sheet).subarray(pk.off, pk.off + pk.len));
    pk.sheet = name;
    delete pk.off;
    delete pk.len;
    n++;
  }
  for (const s of f.sheets ?? []) if (!s.endsWith('-packs.png')) { fs.copyFileSync(path.join(r.dir, s), path.join(OUT, s)); n++; }
  fs.writeFileSync(path.join(OUT, `${g}.json`), JSON.stringify(f));
  console.log(`${g}: mark ${r.mark}, ${n} sheets into ${OUT}`);
}
