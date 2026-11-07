// Build the game into one self-contained file: Play.html (double-click to run).
//   node tools/build.mjs          minified build
//   node tools/build.mjs --dev    readable build
// Also writes dist/artifact.html, the same game as a page fragment for publishing on claude.ai.
// And the heroes' pictures baked (tools/bake_heroes.mjs, render/baked.ts), in dist/heroes/<mark>/, to be published beside the
// page as heroes/<mark>/ (--no-bake: none; the game then paints them as it is played, as before).
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, fragment, page, write } from './lib.mjs';
import { bakeFiles, bakeHeroes } from './bake_heroes.mjs';

const dev = process.argv.includes('--dev');
// (shown small in a corner of the starting screen, so the owner can tell which version a page is showing)
const VERSION = 'V25.1.0';
const stamp = `${VERSION} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const bake = process.argv.includes('--no-bake') ? null : await bakeHeroes();
fs.rmSync(path.join(ROOT, 'dist', 'heroes'), { recursive: true, force: true });
if (bake) {
  fs.mkdirSync(path.join(ROOT, 'dist', 'heroes', bake.mark), { recursive: true });
  for (const f of bakeFiles(bake.mark)) fs.copyFileSync(f.from, path.join(ROOT, 'dist', 'heroes', bake.mark, f.name));
}
// (THE RECORDED SOUNDS, assets/sound/: beside the page in sounds/<mark>/, the mark the hash of the files: engine/audio.ts)
const soundDir = path.join(ROOT, 'assets', 'sound');
const soundFiles = fs.existsSync(soundDir) ? fs.readdirSync(soundDir).filter((f) => /\.(mp3|mp4|m4a|ogg)$/.test(f)).sort() : [];
let sounds = '';
fs.rmSync(path.join(ROOT, 'dist', 'sounds'), { recursive: true, force: true });
if (soundFiles.length) {
  const h = createHash('sha256');
  for (const f of soundFiles) h.update(f).update(fs.readFileSync(path.join(soundDir, f)));
  sounds = h.digest('hex').slice(0, 12);
  fs.mkdirSync(path.join(ROOT, 'dist', 'sounds', sounds), { recursive: true });
  for (const f of soundFiles) fs.copyFileSync(path.join(soundDir, f), path.join(ROOT, 'dist', 'sounds', sounds, f));
}
const js = await bundle('src/main.ts', { minify: !dev, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: String(dev), __HERO_BAKE__: JSON.stringify(bake ? bake.mark : ''), __SOUNDS__: JSON.stringify(sounds) } });
const out = write('Play.html', page(js));
write('dist/artifact.html', fragment(js));
console.log(`built ${out} (${(js.length / 1024).toFixed(0)} KB script, ${dev ? 'dev' : 'minified'})${bake ? `, the heroes baked: dist/heroes/${bake.mark}/ (${bakeFiles(bake.mark).length} files)` : ', no bake'}${sounds ? `, the sounds: dist/sounds/${sounds}/ (${soundFiles.length} files)` : ''}`);
