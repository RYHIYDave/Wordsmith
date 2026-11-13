// THE WARRIOR'S WEAPON UNIQUES MADE HIS WEAPON, AND NO ONE-HANDED SWORDS FOR NOW (his picks, 12 Nov 2026, asked how the Warrior's
// weapon uniques should drop once the axe and the hammer have their own: “i would say 1 but for the sake of build diversity i think
// 2 is the way to go”, 2 offered as “Any, turned into his weapon”; and of plain swords and greatswords: “keep as today, and we dont
// need one handed swords yet.  so those can stay out of the game for now until we add the gladiator ...”). Held:
//   1. no one-handed sword is found, sold or gambled for (ONE_HAND_SWORDS off); greatswords as ever; the shield still to be had;
//   2. a Warrior of the axe, or of the hammer, finds the greatsword's uniques too, made his weapon, its power and name kept; one of
//      the greatsword finds them as they are; another hero never finds them.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ONE_HAND_SWORDS, gambleKinds, vendorStock } from '../src/game/defs';
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
});

test('2. a Warrior of the axe or the hammer finds the greatsword\'s uniques made his weapon; one of the greatsword as they are; no other hero', () => {
  assert.equal(UNIQUES.on, true);
  const greatswords = poolFor('warrior').filter((d) => uniqueWeapon(d) === 'greatsword');
  assert.ok(greatswords.length >= 3, 'the greatsword\'s own uniques');
  for (const [pick, want] of [['battleaxe', 'battleaxe'], ['warhammer', 'warhammer'], [null, 'greatsword']] as const) {
    const g = new Game('warrior', 5);
    if (pick) g.hero.talents.push(pick);
    const a = g as unknown as Inner;
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const it = a.makePoolUnique('mainhand', want);
      assert.ok(it, `${want}: a unique for his weapon`);
      const d = uniqueDef(it.unique);
      if (!d) throw new Error('a unique');
      assert.equal(it.weapon, want, `${d.id}: made his ${want}`);
      assert.equal(it.icon, want, `${d.id}: its picture key his weapon's`);
      assert.equal(it.name, d.name, `${d.id}: its name kept`);
      seen.add(d.id);
    }
    for (const d of greatswords) assert.ok(seen.has(d.id), `${want}: ${d.id} found too`);
  }
  // (another hero: none of the Warrior's)
  const r = new Game('ranger', 5) as unknown as Inner;
  for (let i = 0; i < 100; i++) {
    const it = r.makePoolUnique('mainhand', null);
    const d = it ? uniqueDef(it.unique) : undefined;
    assert.ok(!d || d.cls !== 'warrior', `the Ranger found ${d?.id}`);
  }
});
