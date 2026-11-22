// THE HEROES' PICTURES FOR THE GODOT VERSION: the released game's bake (tools/bake_heroes.mjs; render/baked.ts BakeFile), read
// straight from the published game (the gh-pages branch, heroes/<mark>/) into godot/assets/heroes, as scripts/baked_hero.gd reads
// it: each group's `<group>.json` and its sheets `<group>-N.png` as they are. A hero kept in packs (render/baked.ts PACKS: the
// Warlock, his demon, the Brawler, and each of their skins) has, since 25.3.22, all his packs in one file, `<group>-packs.png`, each
// pack's picture at `off` for `len` bytes; here each is cut out into a sheet of its own, `<group>-<move>-<side>.png`, as the bakes
// before had them, and its `sheet` named so. Every group of the bake comes over: since 25.3.22 the unique weapons' own pictures too
// (art/heroes.ts wornSkin: the Mage's staves, the Ranger's bows, the Tinkerer's wrenches, the Warrior's swords, axes and hammers, the
// Brawler's wraps, the Warlock's tomes and his demon a group of its own). The files of the bake before (godot/assets/MARKS.txt
// heroes=) that this one has not are taken away; this copy's own files (clips.json, the golem's, the moves' effects) are kept.
//   node tools/godot_heroes.mjs [mark]    (from the repository's root; the mark: the newest bake on gh-pages if not given)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'godot/assets/heroes';
const MARKS = 'godot/assets/MARKS.txt';
const git = (...a) => execFileSync('git', a, { maxBuffer: 1 << 30 });
const list = (mark) => git('ls-tree', '--name-only', 'origin/gh-pages', `heroes/${mark}/`).toString().trim().split('\n').map((p) => p.split('/').pop());

// (the newest bake: the one the published page names)
let mark = process.argv[2];
if (!mark) {
  const marks = git('ls-tree', '--name-only', 'origin/gh-pages', 'heroes/').toString().trim().split('\n').map((p) => p.split('/').pop());
  const page = git('show', 'origin/gh-pages:index.html').toString();
  mark = marks.find((m) => page.includes(m)) ?? marks[marks.length - 1];
}
const marksText = readFileSync(MARKS, 'utf8');
const before = /heroes=([0-9a-f]+)/.exec(marksText)?.[1];
const files = list(mark);
const made = new Set();
for (const f of files) {
  if (f.endsWith('-packs.png')) continue;
  if (f.endsWith('.json')) {
    const d = JSON.parse(git('show', `origin/gh-pages:heroes/${mark}/${f}`).toString());
    const packed = new Map();
    for (const pk of d.packs ?? []) {
      if (pk.off === undefined) continue;
      if (!packed.has(pk.sheet)) packed.set(pk.sheet, git('show', `origin/gh-pages:heroes/${mark}/${pk.sheet}`));
      const name = `${d.group}-${pk.name.replace(/:/g, '-')}.png`;
      writeFileSync(join(OUT, name), packed.get(pk.sheet).subarray(pk.off, pk.off + pk.len));
      made.add(name);
      pk.sheet = name;
      delete pk.off;
      delete pk.len;
    }
    writeFileSync(join(OUT, f), JSON.stringify(d));
  } else writeFileSync(join(OUT, f), git('show', `origin/gh-pages:heroes/${mark}/${f}`));
  made.add(f);
}
// (what the bake before had and this one has not)
let gone = 0;
if (before && before !== mark) {
  for (const f of list(before)) {
    if (made.has(f) || f.endsWith('-packs.png')) continue;
    for (const p of [join(OUT, f), join(OUT, `${f}.import`)]) if (existsSync(p)) rmSync(p);
    gone++;
  }
}
writeFileSync(MARKS, marksText.replace(/heroes=[0-9a-f]+/, `heroes=${mark}`));
console.log(`heroes ${mark}: ${made.size} files (${files.filter((f) => f.endsWith('.json')).length} groups); ${gone} of ${before} taken away`);
