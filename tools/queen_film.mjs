// THE QUEEN'S FILM (floor 18's boss, a mock-up: art/queen*.ts): every move of hers from in front and from behind, at
// the scale of the arena with the knight in it, captioned, each strike again at half speed. Its frames are drawn by
// src/dev/preview_queen.ts ("film") and handed straight to ffmpeg as they come (nothing kept on disk); also a contact
// sheet of one frame in every `every`.
//   node tools/queen_film.mjs docs/mockups/queen/pictures/queen_moves.mp4 [every]
import { bundle, page, write, load, ROOT } from './lib.mjs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const [out = 'shots/queen/queen_moves.mp4', every = '0'] = process.argv.slice(2);
const js = await bundle('src/dev/preview_queen.ts', { define: { __BUILD__: '"preview"', __DEV__: 'true' } });
const html = write('dist/preview_queen_film.html', page(js, 'preview_queen'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[pageerror]', e.message); });
await pg.goto('file://' + html + '#film');
await pg.waitForFunction('window.__ready === true', null, { timeout: 120000 });
const n = await pg.evaluate(() => window.__frames);
const outPath = path.resolve(ROOT, out);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res) => ff.on('close', res));
const sheet = [];
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  const url = await pg.evaluate((k) => window.__frame(k), i);
  const buf = Buffer.from(url.split(',')[1], 'base64');
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (+every && i % +every === 0) sheet.push(buf);
  if (i % 150 === 0) console.log(`frame ${i} of ${n} (${Math.round((Date.now() - t0) / 1000)} s): ${await pg.evaluate((k) => window.__said(k), i)}`);
}
ff.stdin.end();
const code = await done;
await browser.close();
if (+every) {
  const fs = await import('node:fs');
  const dir = outPath.replace(/\.mp4$/, '_sheet');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  sheet.forEach((b, i) => fs.writeFileSync(path.join(dir, `f${String(i * +every).padStart(5, '0')}.png`), b));
}
console.log(`${out}: ${n} frames, ${(n / 30).toFixed(1)} s, ffmpeg ${code}${errors ? `, ${errors} page errors` : ''}`);
process.exit(errors || code ? 1 : 0);
