// THE GODOT PORT: MONSTER FIGURES BAKED FOR GODOT THAT THE RELEASE DOES NOT BAKE. The release's bake (tools/bake_monsters.mjs) holds
// the figures render/monsters_bake_list.ts names; a few of the High City's other looks are not among them and the game paints them
// beside itself a frame at a time (the palace guard's partisan thrown, his sword drawn: pguard:2, pguard:3). Godot has no painter
// of its own, so they are baked here by the same page and the same steps (bake_monsters.mjs bakeFigure, line for line), straight
// into godot/assets/monsters as the unpacked release's are: <name>.json and <name>-<n>.png. tools/godot_monster_lists.ts then
// writes their lists' names.
//   node tools/godot_bake_figures.mjs pguard:2,pguard:3 [folder]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, load } from './lib.mjs';
import { encodePng } from './png.mjs';
import { monsterBakeCode } from './bake_monsters.mjs';

const want = (process.argv[2] ?? '').split(',').filter(Boolean);
const dir = path.resolve(ROOT, process.argv[3] ?? 'godot/assets/monsters');
if (!want.length) {
  console.error('which figures? e.g. pguard:2,pguard:3');
  process.exit(1);
}
const bakeName = (figure) => figure.replace(':', '_');
const { code, mark } = await monsterBakeCode();
const { chromium } = load('playwright');
const browser = await chromium.launch();
try {
  for (const figure of want) {
    const page = await browser.newPage();
    try {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.setContent('<!doctype html><html><body></body></html>');
      await page.addScriptTag({ content: code });
      const info = await page.evaluate((f) => window.bakeMob.figure(f), figure);
      if (errors.length) throw new Error(errors.join('\n'));
      if (info.dropped.length) throw new Error(`${figure}: a frame has parts that cannot be kept (${info.dropped.join(', ')})`);
      const file = JSON.parse(await page.evaluate(() => window.bakeMob.file()));
      const name = bakeName(figure);
      const names = [];
      for (let n = 0; n < info.sheets.length; n++) {
        const { w, h } = info.sheets[n];
        const rgba = Buffer.from(await page.evaluate((k) => window.bakeMob.sheet(k), n), 'base64');
        if (rgba.length !== w * h * 4) throw new Error(`${figure} sheet ${n}: ${rgba.length} bytes, want ${w * h * 4}`);
        const png = encodePng(w, h, rgba);
        const ck = await page.evaluate(([k, b]) => window.bakeMob.check(k, b), [n, png.toString('base64')]);
        if (ck.differ) throw new Error(`${figure} sheet ${n}: ${ck.differ} pixels of its ${ck.frames} frames are not as painted`);
        const sheet = `${name}-${n}.png`;
        fs.writeFileSync(path.join(dir, sheet), png);
        names.push(sheet);
      }
      fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify({ mark, figure, ...file, sheets: names }));
      console.log(`baked ${figure}: ${info.frames} frames for ${info.places} places, ${names.length} sheets (${(info.ms / 1000).toFixed(1)} s)`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
