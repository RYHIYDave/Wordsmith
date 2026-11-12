// THE LIVING SHADOW IN PLAY: A PAGE OF THE GAME WITH ITS SWITCH ON OR OFF (the queue's finish-mage-and-warlock-eight-sides,
// step 3, 12 Nov 2026; as the Mage's, tools/mage_up_page.mjs on art/mage-up2). As tools/build_to.mjs builds a page of the game
// as it is in the working tree, but with art/shadow_art.ts LIVING_SHADOW as asked, in the page and in the side painter's
// worker alike (the worker is the page's own script, and has no switch of its own: turning LIVING_SHADOW on in the page alone
// would have the worker paint the old demon's frames into the Living Shadow's lists). The source is not touched: the switch is
// turned as the file is read for this one bundle.
//   node tools/shadow_page.mjs dist/shadow_on.html on
//   node tools/shadow_page.mjs dist/shadow_off.html off
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, load, page, write } from './lib.mjs';
import { shipColossus } from './colossus_ship.mjs';

const [out = 'dist/shadow_on.html', on = 'on'] = process.argv.slice(2);
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const want = on !== 'off';
const stamp = `UNRELEASED living shadow ${want ? 'on' : 'off'} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const colossus = shipColossus();
const esbuild = load('esbuild');
const SWITCH = /export const LIVING_SHADOW = \{ on: (true|false) \};/;
const turn = {
  name: 'living-shadow-switch',
  setup(build) {
    build.onLoad({ filter: /src[\\/]art[\\/]shadow_art\.ts$/ }, (args) => {
      const text = fs.readFileSync(args.path, 'utf8');
      if (!SWITCH.test(text)) throw new Error('art/shadow_art.ts: the switch is not where it was');
      return { contents: text.replace(SWITCH, `export const LIVING_SHADOW = { on: ${want} };`), loader: 'ts' };
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
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script), LIVING_SHADOW ${want ? 'on' : 'off'}`);
