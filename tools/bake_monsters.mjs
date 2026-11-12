// THE FLOORS' MONSTERS BAKED (render/monsters_baked.ts says why; the queue's make-floors-monsters-before-play, 11 Nov 2026):
// every figure the bestiary has pictures for, every frame painted once and laid on sheets, a group a figure, in the manner of
// the heroes' and the town's people's bakes (tools/bake_heroes.mjs, tools/bake_townsfolk.mjs).
//   node tools/bake_monsters.mjs              bakes them (what of this art is not baked already) and says where
//   node tools/bake_monsters.mjs --only a,b   those figures only (to try one; the bake is not marked done)
//   node tools/bake_monsters.mjs --jobs 1     one figure at a time (2 by default: one for each of two processors)
//   node tools/bake_monsters.mjs --table      what the kept bake of this art holds, figure by figure
//   node tools/bake_monsters.mjs --from <mark>   FOR THE ONE WHO KNOWS THE ART HAS NOT CHANGED since the kept bake of that mark
//                                             (only code beside it has): its figures are taken as this mark's, not painted
//                                             again. Never for a release: a release's bake is painted from its own code.
// The bake goes beside the game's page, in monsters/<mark>/ (tools/build.mjs, dist/monsters/): <figure>.json and its sheets.
// The bake's mark is taken from the code that paints them (src/dev/bake_monsters_page.ts, bundled as the game is): the same
// art, the same mark, and the bake is kept (in .bake/monsters/<mark>/) and not made again; the art changed, a new mark and a
// new bake. IT IS MADE A FIGURE AT A TIME, EACH IN A FRESH PAGE, AND KEPT AS IT GOES: stopped, it is run again and goes on
// where it stopped. The game is built knowing the mark (__MONSTER_BAKE__), and takes in only a bake of that mark.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, bundle, load } from './lib.mjs';
import { encodePng } from './png.mjs';

/** Where the bakes are kept, each in a folder named by its mark. */
const KEPT = path.join(ROOT, '.bake', 'monsters');

/** A figure's name as its files have it (render/monsters_baked.ts bakeName). */
const bakeName = (figure) => figure.replace(':', '_');

/** The mark of the monsters' art as it is now, and the code that bakes it. */
export async function monsterBakeCode() {
  const code = await bundle('src/dev/bake_monsters_page.ts', { define: RELEASE_DEFINES });
  const mark = createHash('sha256').update(code).digest('hex').slice(0, 12);
  return { code, mark };
}

/** Is the bake of the art as it is now made already? Its mark and its folder if so, or null. */
export async function monstersBaked() {
  const { mark } = await monsterBakeCode();
  const dir = path.join(KEPT, mark);
  return fs.existsSync(path.join(dir, 'done.json')) ? { mark, dir, fresh: false } : null;
}

/** One figure baked in a fresh page: its files written, what can be said of it. */
async function bakeFigure(browser, code, mark, dir, figure) {
  const page = await browser.newPage();
  try {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setContent('<!doctype html><html><body></body></html>');
    await page.addScriptTag({ content: code });
    if (errors.length) throw new Error(errors.join('\n'));
    const info = await page.evaluate((f) => window.bakeMob.figure(f), figure);
    if (errors.length) throw new Error(errors.join('\n'));
    if (info.dropped.length) throw new Error(`${figure}: a frame has parts that cannot be kept (${info.dropped.join(', ')})`);
    const file = JSON.parse(await page.evaluate(() => window.bakeMob.file()));
    const name = bakeName(figure);
    const names = [];
    let bytes = 0;
    for (let n = 0; n < info.sheets.length; n++) {
      const { w, h } = info.sheets[n];
      const b64 = await page.evaluate((k) => window.bakeMob.sheet(k), n);
      const rgba = Buffer.from(b64, 'base64');
      if (rgba.length !== w * h * 4) throw new Error(`${figure} sheet ${n}: ${rgba.length} bytes, want ${w * h * 4}`);
      const png = encodePng(w, h, rgba);
      // (the sheet as written, read back as the game reads it, against every frame on it as painted)
      const ck = await page.evaluate(([k, b]) => window.bakeMob.check(k, b), [n, png.toString('base64')]);
      if (ck.differ) throw new Error(`${figure} sheet ${n}: ${ck.differ} pixels of its ${ck.frames} frames are not as painted (by ${ck.most} at most)`);
      const sheet = `${name}-${n}.png`;
      fs.writeFileSync(path.join(dir, sheet), png);
      names.push(sheet);
      bytes += png.length;
    }
    // (its file last, and whole: a figure with its file is a figure done)
    const json = JSON.stringify({ mark, figure, ...file, sheets: names });
    fs.writeFileSync(path.join(dir, `${name}.json.part`), json);
    fs.renameSync(path.join(dir, `${name}.json.part`), path.join(dir, `${name}.json`));
    bytes += json.length;
    return { frames: info.frames, places: info.places, empty: info.empty, sheets: names.length, mb: +(bytes / 1e6).toFixed(2), heldMb: +((info.px * 4) / 1e6).toFixed(1), paintS: +(info.ms / 1000).toFixed(1), big: info.big };
  } finally {
    await page.close();
  }
}

