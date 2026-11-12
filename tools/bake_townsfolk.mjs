// THE TOWN'S PEOPLE BAKED (render/townsfolk_baked.ts says why; the townsfolk bake chat, 11 Nov 2026): the sculpted four
// (art/townsfolk3.ts), every frame painted once and laid on sheets, in the manner of the heroes' bake (tools/bake_heroes.mjs).
//   node tools/bake_townsfolk.mjs            bakes them (if this art has not been baked already) and says where
// The bake goes beside the game's page, in townsfolk/<mark>/ (tools/build.mjs, dist/townsfolk/): townsfolk.json and its sheets.
// The bake's mark is taken from the code that paints them (src/dev/bake_townsfolk_page.ts, bundled as the game is): the same
// art, the same mark, and the bake is kept (in .bake/townsfolk/<mark>/) and not made again; the art changed, a new mark and a
// new bake (some minutes: a frame is a tenth to a third of a second to paint). The game is built knowing the mark
// (__TOWNSFOLK_BAKE__), and takes in only a bake of that mark.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, load } from './lib.mjs';
import { encodePng } from './png.mjs';

/** The bake's one group (render/townsfolk_baked.ts TOWNSFOLK_GROUP): its file is <group>.json, its sheets <group>-<n>.png. */
const GROUP = 'townsfolk';
/** Where the bakes are kept, each in a folder named by its mark. */
const KEPT = path.join(ROOT, '.bake', 'townsfolk');

/** The mark of the townsfolk's art as it is now, and the code that bakes it. */
export async function townsfolkBakeCode() {
  const code = await bundle('src/dev/bake_townsfolk_page.ts', { define: RELEASE_DEFINES });
  const mark = createHash('sha256').update(code).digest('hex').slice(0, 12);
  return { code, mark };
}

/** Is the bake of the art as it is now made already? Its mark and its folder if so, or null. */
export async function townsfolkBaked() {
  const { mark } = await townsfolkBakeCode();
  const dir = path.join(KEPT, mark);
  return fs.existsSync(path.join(dir, 'done.json')) ? { mark, dir, fresh: false } : null;
}

/** The bake of the townsfolk's art as it is now, made if it is not there yet. Its mark and its folder. */
export async function bakeTownsfolk({ log = console.log } = {}) {
  const { code, mark } = await townsfolkBakeCode();
  const dir = path.join(KEPT, mark);
  if (fs.existsSync(path.join(dir, 'done.json'))) return { mark, dir, fresh: false };
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const { chromium } = load('playwright');
  const browser = await chromium.launch();
  const t0 = Date.now();
  const said = { mark, lists: {} };
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ content: code });
    if (errors.length) throw new Error(errors.join('\n'));
    const lists = await page.evaluate(() => window.bakeFolk.lists());
    for (let l = 0; l < lists.length; l++) {
      const p = await page.evaluate((n) => window.bakeFolk.paint(n), l);
      if (errors.length) throw new Error(errors.join('\n'));
      said.lists[p.name] = { places: p.places, frames: p.frames, s: +(p.ms / 1000).toFixed(1) };
      log(`painted ${p.name}: ${p.places} places, ${p.frames} frames of its own (${(p.ms / 1000).toFixed(1)} s)`);
    }
    const info = await page.evaluate(() => window.bakeFolk.pack());
    if (info.dropped.length) throw new Error(`a frame has parts that cannot be kept (${info.dropped.join(', ')})`);
    const file = JSON.parse(await page.evaluate(() => window.bakeFolk.file()));
    const names = [];
    let bytes = 0;
    for (let n = 0; n < info.sheets.length; n++) {
      const { w, h } = info.sheets[n];
      const b64 = await page.evaluate((k) => window.bakeFolk.sheet(k), n);
      const rgba = Buffer.from(b64, 'base64');
      if (rgba.length !== w * h * 4) throw new Error(`sheet ${n}: ${rgba.length} bytes, want ${w * h * 4}`);
      const png = encodePng(w, h, rgba);
      // (the sheet as written, read back as the game reads it, against every frame on it as painted)
      const ck = await page.evaluate(([k, b]) => window.bakeFolk.check(k, b), [n, png.toString('base64')]);
      if (ck.differ) throw new Error(`sheet ${n}: ${ck.differ} pixels of its ${ck.frames} frames are not as painted (by ${ck.most} at most)`);
      const name = `${GROUP}-${n}.png`;
      fs.writeFileSync(path.join(dir, name), png);
      names.push(name);
      bytes += png.length;
      log(`sheet ${n}: ${w}x${h}, ${ck.frames} frames, read back the same as painted, ${(png.length / 1e6).toFixed(2)} MB`);
    }
    fs.writeFileSync(path.join(dir, `${GROUP}.json`), JSON.stringify({ mark, group: GROUP, ...file, sheets: names }));
    Object.assign(said, { frames: info.frames, first: info.first, places: info.places, sheets: names.length, mb: +(bytes / 1e6).toFixed(2), heldMb: +((info.px * 4) / 1e6).toFixed(1), paintS: +(info.ms / 1000).toFixed(1) });
    log(`baked the townsfolk: ${info.frames} frames (the first ${info.first} the loops the town shows at once) for ${info.places} places, ${names.length} sheets, ${(bytes / 1e6).toFixed(2)} MB (${(info.ms / 1000).toFixed(1)} s to paint; ${((info.px * 4) / 1e6).toFixed(1)} MB as pictures in hand)`);
  } finally {
    await browser.close();
  }
  said.s = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(dir, 'done.json'), JSON.stringify(said, null, 1));
  return { mark, dir, fresh: true };
}

/** The files of a bake, and where each is (published beside the game's page as townsfolk/<mark>/<name>). */
export function townsfolkBakeFiles(mark) {
  const dir = path.join(KEPT, mark);
  return fs.readdirSync(dir).filter((f) => f !== 'done.json').sort().map((f) => ({ name: f, from: path.join(dir, f) }));
}

/**
 * THE BAKE CARRIED BESIDE A PAGE (tools/build.mjs, tools/build_to.mjs): dist/townsfolk/<mark>/, the old ones gone. `make`: bake
 * it now if this art is not baked yet (some minutes); without it, only a bake already kept is carried. The mark ('' : none
 * carried; the page's townsfolk are then as they were) and the files.
 */
export async function shipTownsfolk({ make = true, log = console.log } = {}) {
  fs.rmSync(path.join(ROOT, 'dist', 'townsfolk'), { recursive: true, force: true });
  const bake = make ? await bakeTownsfolk({ log }) : await townsfolkBaked();
  if (!bake) return { mark: '', files: [] };
  const to = path.join(ROOT, 'dist', 'townsfolk', bake.mark);
  fs.mkdirSync(to, { recursive: true });
  const files = townsfolkBakeFiles(bake.mark);
  for (const f of files) fs.copyFileSync(f.from, path.join(to, f.name));
  return { mark: bake.mark, files: files.map((f) => f.name), fresh: bake.fresh };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const r = await bakeTownsfolk();
  const all = townsfolkBakeFiles(r.mark);
  const mb = all.reduce((n, f) => n + fs.statSync(f.from).size, 0) / 1e6;
  console.log(`${r.fresh ? 'baked' : 'already baked'}: ${r.mark}, ${all.length} files, ${mb.toFixed(2)} MB, in ${r.dir}`);
}
