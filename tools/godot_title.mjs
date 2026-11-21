// THE GODOT PORT: THE START SCREEN'S PICTURE, the ring on the hill (art/title_ring.ts), painted by the game in a headless browser:
//   node tools/godot_title.mjs                -> godot/assets/title/ring.png, its still (the picture before its first surge, as the
//                                                class cards lie over it in a check); ring_<layer>.png, the layers the picture is laid
//                                                up from and what its life is drawn with, and ring.json (title_ring.gd)
//   node tools/godot_title.mjs --life <dir>   -> <dir>/life.json: the picture whole at a few moments of its life, and its flash, for
//                                                the port's to be held to (godot/scripts/check_title.gd, --only=title_ring)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, bundle, load, RELEASE_DEFINES } from './lib.mjs';
import { encodePng } from './png.mjs';

const lifeAt = process.argv.indexOf('--life');
const code = await bundle('tools/godot_title/page.ts', { define: RELEASE_DEFINES });
const { chromium } = load('playwright');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: code });
  if (lifeAt >= 0) {
    const dir = path.resolve(process.argv[lifeAt + 1]);
    // (before its first surge; the surge's light running up the column; its wave across the sky and its ring across the hill; the
    // runes dying back; between surges; the second surge)
    const ts = [0, 1.7, 3.3, 3.62, 3.85, 4.4, 5.6, 9.25, 11.4, 12.2];
    const out = await page.evaluate((t) => window.ringLife(t), ts);
    if (errors.length) throw new Error(errors.join('\n'));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'life.json'), JSON.stringify(out));
    console.log(`life: ${out.length} moments -> ${dir}/life.json`);
  } else {
    const r = await page.evaluate(() => window.ringStill());
    const L = await page.evaluate(() => window.ringLayers());
    if (errors.length) throw new Error(errors.join('\n'));
    const out = path.join(ROOT, 'godot/assets/title');
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'ring.png'), encodePng(r.w, r.h, Buffer.from(r.rgba, 'base64')));
    for (const [k, v] of Object.entries(L.layers)) fs.writeFileSync(path.join(out, `ring_${k}.png`), encodePng(v.w, v.h, Buffer.from(v.rgba, 'base64')));
    fs.writeFileSync(path.join(out, 'ring.json'), JSON.stringify(L.data, null, 1) + '\n');
    console.log(`ring: ${r.w} x ${r.h}; layers: ${Object.keys(L.layers).join(', ')}`);
  }
} finally {
  await browser.close();
}
