// THE GODOT PORT: THE MOTH'S PICTURES (floor 20's boss), baked a move at a time (tools/godot_moth/page.ts says why), straight
// into godot/assets/monsters as the other figures are: moth.json and moth-<n>.png, and `groups` in moth.json: for each side and
// list, the sheets that hold its frames (Godot takes in only the sheets of the moves it is playing: scripts/baked_figure.gd).
//   node tools/godot_bake_moth.mjs [figure] [folder]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, bundle, load, RELEASE_DEFINES } from './lib.mjs';
import { encodePng } from './png.mjs';

const figure = process.argv[2] ?? 'moth';
const dir = path.resolve(ROOT, process.argv[3] ?? 'godot/assets/monsters');
const code = await bundle('tools/godot_moth/page.ts', { define: RELEASE_DEFINES });
const { chromium } = load('playwright');
const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=6144'] });
const name = figure.replace(':', '_');
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: code });
  const info = await page.evaluate((f) => window.bakeMoth.open(f), figure);
  if (errors.length) throw new Error(errors.join('\n'));
  const names = [];
  const groups = {};
  let bytes = 0;
  const t0 = Date.now();
  for (let v = 0; v < info.sides; v++) {
    for (let l = 0; l < info.lens[v].length; l++) {
      const g = await page.evaluate(([a, b]) => window.bakeMoth.group(a, b), [v, l]);
      if (errors.length) throw new Error(errors.join('\n'));
      const mine = [];
      for (let n = 0; n < g.sheets.length; n++) {
        const { w, h } = g.sheets[n];
        const rgba = Buffer.from(await page.evaluate((k) => window.bakeMoth.sheet(k), n), 'base64');
        if (rgba.length !== w * h * 4) throw new Error(`group ${v}:${l} sheet ${n}: ${rgba.length} bytes, want ${w * h * 4}`);
        const png = encodePng(w, h, rgba);
        const sheet = `${name}-${names.length}.png`;
        fs.writeFileSync(path.join(dir, sheet), png);
        mine.push(names.length);
        names.push(sheet);
        bytes += png.length;
      }
      groups[`${v}:${l}`] = mine;
      console.log(`side ${v} list ${l}: ${g.frames} frames, ${g.fresh} new, ${g.sheets.length} sheets; ${(bytes / 1048576).toFixed(1)} MB so far (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  }
  const file = JSON.parse(await page.evaluate(() => window.bakeMoth.file()));
  // (a frame the same as one of an earlier group's lies on that group's sheet: each group's sheets are all those its frames lie on)
  for (const key of Object.keys(groups)) {
    const [v, l] = key.split(':').map(Number);
    const set = new Set(groups[key]);
    for (let i = 0; i < file.at.length; i += 4) if (file.at[i] === v && file.at[i + 1] === l) set.add(file.frames[file.at[i + 3]][0]);
    groups[key] = [...set].sort((a, b) => a - b);
  }
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify({ mark: 'godot', figure, ...file, sheets: names, groups }));
  console.log(`baked ${figure}: ${file.frames.length} frames, ${names.length} sheets, ${(bytes / 1048576).toFixed(1)} MB of PNG`);
} finally {
  await browser.close();
}