/** The bake of the monsters' art as it is now, made if it is not there yet (what of it is not). Its mark and its folder. */
export async function bakeMonsters({ log = console.log, jobs = 2, only = null, from = null } = {}) {
  const { code, mark } = await monsterBakeCode();
  const dir = path.join(KEPT, mark);
  if (!only && fs.existsSync(path.join(dir, 'done.json'))) return { mark, dir, fresh: false };
  fs.mkdirSync(dir, { recursive: true });
  const { chromium } = load('playwright');
  const browser = await chromium.launch();
  const t0 = Date.now();
  const saidFile = path.join(dir, 'said.json');
  const said = fs.existsSync(saidFile) ? JSON.parse(fs.readFileSync(saidFile, 'utf8')) : {};
  try {
    const first = await browser.newPage();
    await first.setContent('<!doctype html><html><body></body></html>');
    await first.addScriptTag({ content: code });
    const all = await first.evaluate(() => window.bakeMob.figures());
    await first.close();
    const most = await first.evaluate(() => window.bakeMob.most()).catch(() => Infinity);
    for (const f of only ?? []) if (!all.includes(f)) throw new Error(`no figure ${f}`);
    // (--from: another mark's figures taken as this one's, where this one has them not: each file's mark written anew)
    if (from && from !== mark) {
      const old = path.join(KEPT, from);
      const oldSaid = JSON.parse(fs.readFileSync(path.join(old, 'said.json'), 'utf8'));
      let took = 0;
      for (const figure of all) {
        const name = bakeName(figure);
        if (said[figure] || !oldSaid[figure] || !fs.existsSync(path.join(old, `${name}.json`))) continue;
        const f = JSON.parse(fs.readFileSync(path.join(old, `${name}.json`), 'utf8'));
        for (const sh of f.sheets) fs.copyFileSync(path.join(old, sh), path.join(dir, sh));
        fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify({ ...f, mark }));
        said[figure] = oldSaid[figure];
        took++;
      }
      fs.writeFileSync(saidFile, JSON.stringify(said, null, 1));
      log(`${took} figures taken from the bake ${from} as they are (NOT painted again: the art is said to be the same)`);
    }
    // (one too big to hold whole stops the bake: it is to be named in render/monsters_baked.ts TOO_BIG, and left as it was)
    const tooBig = (f) => said[f] && said[f].heldMb > most;
    for (const f of all) if (tooBig(f)) throw new Error(`${f} is ${said[f].heldMb} MB in hand, over the ${most} MB a figure may be: name it in TOO_BIG (render/monsters_baked.ts)`);
    // (what is kept already is not made again: a figure with its file and its word in said.json)
    const todo = (only ?? all).filter((f) => only || !(said[f] && fs.existsSync(path.join(dir, `${bakeName(f)}.json`))));
    if (todo.length < (only ?? all).length) log(`${(only ?? all).length - todo.length} figures kept from before, ${todo.length} to bake`);
    let next = 0;
    let failed = null;
    const work = async () => {
      while (next < todo.length && !failed) {
        const figure = todo[next++];
        try {
          const r = await bakeFigure(browser, code, mark, dir, figure);
          said[figure] = r;
          fs.writeFileSync(saidFile, JSON.stringify(said, null, 1));
          if (r.heldMb > most) throw new Error(`${figure} is ${r.heldMb} MB in hand, over the ${most} MB a figure may be: name it in TOO_BIG (render/monsters_baked.ts)`);
          log(`baked ${figure}: ${r.frames} frames for ${r.places} places${r.empty ? ` (${r.empty} places with no picture)` : ''}, ${r.sheets} sheets, ${r.mb.toFixed(2)} MB (${r.paintS.toFixed(1)} s to paint; ${r.heldMb.toFixed(1)} MB as pictures in hand)`);
        } catch (e) {
          failed = e;
        }
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, jobs) }, work));
    if (failed) throw failed;
    if (!only) {
      const sum = (k) => all.reduce((n, f) => n + (said[f]?.[k] ?? 0), 0);
      const done = { mark, figures: all, frames: sum('frames'), places: sum('places'), sheets: sum('sheets'), mb: +sum('mb').toFixed(2), heldMb: +sum('heldMb').toFixed(1), paintS: +sum('paintS').toFixed(1), s: Math.round((Date.now() - t0) / 1000) };
      fs.writeFileSync(path.join(dir, 'done.json'), JSON.stringify(done, null, 1));
      log(`baked the monsters: ${all.length} figures, ${done.frames} frames for ${done.places} places, ${done.sheets} sheets, ${done.mb.toFixed(2)} MB (${done.paintS.toFixed(1)} s to paint; ${done.heldMb.toFixed(1)} MB as pictures in hand, were they all held at once)`);
    }
  } finally {
    await browser.close();
  }
  return { mark, dir, fresh: true };
}

