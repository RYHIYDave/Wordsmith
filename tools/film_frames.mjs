// Save every frame of a dev page that shows itself frame by frame (window.__frames, window.__frame(k) giving a PNG data
// URL, as tools/page_gif.mjs asks) as PNGs in a folder, for ffmpeg to make a film of. (page_gif.mjs makes a GIF of them.)
//   node tools/film_frames.mjs src/dev/preview_gallery_ladies.ts "film" shots/ladies/film [from] [to]
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';

const [entry, hash = '', out = 'shots/film', from = '0', to = ''] = process.argv.slice(2);
if (!entry) { console.error('usage: node tools/film_frames.mjs <entry.ts> "<hash>" <out dir> [from] [to]'); process.exit(1); }
const name = path.basename(entry).replace(/\.ts$/, '');
const js = await bundle(entry, { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write(`dist/${name}_film.html`, page(js, name));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1280, height: 720 } });
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + '#' + hash);
await pg.waitForFunction('window.__ready === true', null, { timeout: 600000 });
const n = await pg.evaluate(() => window.__frames);
const dir = path.resolve(ROOT, out);
fs.mkdirSync(dir, { recursive: true });
const last = to ? Math.min(n, +to) : n;
for (let i = +from; i < last; i++) {
  const url = await pg.evaluate((k) => window.__frame(k), i);
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
console.log(`${last - +from} of ${n} frames in ${out}${errors ? ` WITH ${errors} error(s)` : ''}`);
process.exit(errors ? 1 : 0);
