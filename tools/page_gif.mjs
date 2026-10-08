// Make a moving picture (GIF) of any dev page that can show itself frame by frame: the page sets
// window.__frames (how many), window.__tickMs (how long each stands) and window.__frame(k), which
// draws frame k and gives it back as a PNG data URL (src/dev/preview_wire.ts does).
//   node tools/page_gif.mjs src/dev/preview_wire.ts "volley:film" previews/wire_volley.gif [every]
// [every]: also save a contact sheet of one frame in that many (tools/hero_gif.py).
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [entry, hash = '', out = 'previews/page.gif', every = '0'] = process.argv.slice(2);
if (!entry) { console.error('usage: node tools/page_gif.mjs <entry.ts> "<hash>" <out.gif> [every]'); process.exit(1); }
const name = path.basename(entry).replace(/\.ts$/, '');
const js = await bundle(entry, { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write(`dist/${name}.html`, page(js, name));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1600, height: 900 } });
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + '#' + hash);
await pg.waitForFunction('window.__ready === true', null, { timeout: 15000 });
const n = await pg.evaluate(() => window.__frames);
const ms = await pg.evaluate(() => window.__tickMs);
const dir = path.resolve(ROOT, 'shots/gif_frames_' + name + '_' + hash.replace(/[^a-z0-9]+/gi, '_'));
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < n; i++) {
  const url = await pg.evaluate((k) => window.__frame(k), i);
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
if (errors) process.exit(1);
console.log(execFileSync('python3', [path.resolve(ROOT, 'tools/hero_gif.py'), dir, path.resolve(ROOT, out), String(Math.round(ms)), every]).toString().trim());
