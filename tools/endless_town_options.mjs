// THE TEN ENDLESS-TOWN SKETCHES (src/dev/endless_town_options.ts) as five pictures for the owner's phone, two sketches in each.
//   node tools/endless_town_options.mjs [out dir]     options_1.png ... options_5.png (1200 x 1420)
import { bundle, load, page, write, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';

const [out = 'docs/mockups/endless_town/pictures'] = process.argv.slice(2);
const js = await bundle('src/dev/endless_town_options_page.ts', { minify: false });
const file = write('dist/endless_town_options_page.html', page(js, 'Endless town options'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 1420 }, deviceScaleFactor: 1 });
fs.mkdirSync(path.resolve(ROOT, out), { recursive: true });
let errors = 0;
for (let k = 1; k <= 5; k++) {
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => { errors++; console.log(`[page error] ${k}:`, e.message); });
  await pg.goto('file://' + path.resolve(ROOT, file) + `#k=${k}`);
  await pg.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  await pg.screenshot({ path: path.resolve(ROOT, out, `options_${k}.png`) });
  await pg.close();
}
console.log(`5 pictures in ${out}, errors ${errors}`);
await browser.close();
