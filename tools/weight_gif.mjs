// Make a moving picture (GIF) of one attack of a hero, before and now, from src/dev/preview_weight.ts.
//   node tools/weight_gif.mjs "warrior:attack:film:0.12,0.3" previews/weight_strike.gif
// (the last part of the first argument is the rules' wind-up and follow-through for the attack)
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [who = 'warrior', out = `previews/hero_${who.replace(/:/g, '_')}.gif`, every = '0'] = process.argv.slice(2);
const js = await bundle('src/dev/preview_weight.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_weight.html', page(js, 'weight gif'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1300, height: 900 } });
// (a fixed tick of 30 ms: three hundredths of a second a frame is as near the game's thirty a second as a GIF gets)
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + '#' + who);
await pg.waitForFunction('window.__ready === true', null, { timeout: 15000 });
const n = await pg.evaluate(() => window.__frames);
const ms = await pg.evaluate(() => window.__tickMs);
const dir = path.resolve(ROOT, 'shots/gif_frames_' + who.replace(/:/g, '_'));
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < n; i++) {
  const url = await pg.evaluate((k) => window.__frame(k), i);
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
if (errors) process.exit(1);
console.log(execFileSync('python3', [path.resolve(ROOT, 'tools/hero_gif.py'), dir, path.resolve(ROOT, out), String(Math.round(ms)), every]).toString().trim());
