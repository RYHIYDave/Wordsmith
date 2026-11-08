// SPLITTING AND BINDING CHANGE THE ITEM (game/items.ts ITEM_WORDS, off until his yes to its pictures; his 4 Nov 2026, 19:15, and 8 Nov
// “Yes, Splitting and Binding (Recommended)”): Splitting shares a piece's properties between it and a second like it; Binding takes a
// second piece of the same kind into the first, four properties in all, never two of a kind, at least one of each's; refusals keep
// the word.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { ITEM_WORDS, bindItems, bindProblem, imbueItem, itemWordOf, rollItem, splitItem, splitProblem, statGroup } from '../src/game/items';
import type { Item, Slot } from '../src/game/types';
import { Game } from '../src/game/game';
import { seasoned } from './helpers';

const on = <T>(f: () => T): T => {
  const was = ITEM_WORDS.on;
  ITEM_WORDS.on = true;
  try {
    return f();
  } finally {
    ITEM_WORDS.on = was;
  }
};
/** A plain piece with these words burned into it (each a property). */
function piece(slot: Slot, words: string[], seed = 3): Item {
  const rng = new RNG(seed);
  const it = rollItem(12, rng, { slot, rarity: 0 });
  it.affixes = [];
  it.imbues = [];
  for (const w of words) assert.ok(imbueItem(it, w as never, rng), `${w} on ${slot}`);
  return it;
}
const groups = (it: Item): string[] => [...it.affixes, ...it.imbues].map((p) => statGroup(p.mods[0].stat));

test('on at his yes; off, Splitting and Binding burn in as every word does', () => {
  assert.equal(ITEM_WORDS.on, true);
  ITEM_WORDS.on = false;
  try {
    assert.equal(itemWordOf('splitting'), null);
    assert.equal(itemWordOf('binding'), null);
  } finally {
    ITEM_WORDS.on = true;
  }
});

test('Splitting: two pieces like it, its properties shared between them, each its colour by its count', () =>
  on(() => {
    assert.equal(itemWordOf('splitting'), 'split');
    const ring = piece('ring', ['fire', 'leech', 'twin', 'swift']);
    const all = groups(ring).sort();
    const [a, b] = splitItem(ring, new RNG(7));
    assert.equal(groups(a).length, 2);
    assert.equal(groups(b).length, 2);
    assert.deepEqual([...groups(a), ...groups(b)].sort(), all, 'every property, once');
    for (const x of [a, b]) {
      assert.equal(x.baseId, ring.baseId);
      assert.equal(x.slot, 'ring');
      assert.deepEqual(x.implicit, ring.implicit);
      assert.equal(x.rarity, 1, 'two properties: blue');
    }
    assert.equal(a.uid, ring.uid);
    assert.notEqual(b.uid, a.uid);
    const three = splitItem(piece('ring', ['fire', 'leech', 'twin']), new RNG(2));
    assert.deepEqual(three.map((x) => groups(x).length), [2, 1]);
    assert.equal(splitProblem(piece('ring', ['fire'])), 'Nothing on it to share between two');
  }));

test('Binding: the first keeps its own and takes of the other, four in all, never two of a kind, at least one of each', () =>
  on(() => {
    assert.equal(itemWordOf('binding'), 'bind');
    const a = piece('ring', ['fire', 'leech'], 3);
    const b = piece('ring', ['twin', 'swift'], 5);
    const made = bindItems(a, b, new RNG(1));
    assert.deepEqual(groups(made).sort(), [...groups(a), ...groups(b)].sort(), 'room for all four');
    assert.equal(made.uid, a.uid);
    assert.equal(made.rarity, 2, 'four: yellow');
    const c = piece('ring', ['fire', 'leech', 'twin'], 6);
    const d = piece('ring', ['volatile', 'power', 'swift'], 8);
    for (let s = 1; s <= 20; s++) {
      const m = bindItems(c, d, new RNG(s));
      const g = groups(m);
      assert.equal(g.length, 4);
      assert.equal(new Set(g).size, 4, 'never two of a kind');
      assert.ok(g.some((x) => groups(c).includes(x)) && g.some((x) => groups(d).includes(x)), 'at least one of each');
    }
    // (where both have one of a kind, its own is kept)
    const e = piece('ring', ['fire'], 9);
    const f = piece('ring', ['fire', 'twin'], 10);
    const kept = bindItems(e, f, new RNG(4));
    assert.equal(kept.imbues.filter((i) => i.word === 'fire').length, 1);
    assert.equal(kept.imbues.find((i) => i.word === 'fire')!.mods[0].value, e.imbues[0].mods[0].value);
    assert.equal(bindProblem(e, piece('helm', ['fire'])), 'Only two pieces of the same kind bind');
  }));

test('at the bench: the second piece in the bag, the other gone, the word used up; a refusal keeps it', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 5), 10);
    const h = g.hero;
    h.ring = true;
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    h.bag[0] = piece('ring', ['fire', 'leech', 'twin', 'swift']);
    h.words.splitting = 1;
    assert.equal(g.splitPiece({ kind: 'bag', i: 0 }), null);
    assert.equal(h.words.splitting, 0);
    assert.equal(h.bag.filter((b) => b && b.slot === 'ring').length, 2);
    h.words.binding = 1;
    const second = h.bag.findIndex((b, i) => i > 0 && b && b.slot === 'ring');
    assert.equal(g.bindPieces({ kind: 'bag', i: 0 }, { kind: 'bag', i: second }), null);
    assert.equal(h.words.binding, 0);
    assert.equal(h.bag.filter((b) => b && b.slot === 'ring').length, 1);
    assert.equal(groups(h.bag[0]!).length, 4);
    h.words.splitting = 1;
    h.bag[1] = piece('ring', ['fire']);
    assert.equal(g.splitPiece({ kind: 'bag', i: 1 }), 'Nothing on it to share between two');
    assert.equal(h.words.splitting, 1, 'refused: the word kept');
  }));
