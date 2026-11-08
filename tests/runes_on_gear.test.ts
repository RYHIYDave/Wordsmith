// EVERY WORD ON GEAR (game/items.ts). The owner, 8 Nov 2026, 06:44 and 06:45: “Do the sounds, then I want every tune in the
// game to be used on an item”, then “Every rune sorry”; of the new words, “And those all craftable as well”. Until then a
// melded word and a ranked one went on attacks only. Now: a melded word on a piece gives a property of each of its two
// words at once, each a little weaker than its word alone (MELD_GEAR_STRENGTH); a ranked word gives its word's, half as
// strong again (RANK_GEAR_STRENGTH). Still not laid on the gate, nor kept in the Lexicon.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { MELD_GEAR_STRENGTH, RANK_GEAR_STRENGTH, imbueItem, imbueOptions, imbueOptionsFor, imbueProblem, imbueRules, rollItem, statGroup } from '../src/game/items';
import { MELD_IDS, MELD_OF, RANK_IDS, RANK_OF, SLOTS, VOLT_MELD_IDS, WORD_IDS } from '../src/game/types';
import type { WordId } from '../src/game/types';
import { gearLines, gearNote } from '../src/ui/lexicon';
import { rangeText } from '../src/ui/inventory';

const MELDS = [...MELD_IDS, ...VOLT_MELD_IDS];
const EVERY: WordId[] = [...WORD_IDS, ...MELDS, ...RANK_IDS];

test('every word there is can go on every slot, at every level: never nothing on offer', () => {
  for (const w of EVERY) {
    for (const slot of SLOTS) {
      for (const ilvl of [1, 8, 15, 30]) {
        const opts = imbueOptions(w, slot, ilvl);
        assert.ok(opts.length > 0, `${w} on ${slot} at ${ilvl}`);
        for (const o of opts) {
          assert.ok(o.min > 0 && o.max >= o.min, `${w} on ${slot}: ${o.stat} ${o.min}-${o.max}`);
          if (o.also) assert.ok(o.also.min > 0 && o.also.max >= o.also.min, `${w} on ${slot}: ${o.also.stat}`);
        }
      }
    }
  }
});

test('a melded word gives one property of each of its two words, never two of a kind, each a little weaker', () => {
  for (const m of MELDS) {
    const [a, b] = MELD_OF[m];
    for (const slot of SLOTS) {
      const opts = imbueOptions(m, slot, 15);
      const fromA = imbueOptions(a, slot, 15);
      const fromB = imbueOptions(b, slot, 15);
      for (const o of opts) {
        assert.ok(o.also, `${m} on ${slot}: two properties`);
        if (!o.also) continue;
        assert.notEqual(statGroup(o.stat), statGroup(o.also.stat), `${m} on ${slot}: not two of a kind`);
        const ofA = fromA.find((x) => x.stat === o.stat);
        const ofB = fromB.find((x) => x.stat === o.also?.stat);
        assert.ok(ofA, `${m} on ${slot}: ${o.stat} is ${a}'s`);
        assert.ok(ofB, `${m} on ${slot}: ${o.also.stat} is ${b}'s`);
        if (ofA) assert.ok(o.max <= ofA.max, `${m}: ${o.stat} no stronger than ${a}'s alone`);
        if (ofB) assert.ok(o.also.max <= ofB.max, `${m}: ${o.also.stat} no stronger than ${b}'s alone`);
      }
    }
  }
  assert.ok(MELD_GEAR_STRENGTH < 1 && MELD_GEAR_STRENGTH * 2 > 1, 'each weaker than a word alone, the two together more');
  // (the pairs on a weapon: Eruption, Power and Flame)
  assert.deepEqual(imbueOptions('eruption', 'mainhand', 10).map((o) => [o.stat, o.also?.stat]), [['physPct', 'firePct'], ['str', 'firePct']]);
});

test('a ranked word gives its word\'s, half as strong again', () => {
  for (const r of RANK_IDS) {
    const base = RANK_OF[r].word;
    for (const slot of SLOTS) {
      const mine = imbueOptions(r, slot, 15);
      const its = imbueOptions(base, slot, 15);
      assert.deepEqual(mine.map((o) => o.stat), its.map((o) => o.stat), `${r} on ${slot}: what ${base} gives`);
      mine.forEach((o, i) => assert.ok(o.max > its[i].max, `${r} on ${slot}: ${o.stat} stronger (${o.max} against ${its[i].max})`));
    }
  }
  assert.equal(RANK_GEAR_STRENGTH, 1.5);
});

test('burned in: a melded word puts two properties in the room of one; a ranked word one', () => {
  const rng = new RNG(808);
  for (const m of MELDS) {
    const it = rollItem(10, rng, { slot: 'ring', rarity: 0 });
    assert.equal(imbueProblem(it, m), null, `${m} goes on a plain ring`);
    const made = imbueItem(it, m, rng);
    assert.ok(made && made.mods.length === 2, `${m}: two properties`);
    assert.equal(it.imbues.length, 1, 'in the room of one');
    assert.equal(made?.word, m);
  }
  for (const r of RANK_IDS) {
    const it = rollItem(10, rng, { slot: 'chest', rarity: 0 });
    const made = imbueItem(it, r, rng);
    assert.ok(made && made.mods.length === 1, `${r}: one property`);
  }
});

test('a piece never carries a property twice: a melded word is offered only where both of its are free', () => {
  const rng = new RNG(31);
  const sword = rollItem(10, rng, { slot: 'mainhand', rarity: 0 });
  imbueItem(sword, 'fire', rng);
  assert.ok(sword.imbues[0].mods[0].stat === 'firePct');
  // (Eruption's pairs both carry Flame's damage, which the sword has now)
  assert.deepEqual(imbueOptionsFor(sword, 'eruption'), []);
  assert.equal(imbueProblem(sword, 'eruption'), 'It already has what this word gives');
  // (Thunder, Power and Lightning: still free)
  assert.ok(imbueOptionsFor(sword, 'thunder').length > 0);
  for (const m of MELDS) for (const slot of SLOTS) {
    const it = rollItem(12, rng, { slot, rarity: 2 });
    const opts = imbueOptionsFor(it, m);
    assert.ok(opts.length <= 2, 'one or two offered');
    const have = new Set(it.affixes.flatMap((a) => a.mods.map((x) => statGroup(x.stat))));
    for (const o of opts) {
      assert.ok(!have.has(statGroup(o.stat)) && (!o.also || !have.has(statGroup(o.also.stat))), `${m} on ${it.name}`);
    }
  }
});

test('the Lexicon and the question say what a melded or ranked word becomes', () => {
  const limit = 'cooldown' as const;
  for (const w of [...MELDS, ...RANK_IDS]) {
    const lines = gearLines(w, limit);
    assert.ok(lines.length > 0, w);
    const covered = imbueRules(w).flatMap((r) => r.slots);
    assert.deepEqual([...covered].sort(), [...SLOTS].sort(), `${w}: every slot told, once`);
    assert.ok(gearNote(w).length > 0);
  }
  assert.ok(gearLines('eruption', limit).some((l) => / and /.test(l)), 'two together');
  assert.match(gearNote('fire2'), /Half as strong again as Flame/);
  const o = imbueOptions('eruption', 'mainhand', 10)[0];
  assert.match(rangeText(o, limit), / and /);
});
