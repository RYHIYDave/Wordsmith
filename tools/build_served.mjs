// A page to look at WITH THE RECORDED SOUNDS BESIDE IT, for a playtest that listens (served: --serve), leaving Play.html and
// dist/artifact.html as they are. As tools/build_to.mjs (a readable build, stamped UNRELEASED), and the sounds of assets/sound
// packed as the release packs them (tools/sound_packs.mjs) into dist/<name>_sounds/sounds/<mark>/, the page itself written as
// dist/<name>_sounds/<name>.html, so that it is served from a folder of its own with only its sounds beside it. No heroes' bake
// (the game paints them as it is played) and the Swamp Colossus's pictures only where they are packed already.
//   node tools/build_served.mjs words10_live
//   node tools/playtest.mjs --file dist/words10_live_sounds/words10_live.html --serve --touch --size 844x390 --dpr 2 --scenario tools/scenarios/words10_live.mjs
// (Made for the ten new words' sounds, the sound chat's sixth batch, 11 Nov 2026: the release build bakes the heroes first,
// half an hour of painting, which a look at a branch's sounds does not want.)
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, page, write } from './lib.mjs';
import { packSounds } from './sound_packs.mjs';

const [name = 'served'] = process.argv.slice(2);
if (!/^[a-z0-9_]+$/.test(name)) { console.error('a plain name, please: letters, digits and _'); process.exit(1); }
const home = path.join(ROOT, 'dist', `${name}_sounds`);
fs.rmSync(home, { recursive: true, force: true });
const soundDir = path.join(ROOT, 'assets', 'sound');
const soundFiles = fs.readdirSync(soundDir).filter((f) => /\.(mp3|mp4|m4a|ogg|wav)$/.test(f)).sort();
// (the mark as tools/build.mjs makes it: the hash of the files)
const h = createHash('sha256');
h.update('packs2');
for (const f of soundFiles) h.update(f).update(fs.readFileSync(path.join(soundDir, f)));
const sounds = h.digest('hex').slice(0, 12);
fs.mkdirSync(path.join(home, 'sounds', sounds), { recursive: true });
const packed = packSounds(soundDir, path.join(home, 'sounds', sounds));
const stamp = `UNRELEASED ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await bundle('src/main.ts', { minify: false, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __HERO_BAKE__: JSON.stringify(''), __SOUNDS__: JSON.stringify(sounds), __COLOSSUS_BAKE__: JSON.stringify('') } });
const out = write(path.join('dist', `${name}_sounds`, `${name}.html`), page(js));
console.log(`built ${out} (${(js.length / 1024).toFixed(0)} KB script), the sounds: ${path.relative(ROOT, path.join(home, 'sounds', sounds))}/ (${packed.count} sounds in ${packed.files.length} files; ${packed.files.filter((f) => f.endsWith('-pack.mp3')).join(', ')})`);
