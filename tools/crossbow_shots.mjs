// The crossbowmen's stills (art chat mock-up, floor 19): several views of src/dev/preview_keep_crossbowmen.ts shot in one
// headless browser, each `out.png=WIDTHxHEIGHT=hash`.
//   node tools/crossbow_shots.mjs shots/cb/sheet.png=1200x520=sheet shots/cb/head.png=1200x700=head:stand:0 ...
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';

const jobs = process.argv.slice(2).map((a) => {
  const [out, size, hash] = a.split('=');
  const [w, h] = size.split('x').map(Number);
  return { out, w, h, hash };
});
const js = await bundle('src/dev/preview_keep_crossbowmen.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_keep_crossbowmen.html', page(js, 'crossbowmen'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
for (const j of jobs) {
  const pg = await browser.newPage({ viewport: { width: j.w, height: j.h } });
  pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await pg.goto('file://' + html + '#' + j.hash);
  await pg.waitForFunction('window.__ready === true', null, { timeout: 300000 });
  await pg.screenshot({ path: path.resolve(ROOT, j.out) });
  await pg.close();
  console.log(`saved ${j.out}`);
}
await browser.close();
