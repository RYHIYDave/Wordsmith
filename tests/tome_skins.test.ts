// THE WARLOCK'S UNIQUE TOMES (art/tome_skins.ts; dev/sculpt_warlock.ts TomeSkin, PLAIN_TOME; in the game behind art/heroes.ts
// TOME_SKINS). His word, 14 Nov 2026, of the Mage's staves done: “then do it for the rest of the cast”; shown the tomes on him:
// “Yes, all four (Recommended)”; shown him with them in play: “Yes, switch them on (Recommended)”.
//   1. the switch is on (his yes); off, no tome is worn and none baked, his groups as before; of the game only the heroes' art
//      reads art/tome_skins.ts;
//   2. his own book is the first skin, and painted with it he is the very frame he is painted as when nothing is said;
//   3. each of the four is its own (the Restless Tome: no book at his hip, its chain empty);
//   4. what a skin adds is of the book's stuff and the chain's: every other stuff of his keeps its number (his change tears him
//      away by them, dev/warlock_change.ts tearsAt);
//   5. on: the four unique tomes worn by the Warlock, each its places in town, a dungeon and his arm blazing, its look that tome;
//      his pictures there painted with it, the demon as ever; a bake group each, and his demon a group of its own.
// (His own book painted exactly as before was checked over 717 frames, 14 Nov 2026: here a sample.)

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore - node typings are not part of this project
import { readdirSync, readFileSync } from 'node:fs';
import { paintWithoutCanvas } from './helpers';
import { makeWarlockArt } from '../src/art/warlock_art';
import { PLAIN_TOME, WARLOCK_TOME, warlockSculpt } from '../src/dev/sculpt_warlock';
import { TOME_SKIN_LIST, TOME_SKIN_OF } from '../src/art/tome_skins';
import { TOME_IDS, TOME_PLACES, TOME_SKINS, isSkinPlace, isTownPlace, lookOfPlace, tomeOfPlace, tomeWorn, wornSkin } from '../src/art/heroes';
import { makeHeroArt3 } from '../src/art/heroes3';
import { bakeGroups, keyName, listLengths } from '../src/render/baked';
import { heroSides } from '../src/art/sides';
import type { ActorArt } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';

paintWithoutCanvas();

const px = (s: Sprite): Uint8ClampedArray => (s.img as unknown as { d: Uint8ClampedArray }).d;
const same = (a: Uint8ClampedArray, b: Uint8ClampedArray): boolean => a.length === b.length && a.every((v, k) => v === b[k]);
/** A few frames of him where his right hip is seen: standing toward the eye, his bolt, from his right side. */
const sample = (art: ActorArt): Sprite[] => {
  const s = heroSides(art);
  return [s[0].idle[3], s[0].clips!.attack!.frames[6], s[7].idle[8]];
};

test('1. the switch is on (his yes); off, no tome worn, none baked, his groups as before; of the game only the heroes\' art reads art/tome_skins.ts', () => {
  assert.equal(TOME_SKINS.on, true);
  TOME_SKINS.on = false;
  try {
    assert.equal(tomeWorn({ rarity: 3, unique: 'hornbook' }), null);
    assert.equal(wornSkin('warlock', { rarity: 3, unique: 'hornbook' }), null);
    const g = bakeGroups(true);
    assert.ok(!Object.keys(g).some((k) => k.startsWith('warlock-')), 'off: none baked');
    assert.deepEqual(g.warlock.map(keyName), ['warlock:town', 'warlock:dungeon', 'warlock:demon', 'warlock:blaze']);
  } finally {
    TOME_SKINS.on = true;
  }
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e: { name: string; isDirectory(): boolean }) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []));
  const readers = walk('src').filter((f) => f !== 'src/art/tome_skins.ts' && !f.startsWith('src/dev/') && /from '[^']*tome_skins'/.test(readFileSync(f, 'utf8'))).sort();
  assert.deepEqual(readers, ['src/art/heroes3.ts']);
});

test('2. his own book is the first skin; painted with it he is the very frame he is painted as when nothing is said', () => {
  assert.equal(TOME_SKIN_LIST[0], PLAIN_TOME);
  assert.deepEqual(TOME_SKIN_LIST.map((w) => w.id), ['plain', 'ledgerofdebts', 'restlesstome', 'burningverse', 'hornbook']);
  const a = sample(makeWarlockArt({ form: 'man', place: 'dungeon' }));
  const b = sample(makeWarlockArt({ form: 'man', place: 'dungeon', tome: PLAIN_TOME }));
  a.forEach((s, i) => assert.ok(same(px(s), px(b[i])), `frame ${i}`));
});

