// The trades (the town's third update): the wordsmith's trade in words, the stranger's gamble, and
// the lines the town's people say.
//
// The owner, 4 Oct 2026: "The wordsmith should buy and sell words"; "a shady guy in the corner
// that will let you gamble for a random item"; "And give the merchants some tag lines when you
// move close to them. Very sparsely tho don't spam the lines".
//   run: tsx --test tests/trades.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { GAMBLE_KINDS, TAGS, TOWN_FOLK, TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
// (THE FIRST LEVELS, since Version 19.5: the wordsmith trades in words once his ring is lit: tests/helpers.ts seasoned)
import { seasoned } from './helpers';
import { plainValue } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { GameEvent } from '../src/game/state';
import { WORD_IDS } from '../src/game/types';
import type { WordId } from '../src/game/types';

const spare = (g: Game): number => WORD_IDS.reduce((a, w) => a + g.hero.words[w], 0);

test('the trades are open: the stranger has his service, and the wordsmith a shelf of words', () => {
  assert.equal(TUNE.tradesOpen, true);
  const g = new Game('warrior', 5);
  assert.ok(g.level.town);
  assert.ok(g.level.stations.some((s) => s.kind === 'stranger'));
  assert.equal(g.wordStock.length, TUNE.wordStock);
  const words = g.wordStock.filter((w): w is WordId => w !== null);
  assert.equal(words.length, TUNE.wordStock, 'every place on the shelf has a word');
  assert.equal(new Set(words).size, words.length, 'never the same word twice');
  for (const w of words) assert.ok(WORD_IDS.includes(w));
  assert.deepEqual(g.wordsSold, []);
  assert.equal(g.won, -1);
});

test('what a word costs: a dungeon\'s purse for each dungeon cleared, and he pays a quarter of it', () => {
  const g = new Game('warrior', 5);
  assert.equal(g.wordPrice(), TUNE.wordPrice, 'before any dungeon is cleared: one dungeon\'s worth');
  g.cleared = 1;
  assert.equal(g.wordPrice(), TUNE.wordPrice);
  g.cleared = 4;
  assert.equal(g.wordPrice(), TUNE.wordPrice * 4);
  assert.equal(g.wordSellValue(), Math.floor(TUNE.wordPrice * 4 * TUNE.wordSellRate));
  assert.ok(g.wordSellValue() < g.wordPrice(), 'there is no gold to be made buying and selling the same word');
});

test('buying a word: the gold goes, the word is a spare one, its place on the shelf is empty, and it is known', () => {
  const g = seasoned(new Game('warrior', 5), 1);
  const w = g.wordStock[1] as WordId;
  const had = g.hero.words[w];
  g.hero.gold = g.wordPrice() - 1;
  assert.equal(g.buyWord(1), 'Not enough gold');
  assert.equal(g.hero.words[w], had);
  assert.equal(g.wordStock[1], w, 'still on the shelf');
  g.hero.gold = g.wordPrice() + 7;
  assert.equal(g.buyWord(1), null);
  assert.equal(g.hero.gold, 7);
  assert.equal(g.hero.words[w], had + 1);
  assert.equal(g.wordStock[1], null);
  assert.equal(g.meta.known[w].found, true, 'a word bought is a word found: it has its page in the Lexicon');
  g.hero.gold = 99999;
  assert.equal(g.buyWord(1), 'Sold', 'the same place cannot be bought twice');
  assert.equal(g.hero.gold, 99999);
  // the other two are still his to sell
  assert.equal(g.buyWord(0), null);
  assert.equal(g.buyWord(2), null);
  assert.deepEqual(g.wordStock, [null, null, null]);
});

test('selling a word: only a spare one; he pays, keeps it for the visit, and gives it back for what he paid', () => {
  const g = seasoned(new Game('warrior', 5), 1);
  const [a, b] = WORD_IDS;
  for (const w of WORD_IDS) g.hero.words[w] = 0;
  g.hero.gold = 0;
  assert.equal(g.sellWord(a), 'No spare word');
  g.hero.words[a] = 2;
  g.hero.words[b] = 1;
  const pays = g.wordSellValue();
  assert.equal(g.sellWord(a), null);
  assert.equal(g.hero.gold, pays);
  assert.equal(g.hero.words[a], 1);
  assert.deepEqual(g.wordsSold, [a]);
  assert.equal(g.sellWord(b), null);
  assert.deepEqual(g.wordsSold, [a, b]);
  assert.equal(g.hero.gold, 2 * pays);
  // buying one back: the same price, and it leaves his keeping
  assert.equal(g.buyBackWord(5), 'Nothing there');
  assert.equal(g.buyBackWord(0), null);
  assert.equal(g.hero.gold, pays);
  assert.equal(g.hero.words[a], 2);
  assert.deepEqual(g.wordsSold, [b]);
  g.hero.gold = pays - 1;
  assert.equal(g.buyBackWord(0), 'Not enough gold');
  assert.deepEqual(g.wordsSold, [b]);
});

test('he has room for so many sold words: the oldest goes for good', () => {
  const g = seasoned(new Game('warrior', 5), 1);
  const w = WORD_IDS[2];
  g.hero.words[w] = TUNE.wordsSoldKept + 3;
  for (let i = 0; i < TUNE.wordsSoldKept + 3; i++) assert.equal(g.sellWord(w), null);
  assert.equal(g.wordsSold.length, TUNE.wordsSoldKept);
  assert.equal(g.hero.words[w], 0);
});

