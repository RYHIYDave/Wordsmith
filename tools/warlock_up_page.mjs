// THE WARLOCK BROUGHT UP IN PLAY: A PAGE OF THE GAME WITH HIS SWITCH ON OR OFF (the queue's finish-mage-and-warlock-eight-sides,
// step 4, 12 Nov 2026; as tools/shadow_page.mjs and the Mage's tools/mage_up_page.mjs). As tools/build_to.mjs builds a page of the
// game as it is in the working tree, but with art/warlock_up.ts WARLOCK_UP as asked AND art/shadow_art.ts LIVING_SHADOW on (his
// demon as it will be: its yes is given), in the page and in the side painter's worker alike (the worker is the page's own script,
// and has no switch of its own). The source is not touched: the switches are turned as the files are read for this one bundle.
//   node tools/warlock_up_page.mjs dist/warlock_up_on.html on
//   node tools/warlock_up_page.mjs dist/warlock_up_off.html off
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, load, page, write } from './lib.mjs';
import { shipColossus } from './colossus_ship.mjs';

const [out = 'dist/warlock_up_on.html', on = 'on'] = process.argv.slice(2);
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const want = on !== 'off';
const stamp = `UNRELEASED warlock brought up ${want ? 'on' : 'off'} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const colossus = shipColossus();
const esbuild = load('esbuild');
const SWITCHES = [
  { file: /src[\\/]art[\\/]warlock_up\.ts$/, was: /export const WARLOCK_UP = \{ on: (true|false) \};/, now: `export const WARLOCK_UP = { on: ${want} };` },
  { file: /src[\\/]art[\\/]shadow_art\.ts$/, was: /export const LIVING_SHADOW = \{ on: (true|false) \};/, now: 'export const LIVING_SHADOW = { on: true };' },
];
const turn = {
  name: 'warlock-up-switch',
  setup(build) {
    for (const s of SWITCHES) {
      build.onLoad({ filter: s.file }, (args) => {
        const text = fs.readFileSync(args.path, 'utf8');
        if (!s.was.test(text)) throw new Error(`${args.path}: the switch is not where it was`);
        return { contents: text.replace(s.was, s.now), loader: 'ts' };
      });
    }
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
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script), WARLOCK_UP ${want ? 'on' : 'off'}, LIVING_SHADOW on`);
