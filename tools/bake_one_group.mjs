// ONE GROUP OF THE HEROES' BAKE, FOR THE GODOT COPY (the web game is finished: a skin added since is Godot's alone): bakes just
// that group (tools/bake_heroes.mjs `only`) and copies its file and sheets into godot/assets/heroes, touching nothing else there.
//   node tools/bake_one_group.mjs warrior-barndoor
import fs from 'node:fs';
import path from 'node:path';
import { bakeHeroes } from './bake_heroes.mjs';

const g = process.argv[2];
if (!g) throw new Error('which group?');
const r = await bakeHeroes({ only: [g] });
const f = JSON.parse(fs.readFileSync(path.join(r.dir, `${g}.json`), 'utf8'));
if (f.packs) throw new Error(`${g} is kept in packs: bring it over with tools/godot_heroes.mjs`);
const OUT = 'godot/assets/heroes';
fs.copyFileSync(path.join(r.dir, `${g}.json`), path.join(OUT, `${g}.json`));
for (const s of f.sheets) fs.copyFileSync(path.join(r.dir, s), path.join(OUT, s));
console.log(`${g}: mark ${r.mark}, ${f.sheets.length} sheets into ${OUT}`);
