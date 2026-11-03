// As build_to.mjs, with the Brawler in (his switch, left out of the release: game/brawler.ts), for his pictures and playtests.
//   node tools/build_brawler_to.mjs dist/brawler.html
import { RELEASE_DEFINES, bundle, page, write } from './lib.mjs';

const [out = 'dist/brawler.html'] = process.argv.slice(2);
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const stamp = `UNRELEASED ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await bundle('src/main.ts', { minify: false, define: { ...RELEASE_DEFINES, __BRAWLER__: 'true', __BUILD__: JSON.stringify(stamp), __DEV__: 'true' } });
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script)`);
