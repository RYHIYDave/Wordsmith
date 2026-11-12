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
  // (A BAKE CARRIED ON WHERE IT STOPPED, 12 Nov 2026: a group once baked is kept, its line of the record in .said-<group>.json
  // beside it, until the whole bake is done; a stopped bake (the machine restarted, the page gave out) bakes only the groups left.
  // And each group on a page of its own, closed once it is baked, so that what one held is all given back before the next.)
  fs.mkdirSync(dir, { recursive: true });
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const t0 = Date.now();
  const said = { mark, groups: {} };
  const saidOf = (g) => path.join(dir, `.said-${g}.json`);
  const open = async () => {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ content: code });
    if (errors.length) throw new Error(errors.join('\n'));
    return page;
  };
  try {
    const first = await open();
    const groups = await first.evaluate(() => window.bake.groups());
    await first.close();
    for (const g of groups) {
      if (fs.existsSync(saidOf(g))) {
        said.groups[g] = JSON.parse(fs.readFileSync(saidOf(g), 'utf8'));
        log(`baked ${g} already (kept from a bake that stopped)`);
        continue;
      }
      const page = await open();
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
        // (a hero kept in packs, render/baked.ts PACKS: after the sheets he always holds, one for each pack, named by it:
        // <group>-<move>-<side>.png)
        const pack = n >= info.held ? file.packs[n - info.held] : null;
        const name = pack ? `${g}-${pack.name.replace(/[^a-zA-Z0-9]+/g, '-')}.png` : `${g}-${n}.png`;
        if (names.includes(name)) throw new Error(`${g}: two sheets named ${name}`);
        fs.writeFileSync(path.join(dir, name), png);
        names.push(name);
        if (pack) pack.sheet = name;
        bytes += png.length;
      }
      await page.evaluate((name) => window.bake.drop(name), g);
      fs.writeFileSync(path.join(dir, `${g}.json`), JSON.stringify({ mark, ...file, sheets: names.slice(0, info.held) }));
      said.groups[g] = { frames: info.frames, places: info.places, sheets: names.length, mb: +(bytes / 1e6).toFixed(2), s: +(info.ms / 1000).toFixed(1) };
      if (info.packs) Object.assign(said.groups[g], { packs: info.packs, heldMb: +(info.heldBytes / 1048576).toFixed(1), packsMb: +(info.packBytes / 1048576).toFixed(1) });
      log(`baked ${g}: ${info.frames} frames for ${info.places} places, ${names.length} sheets, ${(bytes / 1e6).toFixed(2)} MB (${(info.ms / 1000).toFixed(1)} s to paint)${info.packs ? `; ${info.packs} packs: ${(info.heldBytes / 1048576).toFixed(1)} MB always held, ${(info.packBytes / 1048576).toFixed(1)} MB in packs, unpacked` : ''}`);
      fs.writeFileSync(saidOf(g), JSON.stringify(said.groups[g]));
      await page.close();
    }
  } finally {
    await browser.close();
  }
  said.s = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(dir, 'done.json'), JSON.stringify(said, null, 1));
  for (const f of fs.readdirSync(dir)) if (f.startsWith('.said-')) fs.rmSync(path.join(dir, f));
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
