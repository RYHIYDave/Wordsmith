// THE PHONE TEST PAGE, RUN END TO END IN PLAYWRIGHT'S CHROMIUM at a phone's size (docs/mockups/gpu_sculpt/README.md):
// every part shows, nothing is fetched, and what it says. Its WebGL2 here is SwiftShader (the CPU pretending to be a chip),
// so its chip times here are no guide to a phone's.
//   node tools/gpu_speed_check.mjs [dist/gpu_speed.html] [shot.png]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, load } from './lib.mjs';

const [file = 'dist/gpu_speed.html', shot = 'shots/gpu_sculpt/gpu_speed_page.png'] = process.argv.slice(2);
const { chromium } = load('playwright');
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const fetched = [];
page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) fetched.push(r.url()); });
page.on('console', (m) => { if (m.type() === 'error') console.log('page:', m.text()); });
page.on('pageerror', (e) => console.log('page error:', e.message));
const t0 = Date.now();
await page.goto('file://' + path.resolve(ROOT, file));
await page.waitForFunction(() => window.GPU_SPEED_DONE && document.querySelector('button'), null, { timeout: 3600000, polling: 2000 });
const done = await page.evaluate(() => window.GPU_SPEED_DONE);
const text = await page.evaluate(() => document.body.innerText);
const wide = await page.evaluate(() => document.documentElement.scrollWidth);
fs.mkdirSync(path.dirname(path.resolve(ROOT, shot)), { recursive: true });
await page.screenshot({ path: path.resolve(ROOT, shot), fullPage: true });
console.log(text);
console.log(`\n--- ran ${((Date.now() - t0) / 1000).toFixed(0)} s; page ${(fs.statSync(path.resolve(ROOT, file)).size / 1024 / 1024).toFixed(2)} MB; fetched: ${fetched.length ? fetched.join(' ') : 'nothing'}; widest ${wide} px of 390`);
console.log(JSON.stringify(done));
await browser.close();
