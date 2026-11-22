// THE GODOT PORT: THE RANGER'S COMPANIONS' PICTURES (art/companions_art.ts makeCompanionArt, the art chat's, his yes to all six by
// 30 Oct 2026), baked for Godot by THE GAME'S OWN MONSTER BAKER (src/dev/bake_monsters_page.ts, its painting, its layout and its
// check, read from it as it is and handed the companions' art in place of the bestiary's): the six as the game draws them
// (render/render.ts drawPets: from in front or behind, standing, going, biting).
//   godot/assets/companions/<kind>.json + <kind>-<n>.png   as the floors' monsters are (godot/scripts/baked_figure.gd reads them)
//   godot/assets/companions/companions.json  { lists: { kind: { lists: [{name, fps, n}] } }, stride: { kind }, shadow: { kind },
//     tune: COMPANION_TUNE, info: COMPANION_INFO, groups: COMPANION_GROUPS, rally: SWAP_TUNE.rally, mark: PRECISE.markTime,
//     guard: GUARD.shieldTime }
//   node tools/godot_companions.mjs   (from the repository's root; needs the Playwright the playtests use)
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, load, RELEASE_DEFINES } from './lib.mjs';
import { encodePng } from './png.mjs';

const OUT = path.join(ROOT, 'godot/assets/companions');
fs.mkdirSync(OUT, { recursive: true });
const KINDS = ['hawk', 'snake', 'wolf', 'bat', 'fox', 'tortoise'];
const pageSrc = fs.readFileSync(path.join(ROOT, 'src/dev/bake_monsters_page.ts'), 'utf8');
const from = 'const art = bestiary.of(name);';
if (!pageSrc.includes(from)) throw new Error('the bake page no longer takes its art as it did: look at src/dev/bake_monsters_page.ts');
const contents = `import { makeCompanionArt, COMP_SHADOW } from '../art/companions_art';
import { strideOf } from '../art/companions_art_moves';
import { COMPANION_TUNE, COMPANION_INFO, COMPANION_GROUPS } from '../game/companions';
import { SWAP_TUNE } from '../game/swap_moves';
import { PRECISE, GUARD } from '../game/defs';
${pageSrc.replace(from, 'const art = makeCompanionArt(name as never);')}
(window as unknown as Record<string, unknown>).compInfo = () => {
  const lists: Record<string, unknown> = {};
  const stride: Record<string, number> = {};
  for (const k of ${JSON.stringify(KINDS)}) {
    const set = makeCompanionArt(k as never).front as unknown as { idle: unknown[]; walk: unknown[]; idleFps?: number; walkFps?: number; clips?: Record<string, { fps: number; frames: unknown[] } | undefined> & { moves?: Record<string, { fps: number; frames: unknown[] }> } };
    const out = [{ name: 'idle', fps: set.idleFps ?? 15, n: set.idle.length }, { name: 'walk', fps: set.walkFps ?? 8, n: set.walk.length }];
    const c = set.clips;
    if (c) {
      for (const n of ['attack', 'heavy', 'die', 'reel']) {
        const clip = c[n];
        if (clip) out.push({ name: n, fps: clip.fps, n: clip.frames.length });
      }
      for (const [n, clip] of Object.entries(c.moves ?? {})) out.push({ name: n, fps: clip.fps, n: clip.frames.length });
    }
    lists[k] = { lists: out };
    stride[k] = strideOf(k as never);
  }
  return JSON.stringify({ lists, stride, shadow: COMP_SHADOW, tune: COMPANION_TUNE, info: COMPANION_INFO, groups: COMPANION_GROUPS, rally: SWAP_TUNE.rally, mark: PRECISE.markTime, guard: GUARD.shieldTime });
};
`;
const esbuild = load('esbuild');
const built = await esbuild.build({ stdin: { contents, resolveDir: path.join(ROOT, 'src/dev'), loader: 'ts', sourcefile: 'godot_companions_page.ts' }, bundle: true, format: 'iife', target: 'es2020', write: false, logLevel: 'warning', define: RELEASE_DEFINES });
const code = built.outputFiles[0].text;
const { chromium } = load('playwright');
const browser = await chromium.launch();
try {
  let info = null;
  for (const kind of KINDS) {
    const page = await browser.newPage();
    try {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.setContent('<!doctype html><html><body></body></html>');
      await page.addScriptTag({ content: code });
      if (!info) info = JSON.parse(await page.evaluate(() => window.compInfo()));
      const made = await page.evaluate((f) => window.bakeMob.figure(f), kind);
      if (errors.length) throw new Error(errors.join('\n'));
      if (made.dropped.length) throw new Error(`${kind}: a frame has parts that cannot be kept (${made.dropped.join(', ')})`);
      const file = JSON.parse(await page.evaluate(() => window.bakeMob.file()));
      const names = [];
      for (let n = 0; n < made.sheets.length; n++) {
        const { w, h } = made.sheets[n];
        const rgba = Buffer.from(await page.evaluate((k) => window.bakeMob.sheet(k), n), 'base64');
        if (rgba.length !== w * h * 4) throw new Error(`${kind} sheet ${n}: ${rgba.length} bytes, want ${w * h * 4}`);
        const png = encodePng(w, h, rgba);
        const ck = await page.evaluate(([k, b]) => window.bakeMob.check(k, b), [n, png.toString('base64')]);
        if (ck.differ) throw new Error(`${kind} sheet ${n}: ${ck.differ} pixels of its ${ck.frames} frames are not as painted`);
        const sheet = `${kind}-${n}.png`;
        fs.writeFileSync(path.join(OUT, sheet), png);
        names.push(sheet);
      }
      fs.writeFileSync(path.join(OUT, `${kind}.json`), JSON.stringify({ figure: kind, ...file, sheets: names }));
      console.log(`baked ${kind}: ${made.frames} frames for ${made.places} places, ${names.length} sheets`);
    } finally {
      await page.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'companions.json'), JSON.stringify(info) + '\n');
} finally {
  await browser.close();
}
