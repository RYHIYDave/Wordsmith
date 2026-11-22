// EACH GROUP OF THE HEROES' BAKE MARKED BY THE CODE ITS HEROES ARE PAINTED WITH (tools/bake_marks.mjs), so that a bake keeps a
// group whose heroes' code has not changed (tools/bake_heroes.mjs keptGroup):
//   1. every hero's roots are in the bake page, and every file of it is shared or some hero's;
//   2. a change to a file of one hero's own marks his groups anew (and the cards', which show every hero), and no other's;
//      a change to a file shared marks every group anew; a change to the Warrior's body, which the Ranger's, the Mage's and the
//      Warlock's are made on, marks theirs too; the same code, the same marks;
//   3. the bake's groups need not take the staves' art in: render/baked.ts reads the staves' switch from art/heroes.ts.
// (A file is changed by a comment put at its end and taken off again.)
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, writeFileSync } from 'node:fs';
// @ts-ignore
import { HERO_ROOTS, bakeGraph, groupMarks } from '../tools/bake_marks.mjs';

const NAMES: Record<string, string[]> = {
  warrior: ['warrior:town', 'warrior:dungeon'],
  ranger: ['ranger:town', 'ranger:dungeon'],
  mage: ['mage:town', 'mage:dungeon'],
  'mage-crook': ['mage:crookTown', 'mage:crook'],
  warlock: ['warlock:town', 'warlock:dungeon'],
  tinkerer: ['tinkerer:town', 'tinkerer:dungeon'],
  brawler: ['brawler:town:vet', 'brawler:dungeon:vet'],
  cards: ['warrior:card', 'ranger:card', 'mage:card', 'warlock:card', 'tinkerer:card', 'brawler:card:vet'],
};

/** The groups marked anew by a change to file `f`. */
async function anew(f: string): Promise<string[]> {
  const before = await groupMarks(NAMES);
  const was: string = readFileSync(f, 'utf8');
  writeFileSync(f, `${was}\n// (a change, for tests/bake_marks.test.ts)\n`);
  try {
    const after = await groupMarks(NAMES);
    return Object.keys(NAMES).filter((g) => before[g] !== after[g]);
  } finally {
    writeFileSync(f, was);
  }
}

test('1. every hero\'s roots are in the bake page, and every file of it is shared or some hero\'s', async () => {
  const g = await bakeGraph();
  for (const roots of Object.values(HERO_ROOTS) as string[][]) for (const r of roots) assert.ok(g.all.includes(r), r);
  const heroes = Object.values(g.heroes) as Set<string>[];
  for (const f of g.all) assert.ok(g.shared.has(f) || heroes.some((h) => h.has(f)), f);
});

test('2. a change to one hero\'s own file marks only his groups and the cards anew; a shared one, all; the same code, the same', async () => {
  assert.deepEqual(await anew('src/art/ranger_up_art.ts'), ['ranger', 'cards']);
  assert.deepEqual(await anew('src/art/tinkerer_art.ts'), ['tinkerer', 'cards']);
  assert.deepEqual(await anew('src/art/staff_skins.ts'), ['mage', 'mage-crook', 'cards']);
  assert.deepEqual(await anew('src/art/warrior_up.ts'), ['warrior', 'ranger', 'mage', 'mage-crook', 'warlock', 'cards']);
  assert.deepEqual(await anew('src/engine/px.ts'), Object.keys(NAMES));
  assert.deepEqual(await groupMarks(NAMES), await groupMarks(NAMES));
});

test('3. the bake\'s groups do not take the staves\' art in', () => {
  assert.ok(!/from '[^']*staff_skins'/.test(readFileSync('src/render/baked.ts', 'utf8')));
});
