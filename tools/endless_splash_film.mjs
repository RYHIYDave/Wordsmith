// ENDLESS MODE'S SPLASH, PAINTED (art/endless_splash.ts, ui/endless_splash_draw.ts), AS PICTURES AND A FILM for the owner: the
// page of its own (src/dev/endless_splash_page.ts) built and photographed moment by moment, every picture pixel two across.
//   [PIC=hall] [STILLS=0.5,3] node tools/endless_splash_film.mjs <out dir> [w h] [fps] [seconds]
//       frames <out>/f_0000.png ..., or (STILLS) stills at those moments; PIC=hall: the hall of gates, else the stair
//   (then: ffmpeg -framerate 30 -i <out>/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 14 <out>/endless_splash.mp4)
import { bundle, load, page, write, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';

const [out = 'shots/endless_splash/film', W = '507', H = '234', FPS = '30', SECS = '3.2'] = process.argv.slice(2);
const w = Number(W);
const h = Number(H);
const js = await bundle('src/dev/endless_splash_page.ts', { minify: false });
const file = write('dist/endless_splash_page.html', page(js, 'Endless splash'));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w * 2, height: h * 2 }, deviceScaleFactor: 2 });
const pg = await ctx.newPage();
let errors = 0;
pg.on('pageerror', (e) => { errors++; console.log('[page error]', e.message); });
pg.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('[console error]', m.text()); } });
await pg.goto('file://' + path.resolve(ROOT, file) + `#w=${w}&h=${h}&pic=${process.env.PIC || 'stair'}`);
await pg.waitForFunction('window.__ready === true', null, { timeout: 60000 });
console.log(`painted in ${await pg.evaluate(() => window.__paintMs)} ms in the browser`);
fs.mkdirSync(path.resolve(ROOT, out), { recursive: true });
const fps = Number(FPS);
const n = Math.round(Number(SECS) * fps);
if (process.env.STILLS) {
  for (const t of process.env.STILLS.split(',').map(Number)) {
    await pg.evaluate((tt) => window.__splash(tt), t);
    await pg.screenshot({ path: path.resolve(ROOT, out, `still_${t.toFixed(2)}.png`) });
  }
} else {
  for (let i = 0; i < n; i++) {
    await pg.evaluate((tt) => window.__splash(tt), i / fps);
    await pg.screenshot({ path: path.resolve(ROOT, out, `f_${String(i).padStart(4, '0')}.png`) });
  }
}
console.log(`${process.env.STILLS ? 'stills' : n + ' frames'} in ${out}, errors ${errors}`);
await browser.close();
