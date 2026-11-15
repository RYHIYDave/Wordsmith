// EACH GROUP OF THE HEROES' BAKE MARKED BY THE CODE ITS HEROES ARE PAINTED WITH (tools/bake_heroes.mjs): so that a bake keeps
// every group whose heroes' code has not changed since it was last baked, and paints only the rest. Told him, 14 Nov 2026, as
// the other heroes' unique weapons were begun (each weapon a whole group of its own, about 14 minutes to bake): “before the
// weapons, I'll make the bake redo only the hero whose pictures changed”.
//
// HOW: the bake page's bundle (src/dev/bake_heroes_page.ts) is asked for its import graph (esbuild's metafile). Each hero's own
// art begins at his ROOTS below. SHARED is every file the page reaches without going in at a hero's root by way of
// art/heroes3.ts (the one place that hands each hero his art); a hero's files are every file reached from his roots. A group's
// mark is a hash of the contents of the shared files and of the files of every hero in it, the switches the build bundles with,
// and the group's places. A file one hero's art takes from another's (the Ranger's, the Mage's and the Warlock's bodies are
// made on the Warrior's, art/warrior_up.ts) is that hero's too: a change there marks all of them anew. A change to anything
// shared marks every group anew, as before.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, load } from './lib.mjs';

/** Where each hero's own art begins: what art/heroes3.ts takes from each. */
export const HERO_ROOTS = {
  warrior: ['src/art/hero3_knight.ts', 'src/art/warrior_up.ts', 'src/art/warrior_up_art.ts', 'src/art/warrior_up_heavy_art.ts', 'src/art/sword_skins.ts', 'src/art/heavy_skins.ts'],
  ranger: ['src/art/hero3_ranger.ts', 'src/art/ranger_up.ts', 'src/art/ranger_up_art.ts', 'src/art/bow_skins.ts'],
  mage: ['src/art/hero3_mage.ts', 'src/art/mage_up.ts', 'src/art/mage_up_art.ts', 'src/art/staff_skins.ts'],
  warlock: ['src/art/warlock_art.ts', 'src/art/tome_skins.ts'],
  tinkerer: ['src/art/tinkerer_art.ts', 'src/art/wrench_skins.ts'],
  brawler: ['src/art/brawler_art.ts', 'src/art/veteran_art.ts', 'src/art/wrap_skins.ts'],
};
/** The one file that hands each hero his art: its imports of the roots are where a hero's own art begins. */
const HANDS = 'src/art/heroes3.ts';
/** Changed when the bake's own way of laying out or writing a group changes, so that no group of the old way is kept. */
const BAKE_FORMAT = 'groups-1';

/** The bake page's files: the shared ones, and each hero's. */
export async function bakeGraph() {
  const esbuild = load('esbuild');
  const r = await esbuild.build({
    entryPoints: ['src/dev/bake_heroes_page.ts'],
    absWorkingDir: ROOT,
    bundle: true,
    format: 'iife',
    target: 'es2020',
    write: false,
    metafile: true,
    logLevel: 'error',
    define: RELEASE_DEFINES,
  });
  const ins = r.metafile.inputs;
  for (const roots of Object.values(HERO_ROOTS)) for (const f of roots) if (!ins[f]) throw new Error(`bake_marks: ${f} is not in the bake page any more: tell HERO_ROOTS`);
  const rootSet = new Set(Object.values(HERO_ROOTS).flat());
  const reach = (starts, cut) => {
    const seen = new Set();
    const todo = [...starts];
    while (todo.length) {
      const f = todo.pop();
      if (seen.has(f) || !ins[f]) continue;
      seen.add(f);
      for (const i of ins[f].imports) if (!cut(f, i.path)) todo.push(i.path);
    }
    return seen;
  };
  const shared = reach(['src/dev/bake_heroes_page.ts'], (from, to) => from === HANDS && rootSet.has(to));
  const heroes = Object.fromEntries(Object.entries(HERO_ROOTS).map(([cls, roots]) => [cls, reach(roots, () => false)]));
  return { shared, heroes, all: Object.keys(ins) };
}

/** Each group's mark (`names`: each group's places, as the bake page names them, `cls:place[:vet]`). */
export async function groupMarks(names) {
  const { shared, heroes } = await bakeGraph();
  const text = new Map();
  const read = (f) => {
    if (!text.has(f)) text.set(f, fs.readFileSync(path.join(ROOT, f)));
    return text.get(f);
  };
  const out = {};
  for (const [g, keys] of Object.entries(names)) {
    const classes = [...new Set(keys.map((k) => k.split(':')[0]))].sort();
    const files = new Set(shared);
    for (const c of classes) {
      if (!heroes[c]) throw new Error(`bake_marks: no roots for ${c} (group ${g}): tell HERO_ROOTS`);
      for (const f of heroes[c]) files.add(f);
    }
    const h = createHash('sha256');
    h.update(`${BAKE_FORMAT}\0${JSON.stringify(RELEASE_DEFINES)}\0${g}\0${keys.join(',')}\0`);
    for (const f of [...files].sort()) {
      h.update(`${f}\0`);
      h.update(read(f));
      h.update('\0');
    }
    out[g] = h.digest('hex').slice(0, 12);
  }
  return out;
}