/**
 * The files of a bake, and where each is (published beside the game's page as monsters/<mark>/<name>): each figure's file and
 * its sheets, of the figures the bake is of (done.json; a bake not yet done, or a try with --only: those baked so far).
 */
export function monsterBakeFiles(mark) {
  const dir = path.join(KEPT, mark);
  const read = (f) => (fs.existsSync(path.join(dir, f)) ? JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) : null);
  const figures = read('done.json')?.figures ?? Object.keys(read('said.json') ?? {});
  const out = [];
  for (const figure of figures) {
    const name = `${bakeName(figure)}.json`;
    const file = read(name);
    if (!file) continue;
    for (const f of [name, ...file.sheets]) out.push({ name: f, from: path.join(dir, f) });
  }
  return out.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/**
 * THE BAKE CARRIED BESIDE A PAGE (tools/build.mjs, tools/build_to.mjs): dist/monsters/<mark>/, the old ones gone. `make`: bake
 * it now if this art is not baked yet (many minutes); without it, only a bake already kept is carried. The mark ('' : none
 * carried; the page's monsters are then painted as it is played, as before) and the files.
 */
export async function shipMonsters({ make = true, log = console.log } = {}) {
  fs.rmSync(path.join(ROOT, 'dist', 'monsters'), { recursive: true, force: true });
  const bake = make ? await bakeMonsters({ log }) : await monstersBaked();
  if (!bake) return { mark: '', files: [] };
  const to = path.join(ROOT, 'dist', 'monsters', bake.mark);
  fs.mkdirSync(to, { recursive: true });
  const files = monsterBakeFiles(bake.mark);
  for (const f of files) fs.copyFileSync(f.from, path.join(to, f.name));
  return { mark: bake.mark, files: files.map((f) => f.name), fresh: bake.fresh };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
  if (process.argv.includes('--table')) {
    const { mark } = await monsterBakeCode();
    const f = path.join(KEPT, mark, 'said.json');
    if (!fs.existsSync(f)) console.log(`no bake of this art kept (${mark})`);
    else {
      const said = JSON.parse(fs.readFileSync(f, 'utf8'));
      console.log(`figure            frames  places  sheets     MB  in hand MB  paint s  biggest`);
      for (const [k, r] of Object.entries(said)) console.log(`${k.padEnd(16)} ${String(r.frames).padStart(7)} ${String(r.places).padStart(7)} ${String(r.sheets).padStart(7)} ${r.mb.toFixed(2).padStart(6)} ${r.heldMb.toFixed(1).padStart(11)} ${r.paintS.toFixed(1).padStart(8)}  ${r.big.join('x')}`);
    }
  } else {
    const only = arg('--only');
    const r = await bakeMonsters({ jobs: Number(arg('--jobs') ?? 2), only: only ? only.split(',') : null, from: arg('--from') });
    const all = monsterBakeFiles(r.mark);
    const mb = all.reduce((n, f) => n + fs.statSync(f.from).size, 0) / 1e6;
    console.log(`${r.fresh ? 'baked' : 'already baked'}: ${r.mark}, ${all.length} files, ${mb.toFixed(2)} MB, in ${r.dir}`);
  }
}
