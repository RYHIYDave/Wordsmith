// FLAT DAMAGE (game/items.ts FLAT_PAIRS; his 4 Nov 2026, 19:11, “We don’t have anything that adds flat damage like “2-4 damage”
// which would be an easy add”, and 8 Nov, “Craftabke on weapons and gloves and rings”): Power, Fire, Frost and Lightning crafted on
// a weapon, gloves or a ring may give “Adds X-Y ... Damage” (Power's to every hit, an element's to its own hits); not on an amulet
// nor on the protective pieces; one property, never twice; the hero's hits of that element take it.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { FLAT_PAIRS, POISON_DMG, imbueItem, imbueOptions, imbueOptionsFor, modLines, rollItem } from '../src/game/items';
import type { Item, Slot } from '../src/game/types';
import { Game } from '../src/game/game';
import { rangeText } from '../src/ui/inventory';

const plain = (slot: Slot, ilvl = 12): Item => {
  const it = rollItem(ilvl, new RNG(5), { slot, rarity: 0 });
  it.affixes = [];
  it.imbues = [];
  return it;
};
const stats = (w: string, slot: Slot): string[] => imbueOptions(w as never, slot, 12).map((o) => o.stat);

test('crafted on a weapon, gloves and a ring: the damage words may give flat damage; not on an amulet or the protective pieces', () => {
  for (const [w, min] of [['power', 'dmgMin'], ['fire', 'fireMin'], ['frost', 'frostMin'], ['lightning', 'lightMin']] as const) {
    for (const slot of ['mainhand', 'gloves', 'ring'] as const) assert.ok(stats(w, slot).includes(min), `${w} on ${slot}`);
    for (const slot of ['amulet', 'helm', 'chest', 'belt', 'boots', 'offhand'] as const) assert.ok(!stats(w, slot).includes(min), `${w} not on ${slot}`);
  }
  // (what they gave before is still on offer beside it)
  assert.deepEqual(stats('fire', 'ring'), ['firePct', 'fireMin', 'fireRes']);
  assert.deepEqual(stats('fire', 'mainhand'), ['firePct', 'fireMin']);
  assert.deepEqual(stats('power', 'gloves'), ['physPct', 'dmgMin', 'str']);
  // (POISON DAMAGE on since his yes of 12 Nov 2026: the Poison word gives poison's own, as Flame's; off, none)
  assert.deepEqual(stats('poison', 'mainhand'), ['poisonPct', 'poisonMin']);
  const was = POISON_DMG.on;
  POISON_DMG.on = false;
  assert.ok(!stats('poison', 'ring').some((s) => s.endsWith('Min')), 'poison off: none');
  POISON_DMG.on = was;
});

test('crafted, it is one property, “Adds X-Y”, least below most, growing deeper down; never twice on a piece', () => {
  const was = POISON_DMG.on;
  for (const f of FLAT_PAIRS) {
    // (POISON DAMAGE's, the Poison word's on gear with its switch on: game/items.ts POISON_DMG)
    POISON_DMG.on = f.min === 'poisonMin';
    const word = f.min === 'dmgMin' ? 'power' : f.min === 'fireMin' ? 'fire' : f.min === 'frostMin' ? 'frost' : f.min === 'lightMin' ? 'lightning' : 'poison';
    const ring = plain('ring');
    const k = imbueOptionsFor(ring, word).findIndex((o) => o.stat === f.min);
    assert.ok(k >= 0, word);
    const text = rangeText(imbueOptionsFor(ring, word)[k], 'cooldown');
    assert.match(text, new RegExp(`^Adds \\d+-\\d+ ${f.label}$`));
    const made = imbueItem(ring, word, new RNG(3), k)!;
    assert.equal(made.mods.length, 2);
    assert.equal(made.mods[0].stat, f.min);
    assert.equal(made.mods[1].stat, f.max);
    assert.ok(made.mods[0].value >= 1 && made.mods[0].value < made.mods[1].value);
    assert.deepEqual(modLines(made.mods, 'cooldown'), [`Adds ${made.mods[0].value}-${made.mods[1].value} ${f.label}`]);
    assert.ok(!imbueOptionsFor(ring, word).some((o) => o.stat === f.min), 'not twice');
  }
  POISON_DMG.on = was;
  const lo = imbueOptions('fire', 'ring', 2).find((o) => o.stat === 'fireMin')!;
  const hi = imbueOptions('fire', 'ring', 25).find((o) => o.stat === 'fireMin')!;
  assert.ok(hi.max > lo.max * 2, `deeper, more (${lo.max} to ${hi.max})`);
});

test("the hero's hits: flat fire on his ring goes into his fire hits only; flat damage into all", () => {
  const g = new Game('mage', 4);
  const h = g.hero;
  const before = { fire: g.baseFor('fire'), phys: g.baseFor('phys'), frost: g.baseFor('frost') };
  const ring = plain('ring');
  const k = imbueOptionsFor(ring, 'fire').findIndex((o) => o.stat === 'fireMin');
  const made = imbueItem(ring, 'fire', new RNG(9), k)!;
  assert.ok(ring.imbues.includes(made), 'burned into it');
  h.gear.ring1 = ring;
  g.refresh();
  const add = [made.mods[0].value, made.mods[1].value];
  assert.deepEqual(g.baseFor('fire'), [before.fire[0] + add[0], before.fire[1] + add[1]]);
  assert.deepEqual(g.baseFor('frost'), before.frost);
  assert.deepEqual(g.baseFor('phys'), before.phys);
});
