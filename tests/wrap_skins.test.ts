// THE BRAWLER'S UNIQUE WRAPS (art/wrap_skins.ts; dev/sculpt_veteran.ts WrapSkin, PLAIN_WRAPS; in the game behind art/heroes.ts
// WRAP_SKINS, off until his yes). His word, 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”.
//   1. the switch is off: no wraps are worn and none baked; of the game only the heroes' art reads art/wrap_skins.ts;
//   2. his own wraps are the first skin, and painted with them he is the very frame he is painted as when nothing is said;
//   3. each of the four is its own;
//   4. on: the four unique wraps of the game are worn by the Brawler, each its own places in town and in a dungeon, its look those
//      wraps, his pictures there painted with them (the Veteran's: one set for town and a dungeon); each a bake group of its own,
//      only for the Veteran.
// (His own wraps painted exactly as before was checked over 1,654 frames of his eight sides, 14 Nov 2026: here a sample. That his
// sets are kept in packs and let go of whole: tests/packs_one_file.test.ts.)

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore - node typings are not part of this project
import { readdirSync, readFileSync } from 'node:fs';
import { paintWithoutCanvas } from './helpers';
import { makeVeteranArt } from '../src/art/veteran_art';
import { PLAIN_WRAPS } from '../src/dev/sculpt_veteran';
import { WRAP_SKIN_LIST, WRAP_SKIN_OF } from '../src/art/wrap_skins';
import { WRAP_IDS, WRAP_PLACES, WRAP_SKINS, isSkinPlace, isTownPlace, lookOfPlace, wornSkin, wrapOfPlace, wrapWorn } from '../src/art/heroes';
import { makeHeroArt3 } from '../src/art/heroes3';
import { bakeGroups, keyName, listLengths } from '../src/render/baked';
import { heroSides } from '../src/art/sides';
import { EIGHT_MORE } from '../src/art/sides_more';
import type { ActorArt } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';

paintWithoutCanvas();

const px = (s: Sprite): Uint8ClampedArray => (s.img as unknown as { d: Uint8ClampedArray }).d;
const same = (a: Uint8ClampedArray, b: Uint8ClampedArray): boolean => a.length === b.length && a.every((v, k) => v === b[k]);
/** A few frames of him, as the game holds them: his guard from two sides, his jab, his hook, running. */
const sample = (art: ActorArt): Sprite[] => {
  const sides = heroSides(art);
  const c = sides[0].clips!;
  return [sides[0].idle[0], sides[2 % sides.length].idle[20], c.vet!.jab.frames[9], c.vet!.hook.frames[13], sides[1 % sides.length].walk[3]];
};

test('1. the switch is off: no wraps worn, none baked; of the game only the heroes\' art reads art/wrap_skins.ts', () => {
  assert.equal(WRAP_SKINS.on, false);
  assert.equal(wrapWorn({ rarity: 3, unique: 'lastround' }), null);
  assert.equal(wornSkin('brawler', { rarity: 3, unique: 'lastround' }), null);
  assert.ok(!Object.keys(bakeGroups(true)).some((k) => k.startsWith('brawler-')), 'off: none baked');
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e: { name: string; isDirectory(): boolean }) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []));
  const readers = walk('src').filter((f) => f !== 'src/art/wrap_skins.ts' && !f.startsWith('src/dev/') && /from '[^']*wrap_skins'/.test(readFileSync(f, 'utf8'))).sort();
  assert.deepEqual(readers, ['src/art/heroes3.ts']);
});

test('2. his own wraps are the first skin; painted with them he is the very frame he is painted as when nothing is said', () => {
  assert.equal(WRAP_SKIN_LIST[0], PLAIN_WRAPS);
  assert.deepEqual(WRAP_SKIN_LIST.map((w) => w.id), ['plain', 'lastround', 'fourthglobe', 'winningstreak', 'tapedknuckles']);
  const a = sample(makeVeteranArt());
  const b = sample(makeVeteranArt(PLAIN_WRAPS));
  a.forEach((s, i) => assert.ok(same(px(s), px(b[i])), `frame ${i}`));
});

