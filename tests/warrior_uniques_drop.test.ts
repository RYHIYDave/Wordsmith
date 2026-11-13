// THE WARRIOR'S WEAPON UNIQUES, EACH ITS OWN WEAPON'S, AND NO ONE-HANDED SWORDS FOR NOW (his picks, 12 Nov 2026: of plain swords
// and greatswords, “keep as today, and we dont need one handed swords yet.  so those can stay out of the game for now until we add
// the gladiator ...”; asked whether the Warrior's weapon uniques should work on any of his three weapons, “Each keeps its weapon's
// moves”: so each drops only for the weapon he uses). Held:
//   1. no one-handed sword is found, sold or gambled for (ONE_HAND_SWORDS off); greatswords as ever; the shield still to be had;
//   2. a Warrior finds only the uniques of the weapon he uses; another hero never finds them; a unique he carries keeps its own
//      weapon when his weapon changes.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ONE_HAND_SWORDS, TUNE, VENDOR_IDS, gambleKinds, vendorStock } from '../src/game/defs';
import { CLASS_IDS } from '../src/game/types';
import { Game } from '../src/game/game';
import { rollItem } from '../src/game/items';
import { RNG } from '../src/engine/rng';
import { UNIQUES, poolFor, uniqueDef, uniqueWeapon } from '../src/game/uniques';
import type { Item, WeaponKind } from '../src/game/types';

interface Inner {
  makePoolUnique: (slot?: string, weapon?: WeaponKind | null) => Item | null;
}

test('1. no one-handed sword found, sold or gambled for; the greatsword and the shield as ever', () => {
  assert.equal(ONE_HAND_SWORDS.on, false);
  const rng = new RNG(7);
  const kinds = new Set<string>();
  for (let i = 0; i < 3000; i++) {
    const it = rollItem(12, rng, { slot: 'mainhand' });
    if (it?.weapon) kinds.add(it.weapon);
  }
  assert.ok(!kinds.has('sword'), `found: ${[...kinds].join(', ')}`);
  assert.ok(kinds.has('greatsword') && kinds.has('bow'), 'greatswords and bows still found');
  assert.ok(!vendorStock('armourer', 'warrior').weapons.includes('sword'), 'the armourer sells none');
  assert.ok(vendorStock('armourer', 'warrior').weapons.includes('greatsword'));
  const g = gambleKinds('warrior');
  assert.ok(!g.some((k) => k.slot === 'mainhand' && k.weapon === 'sword'), 'none gambled for');
  assert.ok(g.some((k) => k.name === 'Shield'), "the shield still gambled for (the Tinkerer's wrench takes it)");
  // (each shelf as long as ever, for every hero, and no sword on it)
  for (const cls of CLASS_IDS) {
    for (const id of VENDOR_IDS) {
      const v = vendorStock(id, cls);
      assert.equal(v.weapons.length + v.slots.length, TUNE.shopSize, `${cls}, ${id}: a full shelf`);
    }
    const h = new Game(cls, 5);
    h.rollShop();
    for (const id of VENDOR_IDS) {
      const shelf = h.shops[id];
      assert.equal(shelf.length, TUNE.shopSize, `${cls}, ${id}: ${shelf.length} on the shelf`);
      assert.ok(shelf.every((it) => it && it.weapon !== 'sword'), `${cls}, ${id}: a sword on the shelf`);
    }
  }
});

test('2. a Warrior finds only his weapon\'s uniques; another hero none; a unique he carries keeps its weapon', () => {
  assert.equal(UNIQUES.on, true);
  const greatswords = poolFor('warrior').filter((d) => uniqueWeapon(d) === 'greatsword');
  assert.ok(greatswords.length >= 3, 'the greatsword\'s own uniques');
  for (const pick of ['battleaxe', 'warhammer', null] as const) {
    const g = new Game('warrior', 5);
    if (pick) g.hero.talents.push(pick);
    const his = pick ?? 'greatsword';
    const a = g as unknown as Inner;
    const seen = new Set<string>();
    for (let i = 0; i < 300; i++) {
      const it = a.makePoolUnique(undefined, null);
      const d = it ? uniqueDef(it.unique) : undefined;
      if (!d) continue;
      const w = uniqueWeapon(d);
      if (w === 'greatsword' || w === 'battleaxe' || w === 'warhammer') assert.equal(w, his, `${his}: ${d.id} found`);
      if (it && w) assert.equal(it.weapon, w, `${d.id}: its own weapon`);
      seen.add(d.id);
    }
    if (his === 'greatsword') for (const d of greatswords) assert.ok(seen.has(d.id), `the greatsword's ${d.id} found`);
    else for (const d of greatswords) assert.ok(!seen.has(d.id), `${his}: the greatsword's ${d.id} not found`);
  }
  // (a greatsword's unique carried by a Warrior who takes up the axe stays a greatsword, its moves its own)
  const g = new Game('warrior', 5);
  assert.ok(g.giveUnique(greatswords[0].id), 'given');
  g.hero.talents.push('battleaxe');
  (g as unknown as { allForHim: () => void }).allForHim();
  const held = g.hero.bag.find((q) => q?.unique === greatswords[0].id);
  assert.equal(held?.weapon, 'greatsword', 'still a greatsword');
  // (another hero: none of the Warrior's)
  const r = new Game('ranger', 5) as unknown as Inner;
  for (let i = 0; i < 100; i++) {
    const it = r.makePoolUnique(undefined, null);
    const d = it ? uniqueDef(it.unique) : undefined;
    assert.ok(!d || d.cls !== 'warrior', `the Ranger found ${d?.id}`);
  }
});
