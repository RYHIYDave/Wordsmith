// THE NEW CLASSES ON THEIR CLASS CARDS (the owner, 31 Oct 2026, 18:23: "Can you animate the tinkerer and the brawler on the
// character select screen in the test version"): their cards' pictures are made at once (art/heroes3.ts, place 'card':
// makeTinkererCardArt, makeBrawlerCardArt), not after the moves that take seconds to make; and their standing and running are
// the game's own lists, so that what the side painter paints for a card is not painted again in the game.
//   run: tsx --test tests/class_cards_paint.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { makeHeroArt3 } from '../src/art/heroes3';
import { lookOfPlace } from '../src/art/heroes';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

test('the Tinkerer\'s and the Brawler\'s cards made at once; their standing and running the game\'s', () => {
  const A = makeHeroArt3();
  for (const cls of ['tinkerer', 'brawler'] as const) {
    const t0 = performance.now();
    const card = A.of(cls, lookOfPlace('card'));
    const ms = performance.now() - t0;
    assert.ok(ms < 1500, `${cls}: the card's pictures made in ${ms.toFixed(0)} ms`);
    assert.ok(card.front.idle.length > 1 && card.front.walk.length > 1, `${cls}: standing and running`);
    const game = A.of(cls, lookOfPlace('dungeon'));
    assert.notEqual(card, game, `${cls}: the card's own set`);
    for (const v of ['front', 'back'] as const) {
      assert.equal(card[v].idle, game[v].idle, `${cls} ${v}: one standing list`);
      assert.equal(card[v].walk, game[v].walk, `${cls} ${v}: one running list`);
    }
    assert.equal(A.of(cls, lookOfPlace('town')), game, `${cls}: in town as in a dungeon`);
  }
});

test('their slow moves made once for both views, and once only', async () => {
  const B = await import('../src/art/brawler_art');
  const T = await import('../src/art/tinkerer_art');
  // (the first test made each whole set once already: made again, nothing slow is made again)
  const t0 = performance.now();
  const b = B.makeBrawlerArt();
  const t = T.makeTinkererArt();
  const ms = performance.now() - t0;
  assert.ok(ms < 1500, `both whole sets made again in ${ms.toFixed(0)} ms`);
  assert.ok(b.front.clips?.fall && t.front.clips?.heavy, 'whole');
});
