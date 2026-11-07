// THE HEROES' PICTURES BAKED (render/baked.ts says why; his pick, 6 Nov 2026: “Inside the game file”).
//   node tools/bake_heroes.mjs            bakes them (if this art has not been baked already) and says where
// The bake goes beside the game's page, in heroes/<mark>/ (tools/build.mjs, dist/heroes/). The bake's mark is taken from the code that paints the heroes (src/dev/bake_heroes_page.ts, bundled as the game is): the
// same art, the same mark, and the bake is kept (in .bake/<mark>/) and not made again; the art changed, a new mark and a new
// bake. The game is built knowing the mark (tools/build.mjs), and takes in only a bake of that mark.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle } from './lib.mjs';
import { encodePng } from './png.mjs';

const require = createRequire(import.meta.url);

/** The mark of the heroes' art as it is now, and the code that bakes it. */
export async function bakeCode() {
  const code = await bundle('src/dev/bake_heroes_page.ts', { define: RELEASE_DEFINES });
  const mark = createHash('sha256').update(code).digest('hex').slice(0, 12);
  return { code, mark };
}

/** The bake of the heroes' art as it is now, made if it is not there yet. Its mark and its folder. */
export async function bakeHeroes({ log = console.log } = {}) {
  const { code, mark } = await bakeCode();
  const dir = path.join(ROOT, '.bake', mark);
  if (fs.existsSync(path.join(dir, 'done.json'))) return { mark, dir, fresh: false };
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const t0 = Date.now();
  const said = { mark, groups: {} };
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ content: code });
    if (errors.length) throw new Error(errors.join('\n'));
    const groups = await page.evaluate(() => window.bake.groups());
    for (const g of groups) {
      const info = await page.evaluate((name) => window.bake.group(name), g);
      if (info.dropped.length) throw new Error(`${g}: a frame has parts that cannot be kept (${info.dropped.join(', ')})`);
      const file = JSON.parse(await page.evaluate((name) => window.bake.file(name), g));
      const names = [];
      let bytes = 0;
      for (let n = 0; n < info.sheets.length; n++) {
        const { w, h } = info.sheets[n];
        const b64 = await page.evaluate(([name, k]) => window.bake.sheet(name, k), [g, n]);
        const rgba = Buffer.from(b64, 'base64');
        if (rgba.length !== w * h * 4) throw new Error(`${g} sheet ${n}: ${rgba.length} bytes, want ${w * h * 4}`);
        const png = encodePng(w, h, rgba);
        // (the sheet as written, read back as the game reads it, against every frame on it as painted)
        const ck = await page.evaluate(([name, k, b]) => window.bake.check(name, k, b), [g, n, png.toString('base64')]);
        if (ck.differ) throw new Error(`${g} sheet ${n}: ${ck.differ} pixels of its ${ck.frames} frames are not as painted (by ${ck.most} at most)`);
        const name = `${g}-${n}.png`;
        fs.writeFileSync(path.join(dir, name), png);
        names.push(name);
        bytes += png.length;
      }
      await page.evaluate((name) => window.bake.drop(name), g);
      fs.writeFileSync(path.join(dir, `${g}.json`), JSON.stringify({ mark, ...file, sheets: names }));
      said.groups[g] = { frames: info.frames, places: info.places, sheets: names.length, mb: +(bytes / 1e6).toFixed(2), s: +(info.ms / 1000).toFixed(1) };
      log(`baked ${g}: ${info.frames} frames for ${info.places} places, ${names.length} sheets, ${(bytes / 1e6).toFixed(2)} MB (${(info.ms / 1000).toFixed(1)} s to paint)`);
    }
  } finally {
    await browser.close();
  }
  said.s = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(dir, 'done.json'), JSON.stringify(said, null, 1));
  return { mark, dir, fresh: true };
}

/** The files of a bake, and where each is (published beside the game's page as heroes/<mark>/<name>). */
export function bakeFiles(mark) {
  const dir = path.join(ROOT, '.bake', mark);
  return fs.readdirSync(dir).filter((f) => f !== 'done.json').sort().map((f) => ({ name: f, from: path.join(dir, f) }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const r = await bakeHeroes();
  const all = bakeFiles(r.mark);
  const mb = all.reduce((n, f) => n + fs.statSync(f.from).size, 0) / 1e6;
  console.log(`${r.fresh ? 'baked' : 'already baked'}: ${r.mark}, ${all.length} files, ${mb.toFixed(2)} MB, in ${r.dir}`);
}
