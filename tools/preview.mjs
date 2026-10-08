// Render any TypeScript entry in a real (headless) browser and save a screenshot.
// The entry must set window.__ready = true when it has finished drawing.
//   node tools/preview.mjs src/dev/preview_tiles.ts shots/tiles.png [width] [height] [hash]
// [hash] is passed to the page after '#', for previews that have more than one view.
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';

const [entry, out = 'shots/preview.png', w = '960', h = '540', hash = ''] = process.argv.slice(2);
if (!entry) { console.error('usage: node tools/preview.mjs <entry.ts> [out.png] [width] [height]'); process.exit(1); }
const js = await bundle(entry, { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const name = path.basename(entry).replace(/\.ts$/, '');
const html = write(`dist/${name}.html`, page(js, name));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: +w, height: +h } });
let errors = 0;
pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(`[${m.type()}]`, m.text()); else console.log('[log]', m.text()); });
pg.on('pageerror', e => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + (hash ? '#' + hash : ''));
try { await pg.waitForFunction('window.__ready === true', null, { timeout: 15000 }); }
catch { console.log('[timeout] window.__ready was never set'); errors++; }
const outPath = path.resolve(ROOT, out);
await pg.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(errors ? `saved ${out} WITH ${errors} error(s)` : `saved ${out}`);
process.exit(errors ? 1 : 0);
