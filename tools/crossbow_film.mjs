// The crossbowmen's film (art chat mock-up, floor 19): every frame of src/dev/preview_keep_crossbowmen.ts's "film" mode,
// shot in a headless browser, then put together as an MP4 for a phone.
//   node tools/crossbow_film.mjs [out.mp4] [width] [height] [from] [to]
import { bundle, page, write, load, ROOT } from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [out = 'docs/mockups/keep_crossbowmen/pictures/crossbowmen_film.mp4', w = '1200', h = '680', from = '0', to = ''] = process.argv.slice(2);
const js = await bundle('src/dev/preview_keep_crossbowmen.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_keep_crossbowmen.html', page(js, 'crossbowmen film'));
const dir = path.resolve(ROOT, 'shots/cb/film');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: +w, height: +h } });
pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
await pg.goto('file://' + html + '#film:0');
await pg.waitForFunction('window.__ready === true', null, { timeout: 120000 });
const n = await pg.evaluate('window.__film.n');
const last = to ? Math.min(n, +to) : n;
console.log(`${n} frames (${(n / 30).toFixed(1)} s); shooting ${from}..${last}`);
for (let i = +from; i < last; i++) {
  await pg.evaluate(`window.__film.draw(${i})`);
  await pg.screenshot({ path: path.join(dir, `f${String(i).padStart(5, '0')}.png`) });
  if (i % 100 === 0) console.log(`frame ${i}`);
}
await browser.close();
const ff = fs.existsSync('/usr/bin/ffmpeg') ? 'ffmpeg' : 'ffmpeg';
execFileSync(ff, ['-y', '-loglevel', 'error', '-framerate', '30', '-start_number', String(from), '-i', path.join(dir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', path.resolve(ROOT, out)]);
console.log(`saved ${out}`);
