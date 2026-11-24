// Builds rune_bag.html, the mock-up page, from mock.ts and the data beside it.
//   node docs/mockups/rune_bag/build.mjs        (from the repository's root, with `npm install` done)
// data/runes.json and data/pics.json are made by prep.py and prep2.py from the Godot project's own files
// (godot/assets/words/words.json, melds52.json and .png, assets/loot/icons.*, assets/hud/hud.*).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const r = await build({ entryPoints: [path.join(here, 'mock.ts')], bundle: true, write: false, format: 'iife', target: 'es2020', minify: true,
  alias: { '@game': path.join(root, 'src') }, logLevel: 'warning' });
const js = r.outputFiles[0].text;
const data = fs.readFileSync(path.join(here, 'data/runes.json'), 'utf8');
const pics = fs.readFileSync(path.join(here, 'data/pics.json'), 'utf8');
const shell = fs.readFileSync(path.join(here, 'shell.html'), 'utf8');
fs.writeFileSync(path.join(here, 'rune_bag.html'), shell + `\n<script>const RUNE_DATA=${data};const PICS=${pics};</script>\n<script>${js.replace(/<\/script/g, '<\\/script')}</script>\n`);
console.log('wrote rune_bag.html');
