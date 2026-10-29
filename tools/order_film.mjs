// THE SILENT ORDER'S FILM: draws src/dev/preview_silent_order.ts's film frame by frame in a headless browser and makes an
// MP4 of it (30 frames a second, H.264, for a phone).
//   node tools/order_film.mjs <all|guest|armed|mask> <out.mp4> [width] [height] [from] [to]
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [who = 'all', out = 'shots/order/film.mp4', w = '1200', h = '1300', from = '0', to = '999999'] = process.argv.slice(2);
const entry = 'src/dev/preview_silent_order.ts';
const js = await bundle(entry, { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_silent_order_film.html', page(js, 'order film'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: +w, height: +h } });
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + '#film:' + who);
await pg.waitForFunction('window.__ready === true', null, { timeout: 120000 });
const n = await pg.evaluate(() => window.__frames);
const dir = path.resolve(ROOT, `shots/order/film_${who}`);
fs.mkdirSync(dir, { recursive: true });
const a = Math.max(0, +from);
const b = Math.min(n, +to);
console.log(`${n} frames; painting ${a} to ${b}`);
const t0 = Date.now();
for (let i = a; i < b; i++) {
  const url = await pg.evaluate((k) => window.__frame(k), i);
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(5, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
  if (i % 60 === 0) console.log(`frame ${i} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
if (errors) process.exit(1);
if (b >= n) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(dir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', path.resolve(ROOT, out)]);
  console.log(`saved ${out}`);
}
