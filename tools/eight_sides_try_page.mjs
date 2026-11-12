// A TEST PAGE FOR HIS PHONE: THE GAME AS IT IS ON THIS BRANCH (the Tinkerer and the Brawler from all eight sides, baked), to
// play before it goes live. His pick, 11 Nov 2026, asked how to weigh the Brawler's memory, which nobody can measure on his
// phone from here: “A test page first”. As the Colossus's test page was made (8 Nov), but a folder of its own and the game's
// own files left alone:
//   node tools/build.mjs && git checkout Play.html     (the release build: its bake, sounds and Colossus in dist/)
//   node tools/eight_sides_try_page.mjs                (dist/try_eight/: index.html and the three folders beside it)
// index.html is the release's page fragment built again with a stamp of its own (TEST EIGHT SIDES and the day, in the corner of
// the starting screen, so that he can tell it from the game) and wrapped as the site serves it; heroes/<mark>/, sounds/<mark>/
// and colossus/<mark>/ are the build's own, copied. Published as a page of its own (never over the game's: his save lives
// there), it keeps a save of its own.
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, fragment } from './lib.mjs';

const dist = path.join(ROOT, 'dist');
const only = (folder) => {
  const at = path.join(dist, folder);
  const marks = fs.existsSync(at) ? fs.readdirSync(at).filter((f) => fs.statSync(path.join(at, f)).isDirectory()) : [];
  if (marks.length !== 1) throw new Error(`dist/${folder}/: ${marks.length} folders (run node tools/build.mjs first)`);
  return marks[0];
};
const marks = { heroes: only('heroes'), sounds: only('sounds'), colossus: only('colossus') };
const day = new Date().toLocaleDateString('en-CA');
const stamp = `TEST EIGHT SIDES ${day}`;
const js = await bundle('src/main.ts', {
  minify: true,
  define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'false', __HERO_BAKE__: JSON.stringify(marks.heroes), __SOUNDS__: JSON.stringify(marks.sounds), __COLOSSUS_BAKE__: JSON.stringify(marks.colossus) },
});
const out = path.join(dist, 'try_eight');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
// (the site's own head and reset, then the fragment, then the page's close: as tools/wrap2535.sh wraps the release)
const HEAD = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>';
// (the page's own name, as it is published: not the game's)
const TITLE = 'Wordsmith test page: eight sides';
fs.writeFileSync(path.join(out, 'index.html'), `${HEAD}\n${fragment(js, TITLE)}\n</body></html>`);
let files = 1;
let bytes = fs.statSync(path.join(out, 'index.html')).size;
for (const [folder, mark] of Object.entries(marks)) {
  const from = path.join(dist, folder, mark);
  const to = path.join(out, folder, mark);
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from).sort()) {
    fs.copyFileSync(path.join(from, f), path.join(to, f));
    files++;
    bytes += fs.statSync(path.join(to, f)).size;
  }
}
console.log(`dist/try_eight/: ${files} files, ${(bytes / 1e6).toFixed(1)} MB; the stamp “${stamp}”; heroes ${marks.heroes}, sounds ${marks.sounds}, colossus ${marks.colossus}`);
