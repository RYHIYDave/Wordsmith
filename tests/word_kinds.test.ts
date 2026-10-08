// THE TWO KINDS OF WORD, AND ATTACKS AND SPELLS (src/game/defs.ts, WordKind, SPELL_SKILLS): the
// doc "Wordsmith: The New Words", his yes of 8 Oct 2026, 16:53 ("Yes, as it is (Recommended)"; of
// one damage word on each side, "Yes, one a side (Recommended)").
//   run: tsx --test tests/word_kinds.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { SKILLS, SPELL_SKILLS, WORDS, isSpell } from '../src/game/defs';
import type { SkillId } from '../src/game/defs';
import { Game } from '../src/game/game';
import type { RunSave } from '../src/game/game';
import { WORD_IDS } from '../src/game/types';
import { socketProblem } from '../src/game/words';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

test('every word is a damage word or a shaping word: the damage words add damage, the rest shape', () => {
  for (const w of WORD_IDS) assert.ok(WORDS[w].kind === 'damage' || WORDS[w].kind === 'shape', w);
  const damage = WORD_IDS.filter((w) => WORDS[w].kind === 'damage');
  assert.deepEqual([...damage].sort(), ['fire', 'frost', 'lightning', 'poison', 'power']);
  // (his words: Swift, Twin, Leech and Volatile are shaping words)
  for (const w of ['swift', 'twin', 'leech', 'volatile'] as const) assert.equal(WORDS[w].kind, 'shape', w);
  // (every element is a damage word)
  for (const w of WORD_IDS) if (WORDS[w].element) assert.equal(WORDS[w].kind, 'damage', w);
});

test('attacks and spells: the staff and the wand cast spells, and so does the mage\'s Warp; the rest are attacks', () => {
  const spells = (Object.keys(SKILLS) as SkillId[]).filter((id) => isSpell(id)).sort();
  assert.deepEqual(spells, ['beam', 'familiar', 'orb', 'warp', 'wave']);
  for (const id of ['strike', 'slam', 'whirlwind', 'leap', 'shot', 'volley', 'trap'] as const) assert.equal(isSpell(id), false, id);
  assert.equal(SPELL_SKILLS.size, 5);
});

test('one damage word on each side: a second is refused, whichever two; a shaping word beside one is not', () => {
  const damage = WORD_IDS.filter((w) => WORDS[w].kind === 'damage');
  const shape = WORD_IDS.filter((w) => WORDS[w].kind === 'shape');
  for (const a of damage) {
    for (const b of damage) if (a !== b) assert.equal(socketProblem([a, null], b), 'One damage word per side', `${a} then ${b}`);
    for (const b of shape) {
      assert.equal(socketProblem([a, null], b), null, `${a} then ${b}`);
      assert.equal(socketProblem([b, null], a), null, `${b} then ${a}`);
    }
  }
  for (const a of shape) for (const b of shape) if (a !== b) assert.equal(socketProblem([a, null], b), null, `${a} then ${b}`);
});

test('a hero saved with two damage words on a side keeps the first; the other goes back to the pouch', () => {
  const g = new Game('warrior', 12);
  g.hero.level = 12;
  g.refresh();
  const s = g.save();
  // (as a save from before Version 19.3 could hold it: Power and Flame in front, Frost and Poison behind)
  s.sockets[0] = { front: ['power', 'fire'], behind: ['frost', 'poison'] };
  const w = Game.restore(JSON.parse(JSON.stringify(s)) as RunSave);
  assert.deepEqual(w.hero.skills[0].front, ['power', null]);
  assert.deepEqual(w.hero.skills[0].behind, ['frost', null]);
  assert.equal(w.hero.words.fire, s.words.fire + 1);
  assert.equal(w.hero.words.poison, s.words.poison + 1);
  // (and a shaping word beside a damage word stays where it is)
  s.sockets[0] = { front: ['power', 'swift'], behind: ['twin', 'frost'] };
  const v = Game.restore(JSON.parse(JSON.stringify(s)) as RunSave);
  assert.deepEqual(v.hero.skills[0].front, ['power', 'swift']);
  assert.deepEqual(v.hero.skills[0].behind, ['twin', 'frost']);
});
