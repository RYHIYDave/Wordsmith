// Build the game into one self-contained file: Play.html (double-click to run).
//   node tools/build.mjs          minified build
//   node tools/build.mjs --dev    readable build
// Also writes dist/artifact.html, the same game as a page fragment for publishing on claude.ai.
// And the heroes' pictures baked (tools/bake_heroes.mjs, render/baked.ts), in dist/heroes/<mark>/, to be published beside the
// page as heroes/<mark>/ (--no-bake: none; the game then paints them as it is played, as before).
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, fragment, page, write } from './lib.mjs';
import { bakeFiles, bakeHeroes } from './bake_heroes.mjs';

const dev = process.argv.includes('--dev');
// (shown small in a corner of the starting screen, so the owner can tell which version a page is showing)
const VERSION = 'V25.0.9';
const stamp = `${VERSION} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const bake = process.argv.includes('--no-bake') ? null : await bakeHeroes();
fs.rmSync(path.join(ROOT, 'dist', 'heroes'), { recursive: true, force: true });
if (bake) {
  fs.mkdirSync(path.join(ROOT, 'dist', 'heroes', bake.mark), { recursive: true });
  for (const f of bakeFiles(bake.mark)) fs.copyFileSync(f.from, path.join(ROOT, 'dist', 'heroes', bake.mark, f.name));
}
const js = await bundle('src/main.ts', { minify: !dev, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: String(dev), __HERO_BAKE__: JSON.stringify(bake ? bake.mark : '') } });
const out = write('Play.html', page(js));
write('dist/artifact.html', fragment(js));
console.log(`built ${out} (${(js.length / 1024).toFixed(0)} KB script, ${dev ? 'dev' : 'minified'})${bake ? `, the heroes baked: dist/heroes/${bake.mark}/ (${bakeFiles(bake.mark).length} files)` : ', no bake'}`);
