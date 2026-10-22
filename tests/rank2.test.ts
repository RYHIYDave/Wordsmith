// RANK II (game/melds.ts, behind RANK2, off). The owner, 18 Oct 2026, 08:49: "Please add the second level
// (poison+poison) melding into the game"; to the reading (two of a damage word and a meld's runedust make it
// rank II; half as strong again, his stats on top; rank II only for now; attacks only), 08:56: "Yep go".
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SKILLS, WORDS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { imbueProblem } from '../src/game/items';
import { MELD, MELD_TUNE, RANK2, VOLT_MELDS, isDamageWord, meldOf, meldProblem, partsOf, savedWords, withParts, wordIds } from '../src/game/melds';
import { RANK_IDS, RANK_OF, WORD_IDS } from '../src/game/types';
import type { WordId } from '../src/game/types';
import { resolveSkill, socketProblem } from '../src/game/words';
import { seasoned } from './helpers';

function ranking(fn: () => void): void {
  const was = RANK2.on;
  RANK2.on = true;
  try {
    fn();
  } finally {
    RANK2.on = was;
  }
}

const BASES = ['power', 'fire', 'frost', 'lightning', 'poison'] as const;

// (VERSION 23.7: RANK2 on in the game, his “Yes, put it in (Recommended)” of 21 Oct 2026: the switch is seen on, and turned
// off here to hold the game as it was without it)
test('the switch is on in the game; with it off two of a word do not meld, and no ranked word is kept over', () => {
  assert.equal(RANK2.on, true);
  RANK2.on = false;
  try {
  assert.equal(meldOf('poison', 'poison'), null);
  assert.equal(meldProblem('poison', 'poison'), 'Two different words');
  for (const r of RANK_IDS) assert.ok(!wordIds().includes(r), `${r} is not among the hero's words`);
  const rec = {} as Record<WordId, number>;
  for (const w of [...wordIds(), ...RANK_IDS]) rec[w] = 1;
  for (const r of RANK_IDS) assert.ok(!(r in savedWords(rec)), `${r} is not written to a save`);
  } finally {
    RANK2.on = true;
  }
});

test('two of each damage word make its rank II, and nothing else does; a ranked word melds no further', () => ranking(() => {
  assert.ok(MELD.on);
  for (const b of BASES) {
    const r = meldOf(b, b);
    assert.ok(r !== null && RANK_OF[r as keyof typeof RANK_OF].word === b && RANK_OF[r as keyof typeof RANK_OF].rank === 2, `${b} + ${b}`);
    assert.equal(meldProblem(b, b), null, `${b} + ${b} melds`);
    assert.equal(WORDS[r as WordId].name, `${WORDS[b].name} II`);
  }
  for (const w of ['swift', 'twin', 'leech', 'volatile', 'heavy', 'precise', 'frenzied', 'guarding'] as const) {
    assert.equal(meldOf(w, w), null, `${w} + ${w}`);
    assert.equal(meldProblem(w, w), VOLT_MELDS.on ? 'Only damage words and Volatile meld' : 'Only damage words meld');
  }
  assert.equal(meldOf('eruption', 'eruption'), null, 'a melded word does not rank up');
  assert.equal(meldProblem('poison2', 'poison2'), 'Rank II is the top, for now');
  assert.equal(meldProblem('poison2', 'fire'), 'A ranked word melds no further');
  assert.equal(meldOf('fire', 'frost'), 'scald', 'two different words meld as before');
  for (const r of RANK_IDS) {
    assert.ok(!WORD_IDS.includes(r), `${r} never drops`);
    assert.ok(wordIds().includes(r), `${r} is among the hero's words`);
    assert.ok(isDamageWord(r));
    assert.deepEqual(partsOf(r), [RANK_OF[r].word]);
    assert.deepEqual(withParts([r, null]), [RANK_OF[r].word]);
  }
  assert.equal(socketProblem(['poison2', null], 'fire'), 'One damage word per side', 'a ranked word takes its side\'s one damage-word place');
}));

