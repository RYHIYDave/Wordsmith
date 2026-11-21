// THE GODOT PORT: THE START SCREEN'S PICTURE, the ring on the hill (art/title_ring.ts), as the class cards lie over it
// (ui/panels.ts drawTitle: put back into the dark, SMITH_NIGHT at 0.74), painted by the game in a headless browser:
//   node tools/godot_title.mjs   -> godot/assets/title/ring.png (its still: the picture before its first surge)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, bundle, load, RELEASE_DEFINES } from './lib.mjs';
import { encodePng } from './png.mjs';

const code = await bundle('tools/godot_title/page.ts', { define: RELEASE_DEFINES });
const { chromium } = load('playwright');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: code });
  const r = await page.evaluate(() => window.ringStill());
  if (errors.length) throw new Error(errors.join('\n'));
  const rgba = Buffer.from(r.rgba, 'base64');
  fs.mkdirSync(path.join(ROOT, 'godot/assets/title'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'godot/assets/title/ring.png'), encodePng(r.w, r.h, rgba));
  console.log(`ring: ${r.w} x ${r.h}`);
} finally {
  await browser.close();
}
