// A PAGE WITH A FEW OF THE HEROES' GROUPS BAKED (tools/bake_heroes.mjs, `only`), for a look at how those come in and go in a real
// browser without baking every hero (many minutes): the groups named are baked (or kept from before), put beside the page in
// dist/heroes/<mark>/, and the page built knowing the mark. A hero of another group finds no file and is painted, as where a
// group fails. Leaves Play.html and dist/artifact.html as they are.
//   node tools/bake_some.mjs dist/staff_baked.html mage,mage-crook,mage-rod
//   then: node tools/playtest.mjs --serve --file dist/staff_baked.html --scenario ...
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, page, write } from './lib.mjs';
import { bakeHeroes } from './bake_heroes.mjs';

const [out, list] = process.argv.slice(2);
if (!out || !list || /(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) {
  console.error('node tools/bake_some.mjs dist/<name>.html group,group,...');
  process.exit(1);
}
const only = list.split(',');
const bake = await bakeHeroes({ only });
const to = path.join(ROOT, 'dist', 'heroes', bake.mark);
fs.mkdirSync(to, { recursive: true });
// (every group of this mark baked so far: those named, and any baked before them)
const files = fs.readdirSync(bake.dir).filter((f) => !f.startsWith('.') && f !== 'done.json');
for (const f of files) fs.copyFileSync(path.join(bake.dir, f), path.join(to, f));
const stamp = `UNRELEASED ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await bundle('src/main.ts', { minify: false, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __HERO_BAKE__: JSON.stringify(bake.mark) } });
console.log(`built ${write(out, page(js))}, the heroes' mark ${bake.mark}: ${files.length} files in dist/heroes/${bake.mark}/ (${files.join(' ')})`);
