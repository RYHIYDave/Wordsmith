// THE FOOTMEN'S FILM (floor 17, the art chat's mock-up): every move of theirs from in front and from behind, at the
// scale of a room with the knight in it, captioned, each strike again at half speed (src/dev/preview_masque_footmen.ts,
// its "film" mode). Frames are drawn in a headless browser, then made into an MP4 with ffmpeg.
//   node tools/footmen_film.mjs [out.mp4] [width] [height] [first:last] [mode]
// (mode: "film", every move; "deathfilm", his death on its own: footmen_death.mp4)
import { bundle, page, write, load, ROOT } from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [out = 'docs/mockups/masque_footmen/pictures/footmen_film.mp4', w = '1200', h = '720', range = '', mode = 'film'] = process.argv.slice(2);
const js = await bundle('src/dev/preview_masque_footmen.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_masque_footmen_film.html', page(js, 'footmen film'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: +w, height: +h } });
pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
await pg.goto('file://' + html + `#${mode}:0`);
await pg.waitForFunction('window.__ready === true', null, { timeout: 200000 });
const count = await pg.evaluate('window.__film.count');
const [a, b] = range ? range.split(':').map(Number) : [0, count - 1];
const dir = path.resolve(ROOT, 'shots/fm/film');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
for (let i = a; i <= b; i++) {
  const url = await pg.evaluate(`(window.__film.draw(${i}), document.querySelector('canvas').toDataURL('image/png'))`);
  fs.writeFileSync(path.join(dir, `f${String(i - a).padStart(5, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
  if (i % 100 === 0) console.log(`frame ${i} of ${count}`);
}
await browser.close();
const mp4 = path.resolve(ROOT, out);
fs.mkdirSync(path.dirname(mp4), { recursive: true });
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(dir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', mp4]);
console.log(`saved ${out}: ${b - a + 1} frames, ${((b - a + 1) / 30).toFixed(1)} s`);
