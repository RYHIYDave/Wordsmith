// Build the game as it is in the working tree into a page OF ANOTHER NAME, for filming and
// looking at, leaving Play.html and dist/artifact.html as they are.
//   node tools/build_to.mjs dist/play_new.html
// (A readable build. The stamp in the corner of the starting screen says UNRELEASED.)
import { RELEASE_DEFINES, bundle, page, write } from './lib.mjs';
import { shipColossus } from './colossus_ship.mjs';

const [out = 'dist/play_new.html'] = process.argv.slice(2);
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const stamp = `UNRELEASED ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
// (the Swamp Colossus's pictures, where they are packed: dist/colossus/<mark>/, beside the page)
const colossus = shipColossus();
const js = await bundle('src/main.ts', { minify: false, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __COLOSSUS_BAKE__: JSON.stringify(colossus.mark) } });
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script)${colossus.mark ? `, the Colossus: dist/colossus/${colossus.mark}/ (${colossus.files.length} files)` : ''}`);
