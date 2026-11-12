// THE SHAFT'S RIM ALIVE (the endless town, step 4): the dev page src/dev/preview_shaft_rim.ts in its mode `film`, photographed a
// thirtieth of a second at a time (the knight's walk round the pit, the torches' flames, the far fire breathing, the townsfolk).
//   node tools/rim_town_film.mjs [out dir]   frames <out>/f_0000.png ...; then
//   ffmpeg -framerate 30 -i <out>/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 docs/mockups/endless_town/pictures/rim_town.mp4
import { bundle, load, page, write, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';

const [out = '/dev/shm/rim_film'] = process.argv.slice(2);
const js = await bundle('src/dev/preview_shaft_rim.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const file = write('dist/rim_town_film.html', page(js, 'rim town film'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1014, height: 528 } });
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[page error]', e.message); });
pg.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('[console error]', m.text()); } });
await pg.goto('file://' + path.resolve(ROOT, file) + '#film');
await pg.waitForFunction('window.__ready === true', null, { timeout: 60000 });
const secs = await pg.evaluate(() => window.__filmSeconds);
fs.mkdirSync(out, { recursive: true });
const n = Math.round(secs * 30);
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  await pg.evaluate((tt) => window.__film(tt), i / 30);
  await pg.screenshot({ path: path.join(out, `f_${String(i).padStart(4, '0')}.png`) });
}
console.log(`${n} frames (${secs.toFixed(2)} s) in ${out}, ${((Date.now() - t0) / 1000).toFixed(0)} s, errors ${errors}`);
await browser.close();
