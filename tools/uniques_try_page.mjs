// A TEST PAGE FOR HIS PHONE: THE GAME WITH THE UNIQUE ITEMS SWITCHED ON, each with its own bag picture, to try their numbers
// in play before anything goes live. His pick on the numbers, 11 Nov 2026, by pop-up: “Start with these, tune in play
// (Recommended)”; and to this chat, asked whether to make it now: “Yes, make my test page (Recommended)”. Made as the eight
// sides' test page was (tools/eight_sides_try_page.mjs, on bring-in/eight-sides), a folder of its own, the game's own files left
// alone:
//   node tools/uniques_try_page.mjs                    (dist/try_uniques/: index.html and the four folders beside it)
// index.html is the game as it is in the working tree, built as the release is (minified) but begun as `try=uniques` (main.ts:
// UNIQUES and UNIQUE_ART on for this page only; the level select's test hero and the practice room's handed every unique they
// could find), with a stamp of its own (TEST UNIQUES and the day, in the corner of the starting screen, so that he can tell
// it from the game) and a title of its own, wrapped as the site serves it. Beside it heroes/<mark>/, sounds/<mark>/,
// colossus/<mark>/ and townsfolk/<mark>/, each of the mark this tree's build gives: a release build's own where one was made
// here (dist/, .bake/), else THE LIVE SITE'S OWN FILES of that very mark (the branch gh-pages: SITE=origin/gh-pages), so nothing
// is baked again for a page whose art is the game's. Published as a page of its own (never over the game's: his save lives
// there), it keeps a save of its own.
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, fragment } from './lib.mjs';
import { bakeCode, bakeFiles } from './bake_heroes.mjs';
import { townsfolkBakeCode, townsfolkBakeFiles } from './bake_townsfolk.mjs';
import { shipColossus } from './colossus_ship.mjs';
import { packSounds } from './sound_packs.mjs';

const SITE = process.env.SITE || 'origin/gh-pages';
const dist = path.join(ROOT, 'dist');
const out = path.join(dist, 'try_uniques');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

/** The live site's folder `folder/mark/` copied beside the page, if the site has it: how many files. */
function fromSite(folder, mark) {
  try {
    execSync(`git cat-file -e ${SITE}:${folder}/${mark}`, { cwd: ROOT, stdio: 'ignore' });
  } catch {
    return 0;
  }
  execSync(`git archive ${SITE} ${folder}/${mark} | tar -x -C "${out}"`, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
  return fs.readdirSync(path.join(out, folder, mark)).length;
}
/** Files copied beside the page as `folder/mark/`: how many. */
function fromHere(folder, mark, files) {
  const to = path.join(out, folder, mark);
  fs.mkdirSync(to, { recursive: true });
  for (const f of files) fs.copyFileSync(f.from, path.join(to, f.name));
  return files.length;
}
const said = [];

// THE HEROES' PICTURES: the mark of this tree's art; a bake kept here, else the live site's of that mark
const heroes = (await bakeCode()).mark;
if (fs.existsSync(path.join(ROOT, '.bake', heroes, 'done.json'))) said.push(`heroes ${heroes}: ${fromHere('heroes', heroes, bakeFiles(heroes))} files, this tree's own bake`);
else {
  const n = fromSite('heroes', heroes);
  if (!n) throw new Error(`the heroes' art (mark ${heroes}) is not baked here and not on ${SITE}: node tools/build.mjs first (it bakes)`);
  said.push(`heroes ${heroes}: ${n} files, the live site's own`);
}

// THE TOWN'S PEOPLE: the same
const townsfolk = (await townsfolkBakeCode()).mark;
if (fs.existsSync(path.join(ROOT, '.bake', 'townsfolk', townsfolk, 'done.json'))) said.push(`townsfolk ${townsfolk}: ${fromHere('townsfolk', townsfolk, townsfolkBakeFiles(townsfolk))} files, this tree's own bake`);
else {
  const n = fromSite('townsfolk', townsfolk);
  if (!n) throw new Error(`the townsfolk's art (mark ${townsfolk}) is not baked here and not on ${SITE}: node tools/build.mjs first (it bakes)`);
  said.push(`townsfolk ${townsfolk}: ${n} files, the live site's own`);
}

// THE RECORDED SOUNDS: their mark as tools/build.mjs works it out; the live site's packs of that mark, else packed here
const soundDir = path.join(ROOT, 'assets', 'sound');
const soundFiles = fs.readdirSync(soundDir).filter((f) => /\.(mp3|mp4|m4a|ogg|wav)$/.test(f)).sort();
const h = createHash('sha256');
h.update('packs2');
for (const f of soundFiles) h.update(f).update(fs.readFileSync(path.join(soundDir, f)));
const sounds = h.digest('hex').slice(0, 12);
{
  const n = fromSite('sounds', sounds);
  if (n) said.push(`sounds ${sounds}: ${n} files, the live site's own`);
  else {
    const to = path.join(out, 'sounds', sounds);
    fs.mkdirSync(to, { recursive: true });
    said.push(`sounds ${sounds}: ${packSounds(soundDir, to).files.length} files, packed here`);
  }
}

// THE SWAMP COLOSSUS'S PICTURES: packed in the repository (tools/colossus_ship.mjs carries them to dist/colossus/<mark>/)
const colossus = shipColossus();
said.push(`colossus ${colossus.mark}: ${fromHere('colossus', colossus.mark, colossus.files.map((f) => ({ name: f, from: path.join(dist, 'colossus', colossus.mark, f) })))} files, the repository's own`);

const day = new Date().toLocaleDateString('en-CA');
const stamp = `TEST UNIQUES ${day}`;
const js = await bundle('src/main.ts', {
  minify: true,
  define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'false', __HERO_BAKE__: JSON.stringify(heroes), __SOUNDS__: JSON.stringify(sounds), __COLOSSUS_BAKE__: JSON.stringify(colossus.mark), __TOWNSFOLK_BAKE__: JSON.stringify(townsfolk), __TRY__: JSON.stringify('uniques') },
});
// (the site's own head and reset, then the fragment, then the page's close: as tools/wrap2537.sh wraps the release)
const HEAD = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>';
// (the page's own name, as it is published: not the game's)
const TITLE = 'Wordsmith test page: unique items';
fs.writeFileSync(path.join(out, 'index.html'), `${HEAD}\n${fragment(js, TITLE)}\n</body></html>`);

let files = 0;
let bytes = 0;
const walk = (d) => {
  for (const f of fs.readdirSync(d)) {
    const at = path.join(d, f);
    if (fs.statSync(at).isDirectory()) walk(at);
    else {
      files++;
      bytes += fs.statSync(at).size;
    }
  }
};
walk(out);
console.log(`dist/try_uniques/: ${files} files, ${(bytes / 1e6).toFixed(1)} MB; the stamp “${stamp}”`);
for (const s of said) console.log(`  ${s}`);
