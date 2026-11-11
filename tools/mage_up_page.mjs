// THE MAGE BROUGHT UP: A PAGE OF THE GAME TO LOOK AT HER IN, WITH HER SWITCH ON OR OFF (the Mage chat, 11 Nov 2026).
// As tools/build_to.mjs builds a page of the game as it is in the working tree, but with art/mage_up.ts MAGE_UP as asked,
// in the page and in the side painter's worker alike (the worker is the page's own script, and has no switch of its own:
// turning MAGE_UP on in the page alone would have the worker paint the old Mage's frames into the new one's lists).
// The source is not touched: the switch is turned as the file is read for this one bundle.
//   node tools/mage_up_page.mjs dist/mage_new.html on
//   node tools/mage_up_page.mjs dist/mage_old.html off
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, load, page, write } from './lib.mjs';
import { shipColossus } from './colossus_ship.mjs';

const [out = 'dist/mage_new.html', on = 'on'] = process.argv.slice(2);
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const want = on !== 'off';
const stamp = `UNRELEASED mage ${want ? 'up' : 'as she is'} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const colossus = shipColossus();
const esbuild = load('esbuild');
const SWITCH = /export const MAGE_UP = \{ on: (true|false) \};/;
const turn = {
  name: 'mage-up-switch',
  setup(build) {
    build.onLoad({ filter: /src[\\/]art[\\/]mage_up\.ts$/ }, (args) => {
      const text = fs.readFileSync(args.path, 'utf8');
      if (!SWITCH.test(text)) throw new Error('art/mage_up.ts: the switch is not where it was');
      return { contents: text.replace(SWITCH, `export const MAGE_UP = { on: ${want} };`), loader: 'ts' };
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
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script), MAGE_UP ${want ? 'on' : 'off'}`);
