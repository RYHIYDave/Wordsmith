// Make the moving picture of the TRUE LEFT mock-up (8 Oct 2026; not in the game): the knight
// standing and turning on the spot with the game's four views beside eight views turned for real,
// from src/dev/preview_true_left.ts ("turn:<scale>").
//   node tools/true_left_gif.mjs <out.gif> [scale = 5] [every] [true4]
// `every` keeps one frame in so many as a PNG contact sheet beside the GIF (<out>.sheet.png).
// The page draws each frame; this collects them as PNGs and hands them to tools/hero_gif.py.
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [out = 'previews/true_left/knight_turning_8_and_4.gif', scale = '5', every = '0', variant = ''] = process.argv.slice(2);
const js = await bundle('src/dev/preview_true_left.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_true_left.html', page(js, 'true left gif'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1300, height: 900 } });
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + '#turn:' + scale + (variant ? ':' + variant : ''));
await pg.waitForFunction('window.__ready === true', null, { timeout: 60000 });
const n = await pg.evaluate(() => window.__frames);
const ms = await pg.evaluate(() => window.__tickMs);
const dir = path.resolve(ROOT, 'shots/gif_frames_true_left');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < n; i++) {
  const url = await pg.evaluate((k) => window.__frame(k), i);
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
if (errors) process.exit(1);
fs.mkdirSync(path.dirname(path.resolve(ROOT, out)), { recursive: true });
console.log(execFileSync('python3', [path.resolve(ROOT, 'tools/hero_gif.py'), dir, path.resolve(ROOT, out), String(Math.round(ms)), every]).toString().trim());
