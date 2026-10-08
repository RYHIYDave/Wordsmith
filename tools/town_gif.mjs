// Make a moving picture (GIF) of the town from src/dev/preview_town_gif.ts (Version 14.4).
//   node tools/town_gif.mjs <hall|gate|smithy|bazaar|ring|corner>[:scale[:still]] <out.gif> [every]
// One round of that place's person: a turn of their loop, what they do now and then, the rest of
// their loops. `every` keeps one frame in so many as a PNG contact sheet beside the GIF
// (<out>.sheet.png), for looking at single frames. With a third part in the first argument
// (seconds) the picture is a single still: give the output a name ending in .png.
// The page draws each frame; this collects them as PNGs and hands them to tools/hero_gif.py.
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [who = 'hall', out = `previews/v144_${who.replace(/:.*/, '')}.gif`, every = '0'] = process.argv.slice(2);
const js = await bundle('src/dev/preview_town_gif.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_town_gif.html', page(js, 'town gif'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1300, height: 900 } });
let errors = 0;
pg.on('console', (m) => console.log(`[${m.type()}]`, m.text()));
pg.on('pageerror', (e) => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + '#' + who);
await pg.waitForFunction('window.__ready === true', null, { timeout: 30000 });
const n = await pg.evaluate(() => window.__frames);
const ms = await pg.evaluate(() => window.__tickMs);
const dir = path.resolve(ROOT, 'shots/gif_frames_town_' + who.replace(/:/g, '_'));
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < n; i++) {
  const url = await pg.evaluate((k) => window.__frame(k), i);
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
if (errors) process.exit(1);
console.log(execFileSync('python3', [path.resolve(ROOT, 'tools/hero_gif.py'), dir, path.resolve(ROOT, out), String(Math.round(ms)), every]).toString().trim());