test('3. each of the four is its own; the Restless Tome is not at his hip', () => {
  const all = TOME_SKIN_LIST.map((t) => sample(makeWarlockArt({ form: 'man', place: 'dungeon', tome: t })));
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) assert.ok(!same(px(all[i][0]), px(all[j][0])), `${TOME_SKIN_LIST[i].id} and ${TOME_SKIN_LIST[j].id}`);
  const was = WARLOCK_TOME.skin;
  try {
    WARLOCK_TOME.skin = TOME_SKIN_OF.restlesstome;
    const m = warlockSculpt('front');
    assert.ok(!m.sc.prims.some((p) => p.piece === 'book' && p.tag === 'book'), 'no book');
    assert.ok(m.sc.prims.some((p) => p.piece === 'book' && p.tag === 'link'), 'its chain');
  } finally {
    WARLOCK_TOME.skin = was;
  }
});

test('4. what a skin adds is of the book\'s stuff and the chain\'s: every other stuff keeps its number', () => {
  const was = WARLOCK_TOME.skin;
  try {
    const stuffs = (): { n: number; of: string[] } => {
      const m = warlockSculpt('front');
      return { n: m.sc.mats.length, of: m.sc.prims.filter((p) => p.piece !== 'book').map((p) => `${p.mat}:${p.piece}:${p.tag ?? ''}`) };
    };
    WARLOCK_TOME.skin = PLAIN_TOME;
    const own = stuffs();
    for (const t of TOME_SKIN_LIST) {
      WARLOCK_TOME.skin = t;
      assert.deepEqual(stuffs(), own, t.id);
    }
  } finally {
    WARLOCK_TOME.skin = was;
  }
});

test('5. on: the four unique tomes worn, their places and looks, his pictures painted with each, a bake group each, his demon\'s its own', () => {
  TOME_SKINS.on = true;
  try {
    assert.deepEqual(['ledgerofdebts', 'restlesstome', 'burningverse', 'hornbook'].map((u) => tomeWorn({ rarity: 3, unique: u })), ['ledgerofdebts', 'restlesstome', 'burningverse', 'hornbook']);
    assert.equal(tomeWorn({ rarity: 2, unique: 'hornbook' }), null, 'a rare is no unique');
    assert.equal(wornSkin('brawler', { rarity: 3, unique: 'hornbook' }), null, 'not on the Brawler');
    assert.deepEqual(wornSkin('warlock', { rarity: 3, unique: 'burningverse' }), { look: { tome: 'burningverse' }, places: TOME_PLACES.burningverse });
    for (const id of TOME_IDS) {
      const { town, dungeon, blaze } = TOME_PLACES[id];
      for (const p of [town, dungeon, blaze]) assert.equal(tomeOfPlace(p), id);
      assert.deepEqual(lookOfPlace(town), { twoHanded: true, town: true, tome: id });
      assert.deepEqual(lookOfPlace(dungeon), { twoHanded: true, town: false, tome: id });
      assert.deepEqual(lookOfPlace(blaze), { twoHanded: true, town: false, blaze: true, tome: id });
      assert.ok(isTownPlace(town) && !isTownPlace(dungeon) && !isTownPlace(blaze) && isSkinPlace(blaze));
    }
    const art = makeHeroArt3();
    const plain = art.of('warlock', lookOfPlace('dungeon'));
    const horn = art.of('warlock', lookOfPlace('hornbook'));
    assert.notEqual(horn, plain);
    assert.notEqual(art.of('warlock', lookOfPlace('hornbookBlaze')), horn, 'his arm blazing: a set of its own, as his own');
    assert.equal(art.of('warlock', { ...lookOfPlace('demon'), tome: 'hornbook' }), art.of('warlock', lookOfPlace('demon')), 'the demon: as ever');
    assert.equal(art.of('warlock', { ...lookOfPlace('card'), tome: 'hornbook' }), art.of('warlock', lookOfPlace('card')), 'his class card: his own book');
    assert.equal(JSON.stringify(listLengths(heroSides(horn))), JSON.stringify(listLengths(heroSides(plain))));
    assert.ok(!same(px(heroSides(plain)[0].idle[3]), px(heroSides(horn)[0].idle[3])), 'painted with the Hornbook');
    const g = bakeGroups(true);
    for (const id of TOME_IDS) assert.deepEqual(g[`warlock-${id}`].map(keyName), [`warlock:${TOME_PLACES[id].town}`, `warlock:${TOME_PLACES[id].dungeon}`, `warlock:${TOME_PLACES[id].blaze}`]);
    assert.deepEqual(g.warlock.map(keyName), ['warlock:town', 'warlock:dungeon', 'warlock:blaze']);
    assert.deepEqual(g['warlock-demon'].map(keyName), ['warlock:demon']);
    const all = Object.values(g).flat().map(keyName);
    assert.equal(new Set(all).size, all.length, 'none twice');
  } finally {
    TOME_SKINS.on = true;
  }
});