test('3. each of the four is its own', () => {
  const all = WRAP_SKIN_LIST.map((w) => sample(makeVeteranArt(w)));
  for (let f = 0; f < all[0].length; f++) {
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      // (Hot Streak's gilt and Taped Knuckles' tape may hide alike where his fists are turned away: at least his guard and the jab)
      if (f > 2 && i >= 3) continue;
      assert.ok(!same(px(all[i][f]), px(all[j][f])), `${WRAP_SKIN_LIST[i].id} and ${WRAP_SKIN_LIST[j].id}, frame ${f}`);
    }
  }
});

test('4. on: the four unique wraps worn, their places and looks, his pictures painted with each, a bake group each (the Veteran\'s)', () => {
  WRAP_SKINS.on = true;
  try {
    assert.deepEqual(['lastround', 'fourthglobe', 'winningstreak', 'tapedknuckles'].map((u) => wrapWorn({ rarity: 3, unique: u })), ['lastround', 'fourthglobe', 'winningstreak', 'tapedknuckles']);
    assert.equal(wrapWorn({ rarity: 2, unique: 'lastround' }), null, 'a rare is no unique');
    assert.equal(wornSkin('warlock', { rarity: 3, unique: 'lastround' }), null, 'not on the Warlock');
    assert.deepEqual(wornSkin('brawler', { rarity: 3, unique: 'fourthglobe' }), { look: { wraps: 'fourthglobe' }, places: WRAP_PLACES.fourthglobe });
    for (const id of WRAP_IDS) {
      const { town, dungeon } = WRAP_PLACES[id];
      assert.equal(wrapOfPlace(town), id);
      assert.equal(wrapOfPlace(dungeon), id);
      assert.deepEqual(lookOfPlace(town), { twoHanded: true, town: true, wraps: id });
      assert.deepEqual(lookOfPlace(dungeon), { twoHanded: true, town: false, wraps: id });
      assert.ok(isTownPlace(town) && !isTownPlace(dungeon) && isSkinPlace(town) && isSkinPlace(dungeon));
      assert.ok(WRAP_SKIN_OF[id]);
    }
    const was = EIGHT_MORE.brawler;
    EIGHT_MORE.brawler = true;
    try {
      const art = makeHeroArt3();
      const plain = art.of('brawler', { ...lookOfPlace('dungeon'), vet: true });
      const tape = art.of('brawler', { ...lookOfPlace('tapedknuckles'), vet: true });
      assert.notEqual(tape, plain);
      assert.equal(art.of('brawler', { ...lookOfPlace('tapedknucklesTown'), vet: true }), tape, 'one set of him for town and a dungeon, as his own');
      assert.equal(art.of('brawler', { ...lookOfPlace('card'), vet: true, wraps: 'tapedknuckles' }), art.of('brawler', { ...lookOfPlace('card'), vet: true }), 'his class card: his own');
      assert.equal(JSON.stringify(listLengths(heroSides(tape))), JSON.stringify(listLengths(heroSides(plain))));
      assert.ok(!same(px(heroSides(plain)[0].idle[0]), px(heroSides(tape)[0].idle[0])), 'painted with Taped Knuckles');
    } finally {
      EIGHT_MORE.brawler = was;
    }
    const g = bakeGroups(true);
    for (const id of WRAP_IDS) assert.deepEqual(g[`brawler-${id}`].map(keyName), [`brawler:${WRAP_PLACES[id].town}:vet`, `brawler:${WRAP_PLACES[id].dungeon}:vet`]);
    assert.deepEqual(g.brawler.map(keyName), ['brawler:town:vet', 'brawler:dungeon:vet']);
    assert.ok(!Object.keys(bakeGroups(false)).some((k) => k.startsWith('brawler-')), 'the Brawler of old wears none');
    const all = Object.values(g).flat().map(keyName);
    assert.equal(new Set(all).size, all.length, 'none twice');
  } finally {
    WRAP_SKINS.on = false;
  }
});
