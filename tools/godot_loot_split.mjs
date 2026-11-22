// THE GODOT PORT: THE ITEM TABLES SPLIT SO THAT ONLY WHAT IS WANTED IS HELD (godot/scripts/loot.gd). Asked 22 Nov 2026 after the
// web game's crashes on his phone on the later floors (“Will this be a problem in godot?”): items.json as tools/godot_loot.ts
// writes it is 40 MB of text, and Godot held 687 MB once it was read, the most of all it holds from the start. So, run after
// tools/godot_loot.ts (it reads items.json as that wrote it, and writes it again without what is moved out):
//   imbue.json                    WHAT A WORD BECOMES ON A PIECE (`imbue`): every option the game has is written once, as a line of
//                                 JSON text in `opts`, and for each word and piece
//                                 (`slot:ilvl`) the options' numbers (`of`): 12,208 lists of 4,422 options where the options were
//                                 written out again in each. Godot reads an option only when it is asked for (burn_options).
//   depth/<d>.json                THE PIECES ROLLED ON FLOOR d (`byDepth`): read for the floor his drops come from, and let go of
//                                 with the next.
//   gamble/<d>.json               THE STRANGER'S THROWS AT FLOOR d (`gamble.pieces`): read when he throws; `gamble.kinds` and
//                                 `gamble.price` stay in items.json.
//   node tools/godot_loot_split.mjs
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'godot/assets/loot';
const data = JSON.parse(readFileSync(join(DIR, 'items.json'), 'utf8'));
if (!data.imbue && !data.byDepth) {
  console.log('items.json is split already: run tools/godot_loot.ts first to write it whole');
  process.exit(0);
}
// IMBUE
const opts = [];
const optAt = new Map();
const of = {};
for (const [w, byKey] of Object.entries(data.imbue)) {
  of[w] = {};
  for (const [key, list] of Object.entries(byKey)) {
    of[w][key] = list.map((o) => {
      const s = JSON.stringify(o);
      if (!optAt.has(s)) {
        optAt.set(s, opts.length);
        opts.push(s);
      }
      return optAt.get(s);
    });
  }
}
// (each option kept as its own line of text in `opts`, read into a thing only when asked for: a file Godot packs into the app,
// as it would not a .bin)
rmSync(join(DIR, 'imbue_opts.bin'), { force: true });
writeFileSync(join(DIR, 'imbue.json'), JSON.stringify({ opts, of }));
const off = opts.reduce((n, o) => n + o.length, 0);
// THE PIECES OF EACH FLOOR, AND THE STRANGER'S
for (const d of ['depth', 'gamble']) {
  rmSync(join(DIR, d), { recursive: true, force: true });
  mkdirSync(join(DIR, d), { recursive: true });
}
for (const [d, pools] of Object.entries(data.byDepth ?? {})) writeFileSync(join(DIR, 'depth', `${d}.json`), JSON.stringify(pools));
for (const [d, pieces] of Object.entries(data.gamble?.pieces ?? {})) writeFileSync(join(DIR, 'gamble', `${d}.json`), JSON.stringify(pieces));
const depths = Object.keys(data.byDepth ?? {});
delete data.imbue;
delete data.byDepth;
if (data.gamble) delete data.gamble.pieces;
data.split = { depths };
writeFileSync(join(DIR, 'items.json'), JSON.stringify(data));
console.log(`items.json split: ${opts.length} imbue options (${(off / 1048576).toFixed(1)} MB), ${Object.values(of).reduce((n, k) => n + Object.keys(k).length, 0)} lists of them; ${depths.length} floors' pieces; ${Object.keys(JSON.parse(JSON.stringify(of))).length} words; items.json now ${(readFileSync(join(DIR, 'items.json')).length / 1048576).toFixed(1)} MB`);