test('a saved run keeps which of his words were bought on this visit', () => {
  const g = seasoned(new Game('warrior', 5), 1);
  g.hero.gold = 99999;
  const shelf = g.wordStock.slice();
  assert.equal(g.buyWord(2), null);
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), g.meta);
  assert.equal(back.wordStock[2], null, 'the place that was bought is still empty');
  assert.equal(back.wordStock[0], shelf[0]);
  assert.equal(back.wordStock[1], shelf[1]);
});

test('the gamble: the price is three plain pieces of that kind, and what comes is of the kind thrown for', () => {
  const g = new Game('warrior', 5);
  for (let k = 0; k < GAMBLE_KINDS.length; k++) {
    assert.equal(g.gamblePrice(k), Math.max(1, Math.round(plainValue(GAMBLE_KINDS[k].slot, Math.max(1, g.depth)) * TUNE.gambleMult)));
  }
  assert.equal(g.gamblePrice(99), 0);
  assert.equal(g.gamble(99), 'Nothing there');
  g.hero.gold = g.gamblePrice(0) - 1;
  assert.equal(g.gamble(0), 'Not enough gold');
  assert.equal(g.won, -1);
  for (let k = 0; k < GAMBLE_KINDS.length; k++) {
    g.hero.bag.fill(null);
    g.hero.gold = 100000;
    const price = g.gamblePrice(k);
    assert.equal(g.gamble(k), null);
    assert.equal(g.hero.gold, 100000 - price, 'the price is the same whatever comes out');
    const it = g.hero.bag[g.won];
    assert.ok(it, 'the piece is in the bag, and `won` says where');
    if (!it) continue;
    const kind = GAMBLE_KINDS[k];
    // (a ring goes on either hand: its slot is said as the kind's)
    assert.equal(g.slotFor(it) === kind.slot || it.slot === kind.slot, true, `${kind.name}: a ${it.slot}`);
    if (kind.slot === 'mainhand' && kind.weapon) assert.equal(it.weapon, kind.weapon, `${kind.name}: the weapon thrown for`);
  }
  g.hero.bag.fill(g.hero.bag[g.won]);
  assert.equal(g.gamble(0), 'Bag is full');
});

test('the gamble\'s odds: most often plain, magic about a third of the time, rare about a tenth', () => {
  const g = new Game('warrior', 9);
  const seen = [0, 0, 0, 0];
  const throws = 4000;
  for (let i = 0; i < throws; i++) {
    g.hero.bag.fill(null);
    g.hero.gold = 100000;
    assert.equal(g.gamble(i % GAMBLE_KINDS.length), null);
    const it = g.hero.bag[g.won];
    if (it) seen[it.rarity]++;
  }
  const share = seen.map((n) => n / throws);
  assert.ok(Math.abs(share[1] - TUNE.gambleOdds.magic) < 0.04, `magic ${(share[1] * 100).toFixed(1)}% of the time (${TUNE.gambleOdds.magic * 100}% is meant)`);
  assert.ok(Math.abs(share[2] - TUNE.gambleOdds.rare) < 0.03, `rare ${(share[2] * 100).toFixed(1)}% (${TUNE.gambleOdds.rare * 100}% is meant)`);
  assert.ok(share[0] > 0.5, `plain more often than not (${(share[0] * 100).toFixed(1)}%)`);
  assert.equal(seen[3], 0, 'no unique pieces yet: there are none in the game');
});

test('the town\'s people say a line as the hero comes up to them: now and then, never the same twice running, never in a crowd', () => {
  for (const who of TOWN_FOLK) {
    assert.ok(TAGS.lines[who].length >= 4, `${who} has a few things to say`);
    for (const l of TAGS.lines[who]) assert.ok(l.length <= 34, `"${l}" is short enough to read at a glance`);
  }
  assert.ok(TAGS.chance > 0 && TAGS.chance < 1 && TAGS.gapAll >= 20 && TAGS.gapOne > TAGS.gapAll, 'sparsely');
  // the hero walks up to the armourer and away again, over and over, for a long while
  const g = new Game('warrior', 11);
  const said: { t: number; who: string; text: string }[] = [];
  const smith = g.level.props.find((p) => p.kind === 'armourer');
  assert.ok(smith);
  if (!smith) return;
  const far = { x: g.hero.x, y: g.hero.y };
  const near = { x: smith.x + 1.2, y: smith.y + 1.2 };
  const c = emptyControls();
  for (let i = 0; i < 6000; i++) {
    // (twenty seconds away, five beside him)
    const beside = i % 250 >= 200;
    g.hero.x = beside ? near.x : far.x;
    g.hero.y = beside ? near.y : far.y;
    g.update(0.1, c);
    for (const e of g.events as GameEvent[]) if (e.t === 'tag') said.push({ t: g.time, who: e.who, text: e.text });
    g.events.length = 0;
  }
  assert.ok(said.length >= 2, `in ten minutes of coming and going he spoke ${said.length} times`);
  assert.ok(said.length <= 600 / TAGS.gapOne + 1, 'and no more often than his own gap allows');
  for (const s of said) {
    assert.equal(s.who, 'armourer');
    assert.ok(TAGS.lines.armourer.includes(s.text));
  }
  for (let i = 1; i < said.length; i++) {
    assert.ok(said[i].t - said[i - 1].t >= TAGS.gapOne - 0.2, 'not again so soon');
    assert.notEqual(said[i].text, said[i - 1].text, 'and not the same line twice running');
  }
});
