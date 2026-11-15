// THE HEROES' PICTURES BAKED (render/baked.ts says why; his pick, 6 Nov 2026: “Inside the game file”).
//   node tools/bake_heroes.mjs            bakes them (if this art has not been baked already) and says where
// The bake goes beside the game's page, in heroes/<mark>/ (tools/build.mjs, dist/heroes/). The bake's mark is taken from the code that paints the heroes (src/dev/bake_heroes_page.ts, bundled as the game is): the
// same art, the same mark, and the bake is kept (in .bake/<mark>/) and not made again; the art changed, a new mark and a new
// bake. The game is built knowing the mark (tools/build.mjs), and takes in only a bake of that mark.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle } from './lib.mjs';
import { encodePng } from './png.mjs';
import { groupMarks } from './bake_marks.mjs';

const require = createRequire(import.meta.url);

/** The mark of the heroes' art as it is now, and the code that bakes it. */
export async function bakeCode() {
  const code = await bundle('src/dev/bake_heroes_page.ts', { define: RELEASE_DEFINES });
  const mark = createHash('sha256').update(code).digest('hex').slice(0, 12);
  return { code, mark };
}

/** A group of an earlier bake whose heroes are painted with the same code (`gmark`, tools/bake_marks.mjs): its file and where its sheets are. */
function keptGroup(g, gmark, mark, log) {
  const want = (f) => f && f.group === g && f.gmark === gmark;
  const sheetsOf = (f) => [...new Set([...f.sheets, ...(f.packs ?? []).map((p) => p.sheet)])];
  // (an earlier bake on this machine, .bake/<mark>/)
  const bakes = path.join(ROOT, '.bake');
  for (const m of fs.existsSync(bakes) ? fs.readdirSync(bakes) : []) {
    if (m === mark) continue;
    const j = path.join(bakes, m, `${g}.json`);
    if (!fs.existsSync(j)) continue;
    let f;
    try { f = JSON.parse(fs.readFileSync(j, 'utf8')); } catch { continue; }
    if (!want(f) || !sheetsOf(f).every((n) => fs.existsSync(path.join(bakes, m, n)))) continue;
    return { f, from: `.bake/${m}`, read: (n) => fs.readFileSync(path.join(bakes, m, n)) };
  }
  // (the bake published with the game, on gh-pages: heroes/<mark>/, for a machine that has not baked before)
  for (const ref of ['origin/gh-pages', 'gh-pages']) {
    let dirs;
    try { dirs = execFileSync('git', ['ls-tree', '--name-only', `${ref}:heroes`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean); } catch { continue; }
    for (const m of dirs) {
      if (m === mark) continue;
      let f;
      try { f = JSON.parse(execFileSync('git', ['show', `${ref}:heroes/${m}/${g}.json`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] })); } catch { continue; }
      if (!want(f)) continue;
      const read = (n) => execFileSync('git', ['show', `${ref}:heroes/${m}/${n}`], { cwd: ROOT, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
      try { sheetsOf(f).forEach((n) => read(n).length); } catch { log(`${g}: ${ref} heroes/${m} has its file but not all its sheets`); continue; }
      return { f, from: `${ref} heroes/${m}`, read };
    }
    break;
  }
  return null;
}

/** How many groups are baked at once, each in a browser of its own: one for each core, two at most (BAKE_JOBS to say). */
const JOBS = Math.max(1, Number(process.env.BAKE_JOBS) || Math.min(2, os.cpus().length));

/**
 * The bake of the heroes' art as it is now, made if it is not there yet. Its mark and its folder. `only`: just those groups
 * (for a look at a few on a page of their own, tools/bake_some.mjs): the bake is not marked done, and a whole bake of the same
 * art later keeps them and bakes the rest.
 *
 * EACH GROUP KEPT WHERE ITS HEROES' CODE HAS NOT CHANGED (14 Nov 2026, tools/bake_marks.mjs): every group's file carries its
 * `gmark`, the hash of the code its heroes are painted with; a group whose gmark is that of a group of an earlier bake (on this
 * machine in .bake/, or as published on gh-pages) is taken from it as it is, its sheets byte for byte, and not painted again.
 * FULL=1 paints every group. And TWO GROUPS AT ONCE where there are two cores (a group is painted on one), each in a browser
 * of its own.
 */
export async function bakeHeroes({ log = console.log, only = null } = {}) {
  const { code, mark } = await bakeCode();
  const dir = path.join(ROOT, '.bake', mark);
  if (fs.existsSync(path.join(dir, 'done.json'))) return { mark, dir, fresh: false };
  // (A BAKE CARRIED ON WHERE IT STOPPED, 12 Nov 2026: a group once baked is kept, its line of the record in .said-<group>.json
  // beside it, until the whole bake is done; a stopped bake (the machine restarted, the page gave out) bakes only the groups left.
  // And each group on a page of its own, closed once it is baked, so that what one held is all given back before the next.)
  fs.mkdirSync(dir, { recursive: true });
  const { chromium } = require('playwright');
  const browsers = [];
  const t0 = Date.now();
  const said = { mark, groups: {} };
  const saidOf = (g) => path.join(dir, `.said-${g}.json`);
  const open = async (browser) => {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ content: code });
    if (errors.length) throw new Error(errors.join('\n'));
    return page;
  };
  try {
    browsers.push(await chromium.launch());
    const first = await open(browsers[0]);
    const all = await first.evaluate(() => window.bake.groups());
    const names = await first.evaluate(() => window.bake.names());
    await first.close();
    const groups = only ? all.filter((g) => only.includes(g)) : all;
    if (only && groups.length !== only.length) throw new Error(`no such group: ${only.filter((g) => !all.includes(g)).join(', ')}`);
    const gmarks = await groupMarks(names);
    const todo = [];
    for (const g of groups) {
      if (fs.existsSync(saidOf(g))) {
        said.groups[g] = JSON.parse(fs.readFileSync(saidOf(g), 'utf8'));
        log(`baked ${g} already (kept from a bake that stopped)`);
        continue;
      }
      const kept = process.env.FULL === '1' ? null : keptGroup(g, gmarks[g], mark, log);
      if (kept) {
        const { f, from, read } = kept;
        let bytes = 0;
        const files = [...new Set([...f.sheets, ...(f.packs ?? []).map((p) => p.sheet)])];
        for (const n of files) {
          const b = read(n);
          fs.writeFileSync(path.join(dir, n), b);
          bytes += b.length;
        }
        fs.writeFileSync(path.join(dir, `${g}.json`), JSON.stringify({ ...f, mark }));
        said.groups[g] = { kept: from, gmark: gmarks[g], sheets: files.length, mb: +(bytes / 1e6).toFixed(2) };
        log(`kept ${g} from ${from}: its heroes' code as it was (${gmarks[g]})`);
        fs.writeFileSync(saidOf(g), JSON.stringify(said.groups[g]));
        continue;
      }
      todo.push(g);
    }
    const bakeOne = async (browser, g) => {
      const page = await open(browser);
      const info = await page.evaluate((name) => window.bake.group(name), g);
      if (info.dropped.length) throw new Error(`${g}: a frame has parts that cannot be kept (${info.dropped.join(', ')})`);
      const file = JSON.parse(await page.evaluate((name) => window.bake.file(name), g));
      const names = [];
      let bytes = 0;
      // (A HERO'S PACKS IN ONE FILE, 14 Nov 2026, the skins chat: the Brawler's and the Warlock's ~100 packs each a file of its own
      // had the bake some 200 files of the game's page's 511, and their unique weapons, each a set of him, would have been 700
      // more. So a group's packs go in ONE FILE, <group>-packs.png: each pack's PNG whole, one after another (a PNG by its first
      // bytes, as the page serves only the kinds of file it knows: tools/monster_packs.mjs), each pack's `sheet` that file and its
      // `off` and `len` where its bytes lie in it (render/baked.ts takePacks reads each from its own bytes, a part of the file).)
      const bundle = `${g}-packs.png`;
      const packBytes = [];
      let at = 0;
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
        if (pack) {
          pack.sheet = bundle;
          pack.off = at;
          pack.len = png.length;
          at += png.length;
          packBytes.push(png);
        } else {
          const name = `${g}-${n}.png`;
          fs.writeFileSync(path.join(dir, name), png);
          names.push(name);
        }
        bytes += png.length;
      }
      if (packBytes.length) {
        fs.writeFileSync(path.join(dir, bundle), Buffer.concat(packBytes));
        names.push(bundle);
      }
      await page.evaluate((name) => window.bake.drop(name), g);
      fs.writeFileSync(path.join(dir, `${g}.json`), JSON.stringify({ mark, gmark: gmarks[g], ...file, sheets: names.slice(0, info.held) }));
      said.groups[g] = { gmark: gmarks[g], frames: info.frames, places: info.places, sheets: names.length, mb: +(bytes / 1e6).toFixed(2), s: +(info.ms / 1000).toFixed(1) };
      if (info.packs) Object.assign(said.groups[g], { packs: info.packs, heldMb: +(info.heldBytes / 1048576).toFixed(1), packsMb: +(info.packBytes / 1048576).toFixed(1) });
      log(`baked ${g}: ${info.frames} frames for ${info.places} places, ${names.length} sheets, ${(bytes / 1e6).toFixed(2)} MB (${(info.ms / 1000).toFixed(1)} s to paint)${info.packs ? `; ${info.packs} packs: ${(info.heldBytes / 1048576).toFixed(1)} MB always held, ${(info.packBytes / 1048576).toFixed(1)} MB in packs, unpacked` : ''}`);
      fs.writeFileSync(saidOf(g), JSON.stringify(said.groups[g]));
      await page.close();
    };
    // (the groups left, two at a time where there are two cores: each in a browser of its own, so each paints on a core of its own)
    const jobs = Math.min(JOBS, todo.length);
    while (browsers.length < jobs) browsers.push(await chromium.launch());
    await Promise.all(browsers.slice(0, jobs).map(async (b) => {
      for (let g = todo.shift(); g !== undefined; g = todo.shift()) await bakeOne(b, g);
    }));
  } finally {
    for (const b of browsers) await b.close();
  }
  if (only) return { mark, dir, fresh: true };
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
