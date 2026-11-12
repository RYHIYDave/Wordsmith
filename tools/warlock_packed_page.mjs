// THE WARLOCK KEPT IN PACKS: HIS BAKE AND A PAGE OF THE GAME WITH IT (the queue's finish-mage-and-warlock-eight-sides, 12 Nov 2026,
// at his word: “Why don’t you pack him away?”). As tools/warlock_up_page.mjs makes a page with art/warlock_up.ts WARLOCK_UP and
// art/shadow_art.ts LIVING_SHADOW turned as asked (the source not touched), and as tools/bake_heroes.mjs bakes the heroes: THE
// WARLOCK'S GROUP ONLY is baked here (the bake's page with the same switches), his moves kept packed (render/baked.ts
// warlockPacksOf), into .bake/<mark>/; the page is made knowing that mark, and the bake is put beside it as the game's own are
// (heroes/<mark>/). The other heroes' groups are not baked: the page paints them in play, as a page with no bake does.
//   node tools/warlock_packed_page.mjs [dist/warlock_packed] [on|off]     (on: the Warlock brought up; off: as he is now)
// Serve the folder (node tools/playtest.mjs --serve --file dist/warlock_packed/index.html ...).
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, load, page } from './lib.mjs';
import { encodePng } from './png.mjs';
import { shipColossus } from './colossus_ship.mjs';

const require = createRequire(import.meta.url);
const [outDir = 'dist/warlock_packed', on = 'on'] = process.argv.slice(2);
const want = on !== 'off';
const GROUPS = (process.env.GROUPS || 'warlock').split(',');
const esbuild = load('esbuild');
const SWITCHES = [
  { file: /src[\\/]art[\\/]warlock_up\.ts$/, was: /export const WARLOCK_UP = \{ on: (true|false) \};/, now: `export const WARLOCK_UP = { on: ${want} };` },
  { file: /src[\\/]art[\\/]shadow_art\.ts$/, was: /export const LIVING_SHADOW = \{ on: (true|false) \};/, now: 'export const LIVING_SHADOW = { on: true };' },
];
const turn = {
  name: 'warlock-switches',
  setup(build) {
    for (const s of SWITCHES) {
      build.onLoad({ filter: s.file }, (args) => {
        const text = fs.readFileSync(args.path, 'utf8');
        if (!s.was.test(text)) throw new Error(`${args.path}: the switch is not where it was`);
        return { contents: text.replace(s.was, s.now), loader: 'ts' };
      });
    }
  },
};
const make = async (entry, define) =>
  (await esbuild.build({ entryPoints: [path.resolve(ROOT, entry)], bundle: true, format: 'iife', target: 'es2020', write: false, minify: false, legalComments: 'none', logLevel: 'error', define, plugins: [turn] })).outputFiles[0].text;

// ---- THE BAKE: his group only, as tools/bake_heroes.mjs bakes each group
const code = await make('src/dev/bake_heroes_page.ts', RELEASE_DEFINES);
const mark = createHash('sha256').update(code).digest('hex').slice(0, 12);
const bakeDir = path.join(ROOT, '.bake', mark);
if (!fs.existsSync(path.join(bakeDir, 'done.json'))) {
  fs.rmSync(bakeDir, { recursive: true, force: true });
  fs.mkdirSync(bakeDir, { recursive: true });
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const t0 = Date.now();
  const said = { mark, groups: {}, only: GROUPS };
  try {
    const pg = await browser.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(e.message));
    await pg.setContent('<!doctype html><html><body></body></html>');
    await pg.addScriptTag({ content: code });
    if (errors.length) throw new Error(errors.join('\n'));
    for (const g of GROUPS) {
      const info = await pg.evaluate((name) => window.bake.group(name), g);
      if (info.dropped.length) throw new Error(`${g}: a frame has parts that cannot be kept (${info.dropped.join(', ')})`);
      const file = JSON.parse(await pg.evaluate((name) => window.bake.file(name), g));
      const names = [];
      let bytes = 0;
      for (let n = 0; n < info.sheets.length; n++) {
        const { w, h } = info.sheets[n];
        const rgba = Buffer.from(await pg.evaluate(([name, k]) => window.bake.sheet(name, k), [g, n]), 'base64');
        if (rgba.length !== w * h * 4) throw new Error(`${g} sheet ${n}: ${rgba.length} bytes, want ${w * h * 4}`);
        const png = encodePng(w, h, rgba);
        const ck = await pg.evaluate(([name, k, b]) => window.bake.check(name, k, b), [g, n, png.toString('base64')]);
        if (ck.differ) throw new Error(`${g} sheet ${n}: ${ck.differ} pixels of its ${ck.frames} frames are not as painted (by ${ck.most} at most)`);
        const pack = n >= info.held ? file.packs[n - info.held] : null;
        const name = pack ? `${g}-${pack.name.replace(/[^a-zA-Z0-9]+/g, '-')}.png` : `${g}-${n}.png`;
        if (names.includes(name)) throw new Error(`${g}: two sheets named ${name}`);
        fs.writeFileSync(path.join(bakeDir, name), png);
        names.push(name);
        if (pack) pack.sheet = name;
        bytes += png.length;
      }
      await pg.evaluate((name) => window.bake.drop(name), g);
      fs.writeFileSync(path.join(bakeDir, `${g}.json`), JSON.stringify({ mark, ...file, sheets: names.slice(0, info.held) }));
      said.groups[g] = { frames: info.frames, places: info.places, sheets: names.length, mb: +(bytes / 1e6).toFixed(2), s: +(info.ms / 1000).toFixed(1), packs: info.packs ?? 0, heldMb: +((info.heldBytes ?? 0) / 1048576).toFixed(1), packsMb: +((info.packBytes ?? 0) / 1048576).toFixed(1) };
      console.log(`baked ${g}: ${info.frames} frames for ${info.places} places, ${names.length} sheets, ${(bytes / 1e6).toFixed(2)} MB as files (${(info.ms / 1000).toFixed(1)} s to paint)${info.packs ? `; ${info.packs} packs: ${(info.heldBytes / 1048576).toFixed(1)} MB always held, ${(info.packBytes / 1048576).toFixed(1)} MB in packs, unpacked` : ''}`);
    }
  } finally {
    await browser.close();
  }
  said.s = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(bakeDir, 'done.json'), JSON.stringify(said, null, 1));
} else console.log(`already baked: ${mark}`, fs.readFileSync(path.join(bakeDir, 'done.json'), 'utf8'));

// ---- THE PAGE, knowing the mark, the bake beside it
const colossus = shipColossus();
const stamp = `UNRELEASED warlock packed ${want ? 'on' : 'off'} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await make('src/main.ts', { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __COLOSSUS_BAKE__: JSON.stringify(colossus.mark), __HERO_BAKE__: JSON.stringify(mark) });
const out = path.resolve(ROOT, outDir);
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'heroes', mark), { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), page(js));
for (const f of fs.readdirSync(bakeDir)) if (f !== 'done.json') fs.copyFileSync(path.join(bakeDir, f), path.join(out, 'heroes', mark, f));
console.log(`made ${outDir}/index.html (WARLOCK_UP ${want ? 'on' : 'off'}, LIVING_SHADOW on), heroes/${mark}/ beside it: ${fs.readdirSync(path.join(out, 'heroes', mark)).length} files`);
