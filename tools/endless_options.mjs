// THE TEN SKETCHES FOR ENDLESS MODE'S SPLASH (src/dev/endless_options.ts), each as a picture for the owner: its page built and
// photographed, one picture an option.
//   node tools/endless_options.mjs <out dir>     option_01.png ... option_10.png (1024 x 632)
import { bundle, load, page, write, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';

const [out = 'shots/endless_options'] = process.argv.slice(2);
const js = await bundle('src/dev/endless_options_page.ts', { minify: false });
const file = write('dist/endless_options_page.html', page(js, 'Endless options'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 632 }, deviceScaleFactor: 1 });
fs.mkdirSync(path.resolve(ROOT, out), { recursive: true });
let errors = 0;
for (let n = 1; n <= 10; n++) {
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => { errors++; console.log(`[page error] ${n}:`, e.message); });
  await pg.goto('file://' + path.resolve(ROOT, file) + `#n=${n}`);
  await pg.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  await pg.screenshot({ path: path.resolve(ROOT, out, `option_${String(n).padStart(2, '0')}.png`) });
  await pg.close();
}
console.log(`10 pictures in ${out}, errors ${errors}`);
await browser.close();
