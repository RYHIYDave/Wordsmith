// WORDS BY FLOOR (game/types.ts WORD_TIERS, wordsAt; his 4 Nov 2026, 19:07, and 8 Nov: “We need 6 in the prison because we have 6
// characters and they should each get a different word”, “I want frost for the mage and fire for the warlock.”): the prison's six on
// floors 1 to 5, the thirteen from floor 6, all from 11; each hero's first word his own, one of the prison's six.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { DEEP_WORDS_FROM, LAST_WORDS_FROM, LAST_WORD_IDS, PRISON_WORD_IDS, WORD_IDS, WORD_TIERS, wordsAt } from '../src/game/types';
import { FIRST_WORD } from '../src/game/defs';

test('the prison (floors 1 to 5) has its six words; floors 6 to 10 the thirteen and his three of 9 Nov; the city all but the last words', () => {
  assert.equal(WORD_TIERS.on, true);
  for (let d = 1; d < WORD_TIERS.mid; d++) assert.deepEqual([...wordsAt(d)].sort(), [...PRISON_WORD_IDS].sort(), `floor ${d}`);
  assert.equal(PRISON_WORD_IDS.length, 6);
  for (const w of ['power', 'poison', 'frost', 'fire', 'lightning', 'swift']) assert.ok(PRISON_WORD_IDS.includes(w as never), w);
  for (let d = WORD_TIERS.mid; d < DEEP_WORDS_FROM; d++) {
    const ws = wordsAt(d);
    // (and his three of 9 Nov 2026, Lasting, Fleeting and Vast, found from floor 6 like Precise and Heavy)
    assert.equal(ws.length, 16, `floor ${d}`);
    for (const w of ['leech', 'twin', 'precise', 'heavy', 'frenzied', 'volatile', 'guarding', 'lasting', 'fleeting', 'vast']) assert.ok(ws.includes(w as never), `${w} on floor ${d}`);
  }
  // (from 11 all but the last words, found from 16: LAST_WORDS_FROM)
  assert.deepEqual(wordsAt(DEEP_WORDS_FROM), WORD_IDS.filter((w) => !LAST_WORD_IDS.includes(w)));
  assert.deepEqual(wordsAt(LAST_WORDS_FROM), WORD_IDS);
});

test("each hero's first word is his own, one of the prison's six, as he picked them", () => {
  const firsts = Object.values(FIRST_WORD).map((f) => f.word);
  assert.equal(new Set(firsts).size, 6, 'six heroes, six words');
  for (const w of firsts) assert.ok(PRISON_WORD_IDS.includes(w), w);
  assert.equal(FIRST_WORD.warrior.word, 'power');
  assert.equal(FIRST_WORD.ranger.word, 'poison');
  assert.equal(FIRST_WORD.mage.word, 'frost');
  assert.equal(FIRST_WORD.warlock.word, 'fire');
  assert.equal(FIRST_WORD.tinkerer.word, 'lightning');
  assert.equal(FIRST_WORD.brawler.word, 'swift');
});
