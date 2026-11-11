// THE TINKERER AND THE BRAWLER FROM EIGHT SIDES: A PAGE OF THE GAME TO LOOK AT THEM IN, WITH THEIR SWITCH ON OR OFF (the
// Tinkerer chat, 11 Nov 2026), as tools/mage_up_page.mjs is for the Mage.
// As tools/build_to.mjs builds a page of the game as it is in the working tree, but with art/sides_more.ts EIGHT_MORE as asked,
// in the page and in the side painter's worker alike (the worker is the page's own script, and has no switch of its own:
// turned on in the page alone, the worker would paint two sides into lists of eight).
// The source is not touched: the switch is turned as the file is read for this one bundle.
//   node tools/sides_more_page.mjs dist/eight_on.html on
//   node tools/sides_more_page.mjs dist/eight_off.html off
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, load, page, write } from './lib.mjs';
import { shipColossus } from './colossus_ship.mjs';

const [out = 'dist/eight_on.html', on = 'on'] = process.argv.slice(2);
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const want = on !== 'off';
const stamp = `UNRELEASED eight sides ${want ? 'on' : 'off'} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const colossus = shipColossus();
const esbuild = load('esbuild');
const SWITCH = /export const EIGHT_MORE = \{ tinkerer: (true|false), brawler: (true|false) \};/;
const turn = {
  name: 'sides-more-switch',
  setup(build) {
    build.onLoad({ filter: /src[\\/]art[\\/]sides_more\.ts$/ }, (args) => {
      const text = fs.readFileSync(args.path, 'utf8');
      if (!SWITCH.test(text)) throw new Error('art/sides_more.ts: the switch is not where it was');
      return { contents: text.replace(SWITCH, `export const EIGHT_MORE = { tinkerer: ${want}, brawler: ${want} };`), loader: 'ts' };
    });
  },
};
const r = await esbuild.build({
  entryPoints: [path.resolve(ROOT, 'src/main.ts')],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  write: false,
  minify: false,
  legalComments: 'none',
  logLevel: 'warning',
  define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __COLOSSUS_BAKE__: JSON.stringify(colossus.mark) },
  plugins: [turn],
});
const js = r.outputFiles[0].text;
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script), EIGHT_MORE ${want ? 'on' : 'off'}`);
