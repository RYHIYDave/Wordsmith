// THE QUEEN'S GUARD'S FILM (floor 18, a mock-up for the owner): every frame of src/dev/preview_queens_guard.ts's film,
// drawn in a headless browser and put together at 30 frames a second.
//   node tools/queens_guard_film.mjs docs/mockups/queens_guard/pictures/queens_guard_moves.mp4 [from] [to]
// (from/to: only those frames, as stills in shots/qg/film/, to look at)
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [out = 'shots/qg/film.mp4', from, to] = process.argv.slice(2);
const W = 1200;
const H = 676;
const js = await bundle('src/dev/preview_queens_guard.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_queens_guard_film.html', page(js, 'queens guard film'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: W, height: H } });
pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
await pg.goto('file://' + html + '#none');
await pg.waitForFunction('window.__ready === true', null, { timeout: 120000 });
const count = await pg.evaluate('window.__film.count');
const dir = path.resolve(ROOT, 'shots/qg/film');
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const a = from !== undefined ? +from : 0;
const b = to !== undefined ? +to : count - 1;
console.log(`${count} frames (${(count / 30).toFixed(1)} s); drawing ${a} to ${b}`);
for (let i = a; i <= b; i++) {
  const url = await pg.evaluate((k) => {
    window.__film.draw(k);
    return document.querySelector('canvas').toDataURL('image/png');
  }, i);
  fs.writeFileSync(path.join(dir, `f${String(i - a).padStart(5, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
  if (i % 100 === 0) console.log(`  frame ${i}`);
}
await browser.close();
if (from === undefined) {
  const ff = fs.existsSync('/usr/bin/ffmpeg') ? '/usr/bin/ffmpeg' : 'ffmpeg';
  execFileSync(ff, ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(dir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', path.resolve(ROOT, out)], { stdio: 'inherit' });
  console.log(`saved ${out}`);
}
