// Build the game as it is in the working tree into a page OF ANOTHER NAME, for filming and
// looking at, leaving Play.html and dist/artifact.html as they are.
//   node tools/build_to.mjs dist/play_new.html
// (A readable build. The stamp in the corner of the starting screen says UNRELEASED.)
// THE TOWN'S PEOPLE BAKED (tools/bake_townsfolk.mjs) are carried beside it, in dist/townsfolk/<mark>/, where a bake of their art
// as it is now is kept already; --townsfolk bakes it now if it is not (some minutes). The page shows them only when it is
// SERVED (tools/playtest.mjs --serve): opened as a file, or with no bake, its townsfolk are as they were.
import { RELEASE_DEFINES, bundle, page, write } from './lib.mjs';
import { shipColossus } from './colossus_ship.mjs';
import { shipTownsfolk } from './bake_townsfolk.mjs';

const [out = 'dist/play_new.html'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const stamp = `UNRELEASED ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
// (the Swamp Colossus's pictures, where they are packed: dist/colossus/<mark>/, beside the page)
const colossus = shipColossus();
// (the town's people baked, where they are baked already, or now with --townsfolk: dist/townsfolk/<mark>/, beside the page)
const townsfolk = await shipTownsfolk({ make: process.argv.includes('--townsfolk') });
const js = await bundle('src/main.ts', { minify: false, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __COLOSSUS_BAKE__: JSON.stringify(colossus.mark), __TOWNSFOLK_BAKE__: JSON.stringify(townsfolk.mark) } });
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script)${colossus.mark ? `, the Colossus: dist/colossus/${colossus.mark}/ (${colossus.files.length} files)` : ''}${townsfolk.mark ? `, the townsfolk: dist/townsfolk/${townsfolk.mark}/ (${townsfolk.files.length} files; shown where the page is served)` : ', no townsfolk baked (as they were; --townsfolk bakes them)'}`);