test('a rank II word is its word half as strong again, the attribute adding on top as before', () => ranking(() => {
  const g = Game.forPractice('ranger', 5);
  const def = SKILLS.shot;
  for (const a of [0, 40]) {
    const d = { ...g.hero.d, str: a, dex: a, int: a };
    const fr = (w: WordId) => resolveSkill(def, [w, null], [null, null], 'dex', d);
    const bh = (w: WordId) => resolveSkill(def, [null, null], [w, null], 'dex', d);
    const near = (x: number, y: number, why: string): void => assert.ok(Math.abs(x - y) < 1e-9, `${why}: ${x} against ${y}`);
    // in front
    near(fr('poison2').poison - fr('poison').poison, 0.1, `Poison in front, attribute ${a}`);
    near(fr('fire2').ignite - fr('fire').ignite, 0.15, `Flame in front, attribute ${a}`);
    near(fr('lightning2').arcDmg - fr('lightning').arcDmg, 0.2, `Lightning in front, attribute ${a}`);
    near(Math.min(0.7, fr('frost').chill + 0.15), fr('frost2').chill, `Frost in front, attribute ${a} (its limit, 70%)`);
    assert.ok(fr('power2').dmgMult > fr('power').dmgMult, `Power in front hits harder, attribute ${a}`);
    // behind
    near(bh('poison2').cloud - bh('poison').cloud, 0.125, `of Venom, attribute ${a}`);
    near(bh('power2').might - bh('power').might, 3, `of Power, attribute ${a}`);
    near((bh('fire2').zone?.dps ?? 0) - (bh('fire').zone?.dps ?? 0), 0.125, `of Flame, attribute ${a}`);
    near((bh('lightning2').zone?.dps ?? 0) - (bh('lightning').zone?.dps ?? 0), 0.15, `of Lightning, attribute ${a}`);
    near(Math.min(0.75, (bh('frost').zone?.slow ?? 0) + 0.2), bh('frost2').zone?.slow ?? 0, `of Frost's slow, attribute ${a} (its limit, 75%)`);
  }
  // at no attribute, his table's figures for Poison: 20% a second becomes 30, the cloud's 25% becomes 37.5
  const d0 = { ...g.hero.d, str: 0, dex: 0, int: 0 };
  assert.equal(resolveSkill(def, ['poison', null], [null, null], 'dex', d0).poison, 0.2);
  assert.ok(Math.abs(resolveSkill(def, ['poison2', null], [null, null], 'dex', d0).poison - 0.3) < 1e-9);
  assert.ok(Math.abs(resolveSkill(def, [null, null], ['poison2', null], 'dex', d0).cloud - 0.375) < 1e-9);
  // the attack's card says which rank
  assert.ok(resolveSkill(def, ['poison2', null], [null, null], 'dex', d0).lines.some((l) => l.startsWith('Poison II:')));
  assert.ok(resolveSkill(def, [null, null], ['poison2', null], 'dex', d0).lines.some((l) => l.startsWith('of Venom II:')));
  // and the attack's name is its word's
  assert.equal(resolveSkill(def, ['poison2', null], [null, null], 'dex', d0).name, resolveSkill(def, ['poison', null], [null, null], 'dex', d0).name);
}));

test('the wordsmith melds two Poison into Poison II for a meld\'s runedust; one Poison is not enough', () => ranking(() => {
  const g = seasoned(new Game('warrior', 7), 10);
  const h = g.hero;
  h.meld = 'open';
  h.dust = 3;
  h.words.poison = 1;
  assert.equal(g.meldProblem('poison', 'poison'), 'Two of the word go in');
  h.words.poison = 2;
  assert.equal(g.meldProblem('poison', 'poison'), null);
  assert.equal(g.meldWords('poison', 'poison'), null);
  assert.equal(h.words.poison, 0, 'both used up');
  assert.equal(h.words.poison2, 1, 'Poison II in the pouch');
  assert.equal(h.dust, 3 - MELD_TUNE.cost, 'a meld\'s runedust');
  assert.equal(g.melded?.word, 'poison2');
  assert.equal(g.meldProblem('poison2', 'poison2'), 'Rank II is the top, for now');
}));

test('a ranked word goes on attacks only: not burned into gear, not laid on the gate, not kept in the Lexicon', () => ranking(() => {
  const g = seasoned(new Game('warrior', 8), 10);
  const h = g.hero;
  h.words.poison2 = 1;
  assert.equal(g.planProblem('poison2'), 'A ranked word goes on attacks only');
  assert.equal(g.depositWord('poison2'), 'The Lexicon keeps no ranked word');
  const piece = Object.values(h.gear).find((it) => it) ?? h.bag.find((it) => it);
  if (piece) assert.equal(imbueProblem(piece, 'poison2'), 'A ranked word goes on attacks only');
}));
