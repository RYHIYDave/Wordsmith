// THE NEW CLASSES PAINTED MORE CHEAPLY, AND NOT ONE PIXEL OF THEM CHANGED (the art chat's helper, 1 Nov 2026;
// docs/cheap_heroes.md). The owner, 31 Oct 2026, of the Warlock: "He needs to be able to be played by anyone, what are we
// talking about"; the Tinkerer and the Brawler the same: "Yes, all three (Recommended)". Every frame of theirs was shown to him
// and given his yes, so how they are painted may change and what is painted may not.
//
// tests/cheap_heroes.hashes.json PINS EVERY FRAME the game holds of the Warlock (a man, blazing, the change, the demon, its
// burning out; in a dungeon, in town and on his class card), the Tinkerer (and her Golem and her Contraption) and the Brawler,
// both ways round: each frame's hash (its pixels, size, anchor, lights, pool of light, tails, charge), as they were painted on
// heroes6 f915eab, before any of this (tools/cheap_heroes.ts hash). Here the first, the middle and the last frame of every list
// are painted and held against them (some three minutes on a busy two-core machine); with CHEAP_HEROES=all, every frame (some
// fifteen).
//   run: tsx --test tests/cheap_heroes.test.ts           CHEAP_HEROES=all tsx --test tests/cheap_heroes.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync } from 'node:fs';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { hashSprite, listsOf } from '../tools/cheap_heroes';
import type { Who } from '../tools/cheap_heroes';

declare const process: { env: Record<string, string | undefined> };
const PINNED = JSON.parse(readFileSync(new URL('./cheap_heroes.hashes.json', import.meta.url), 'utf8')) as { lists: Record<string, string[]> };
const ALL = process.env.CHEAP_HEROES === 'all';

for (const who of ['warlock', 'tinkerer', 'tinkerer-kit', 'brawler'] as Who[]) {
  test(`${who}: every list there was, as long as it was, and its frames the very same pictures`, () => {
    const lists = listsOf(who);
    const prefix = who === 'tinkerer-kit' ? /^(golem|contraption):/ : new RegExp(`^${who}:`);
    const pinned = Object.keys(PINNED.lists).filter((k) => prefix.test(k));
    assert.deepEqual(lists.map((l) => l.name).sort(), pinned.sort(), `${who}: the same lists`);
    let n = 0;
    for (const l of lists) {
      const want = PINNED.lists[l.name];
      assert.equal(l.frames.length, want.length, `${l.name}: as many frames`);
      const picks = ALL ? want.map((_, i) => i) : [...new Set([0, Math.floor(want.length / 2), want.length - 1])];
      for (const i of picks) {
        assert.equal(hashSprite(l.frames[i]), want[i], `${l.name}[${i}]: the very same picture`);
        n++;
      }
    }
    assert.ok(n > 0);
  });
}

test('the Warlock: a list that is the same in every place he is shown in is one list, painted once', () => {
  const A = makeHeroArt3();
  const look = (place: 'dungeon' | 'town' | 'card' | 'blaze') => A.of('warlock', lookOfPlace(place));
  const fight = look('dungeon');
  for (const v of ['front', 'back'] as const) {
    const f = fight[v];
    for (const place of ['town', 'card'] as const) {
      const o = look(place)[v];
      assert.equal(o.idle, f.idle, `${place} ${v}: one standing list`);
      assert.equal(o.walk, f.walk, `${place} ${v}: one running list`);
      for (const k of ['attack', 'heavy', 'leap', 'land', 'reel', 'lurch', 'fall'] as const) assert.equal(o.clips?.[k]?.frames, f.clips?.[k]?.frames, `${place} ${v}: one ${k} list`);
      assert.equal(o.clips?.change, undefined, `${place} ${v}: no change there`);
    }
    // (blazing: his standing and running his own; the rest, which do not blaze, the man's)
    const b = look('blaze')[v];
    assert.notEqual(b.idle, f.idle, `blazing ${v}: his own standing`);
    assert.notEqual(b.walk, f.walk, `blazing ${v}: his own running`);
    for (const k of ['attack', 'heavy', 'leap', 'land', 'reel', 'lurch', 'fall', 'change'] as const) assert.equal(b.clips?.[k]?.frames, f.clips?.[k]?.frames, `blazing ${v}: one ${k} list`);
    // (each set's clips its own, their frames shared)
    assert.notEqual(b.clips?.attack, f.clips?.attack, `blazing ${v}: its own clip`);
  }
  // (and his card's own moment, picked, his own still)
  assert.ok(look('card').front.clips?.ready && !fight.front.clips?.ready);
});

test('the Tinkerer: her Contraption thrown down is her vial toss but for what is in her hand, those frames painted once', () => {
  const A = makeHeroArt3();
  const set = A.of('tinkerer', lookOfPlace('dungeon')).front;
  const toss = set.clips!.attack!.frames;
  const down = (set.clips as { tapAs?: Record<string, { frames: unknown[] }> }).tapAs!.contraption.frames;
  assert.equal(toss.length, down.length);
  let same = 0;
  for (let i = 0; i < toss.length; i++) if (toss[i] === down[i]) same++;
  // (28 of 37 frames, from in front: before she has it in her hand, and after she lets it go)
  assert.equal(same, 28, `${same} frames the very same`);
});
