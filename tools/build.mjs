// Build the game into one self-contained file: Play.html (double-click to run).
//   node tools/build.mjs          minified build
//   node tools/build.mjs --dev    readable build
// Also writes dist/artifact.html, the same game as a page fragment for publishing on claude.ai.
// And the heroes' pictures baked (tools/bake_heroes.mjs, render/baked.ts), in dist/heroes/<mark>/, to be published beside the
// page as heroes/<mark>/ (--no-bake: none; the game then paints them as it is played, as before).
// And the town's people baked (tools/bake_townsfolk.mjs, render/townsfolk_baked.ts), in dist/townsfolk/<mark>/, to be published
// beside the page as townsfolk/<mark>/ (--no-bake or --no-townsfolk: none; the town's people are then as they were).
// And the floors' monsters baked (tools/bake_monsters.mjs, render/monsters_baked.ts), in dist/monsters/<mark>/, to be published
// beside the page as monsters/<mark>/ (--no-bake or --no-monsters: none; the monsters are then painted as the game is played, as before).
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, fragment, page, write } from './lib.mjs';
import { bakeFiles, bakeHeroes } from './bake_heroes.mjs';
import { packSounds } from './sound_packs.mjs';
import { shipColossus } from './colossus_ship.mjs';
import { shipTownsfolk } from './bake_townsfolk.mjs';
import { shipMonsters } from './bake_monsters.mjs';

const dev = process.argv.includes('--dev');
// (--try colossus: a page that begins at the thing to try, for the owner before it goes live: main.ts __TRY__)
const tryOf = process.argv.includes('--try') ? process.argv[process.argv.indexOf('--try') + 1] : '';
// (shown small in a corner of the starting screen, so the owner can tell which version a page is showing)
const VERSION = 'V25.3.8';
const stamp = `${VERSION} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const bake = process.argv.includes('--no-bake') ? null : await bakeHeroes();
fs.rmSync(path.join(ROOT, 'dist', 'heroes'), { recursive: true, force: true });
if (bake) {
  fs.mkdirSync(path.join(ROOT, 'dist', 'heroes', bake.mark), { recursive: true });
  for (const f of bakeFiles(bake.mark)) fs.copyFileSync(f.from, path.join(ROOT, 'dist', 'heroes', bake.mark, f.name));
}
// (THE RECORDED SOUNDS, assets/sound/: beside the page in sounds/<mark>/, the mark the hash of the files: engine/audio.ts; since
// 8 Nov 2026 in a few packs and an index, tools/sound_packs.mjs: 574 files would not go beside the page one by one)
const soundDir = path.join(ROOT, 'assets', 'sound');
const soundFiles = fs.existsSync(soundDir) ? fs.readdirSync(soundDir).filter((f) => /\.(mp3|mp4|m4a|ogg|wav)$/.test(f)).sort() : [];
let sounds = '';
let soundShipped = 0;
fs.rmSync(path.join(ROOT, 'dist', 'sounds'), { recursive: true, force: true });
if (soundFiles.length) {
  const h = createHash('sha256');
  h.update('packs2');
  for (const f of soundFiles) h.update(f).update(fs.readFileSync(path.join(soundDir, f)));
  sounds = h.digest('hex').slice(0, 12);
  fs.mkdirSync(path.join(ROOT, 'dist', 'sounds', sounds), { recursive: true });
  soundShipped = packSounds(soundDir, path.join(ROOT, 'dist', 'sounds', sounds)).files.length;
}
// (THE SWAMP COLOSSUS'S PICTURES, tools/colossus_ship.mjs: beside the page in colossus/<mark>/; his fight is on since 25.3.0, so always,
// but with --no-colossus)
const colossus = !process.argv.includes('--no-colossus') ? shipColossus() : (fs.rmSync(path.join(ROOT, 'dist', 'colossus'), { recursive: true, force: true }), { mark: '', files: [] });
// (THE TOWN'S PEOPLE BAKED, tools/bake_townsfolk.mjs: beside the page in townsfolk/<mark>/; baked now if their art is not baked yet)
const townsfolk = process.argv.includes('--no-bake') || process.argv.includes('--no-townsfolk') ? (fs.rmSync(path.join(ROOT, 'dist', 'townsfolk'), { recursive: true, force: true }), { mark: '', files: [] }) : await shipTownsfolk();
// (THE FLOORS' MONSTERS BAKED, tools/bake_monsters.mjs: beside the page in monsters/<mark>/; baked now if their art is not baked yet)
const monsters = process.argv.includes('--no-bake') || process.argv.includes('--no-monsters') ? (fs.rmSync(path.join(ROOT, 'dist', 'monsters'), { recursive: true, force: true }), { mark: '', files: [] }) : await shipMonsters();
const js = await bundle('src/main.ts', { minify: !dev, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: String(dev), __HERO_BAKE__: JSON.stringify(bake ? bake.mark : ''), __SOUNDS__: JSON.stringify(sounds), __COLOSSUS_BAKE__: JSON.stringify(colossus.mark), __TOWNSFOLK_BAKE__: JSON.stringify(townsfolk.mark), __MONSTER_BAKE__: JSON.stringify(monsters.mark), ...(tryOf ? { __TRY__: JSON.stringify(tryOf) } : {}) } });
const out = write('Play.html', page(js));
write('dist/artifact.html', fragment(js));
console.log(`built ${out} (${(js.length / 1024).toFixed(0)} KB script, ${dev ? 'dev' : 'minified'})${bake ? `, the heroes baked: dist/heroes/${bake.mark}/ (${bakeFiles(bake.mark).length} files)` : ', no bake'}${sounds ? `, the sounds: dist/sounds/${sounds}/ (${soundFiles.length} sounds in ${soundShipped} files)` : ''}${colossus.mark ? `, the Colossus: dist/colossus/${colossus.mark}/ (${colossus.files.length} files)` : ''}${townsfolk.mark ? `, the townsfolk: dist/townsfolk/${townsfolk.mark}/ (${townsfolk.files.length} files)` : ', no townsfolk baked'}${monsters.mark ? `, the monsters: dist/monsters/${monsters.mark}/ (${monsters.files.length} files)` : ', no monsters baked'}`);
