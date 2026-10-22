// THE WORDS' ATTRIBUTES, EVENED (game/defs.ts ATTR_SPLIT; the owner, 17 Oct 2026, 13:05: "Yes for the words.  How many does
// that leave for the other classes?  Is it an evenish split between the attributes?"; 13:22: "Yeah that’s a good split").
// Power's melds grow with Strength, Poison's other three with Dexterity, the other three with Intelligence; fire, frost and
// lightning set alone with the weapon's attribute (the class's on the evasive move); every other word as before. Its
// cards say so. Off, everything as before.
//   run: tsx --test tests/attr_split.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { ATTR_SPLIT, SKILLS, WORDS, growsWith, wordAttr } from '../src/game/defs';
import { Game } from '../src/game/game';
import type { Derived } from '../src/game/state';
import { ALL_WORD_IDS, MELD_IDS, MELD_OF } from '../src/game/types';
import { resolveSkill } from '../src/game/words';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert = nodeAssert as { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void };
const near = (a: number, b: number, what: string): void => assert.ok(Math.abs(a - b) < 1e-9, `${what}: ${a} against ${b}`);

/** A hero's numbers with these attributes. */
function hero(str: number, dex: number, int: number): Derived {
  return { ...Game.forPractice('warrior', 5).hero.d, str, dex, int };
}

test('the split as he said yes to it: Power\'s melds Strength, Poison\'s other three Dexterity, the rest Intelligence; fire, frost and lightning by the weapon', () => {
  assert.equal(ATTR_SPLIT.on, true, 'on, his word');
  const of = (a: string | null): string[] => ALL_WORD_IDS.filter((w) => wordAttr(w) === a);
  assert.deepEqual(of('str'), ['power', 'leech', 'heavy', 'frenzied', 'guarding', 'eruption', 'avalanche', 'thunder', 'blight'], 'Strength, nine');
  // (THE CITY'S WORDS, Version 23.8: Splitting by Dexterity, Pulling, Hexing and Stilling by Intelligence, as his doc has them)
  assert.deepEqual(of('dex'), ['swift', 'twin', 'poison', 'precise', 'splitting', 'fumes', 'frostbite', 'contagion'], 'Dexterity, eight');
  assert.deepEqual(of('int'), ['volatile', 'pulling', 'hexing', 'stilling', 'scald', 'wildfire', 'hailstorm'], 'Intelligence, seven of its own');
  assert.deepEqual(of(null), ['fire', 'frost', 'lightning'], 'and the three elements by the weapon (on the mage\'s staff and wand, Intelligence: seven)');
  for (const m of MELD_IDS) {
    const [a, b] = MELD_OF[m];
    const want = a === 'power' ? 'str' : a === 'poison' || b === 'poison' ? 'dex' : 'int';
    assert.equal(wordAttr(m), want, `${m}: ${want}`);
  }
  // (its card)
  assert.equal(growsWith('eruption'), 'grows with Strength');
  assert.equal(growsWith('fumes'), 'grows with Dexterity');
  assert.equal(growsWith('scald'), 'grows with Intelligence');
  assert.equal(growsWith('fire'), "grows with your weapon's attribute");
  assert.equal(growsWith('power'), 'grows with Strength');
});

test('a melded word\'s two words grow with its attribute; fire, frost and lightning alone with the weapon\'s', () => {
  const strong = hero(120, 10, 10);
  const nimble = hero(10, 120, 10);
  const clever = hero(10, 10, 120);
  const strike = SKILLS.strike;
  // ERUPTION (Power and Flame): its burn grows with Strength, wherever it is set
  for (const grows of ['str', 'dex', 'int'] as const) {
    near(resolveSkill(strike, ['eruption', null], [null, null], grows, strong).ignite, (30 + 0.8 * 120) / 100, `Eruption's burn, strong, on a ${grows} attack`);
    near(resolveSkill(strike, ['eruption', null], [null, null], grows, clever).ignite, (30 + 0.8 * 10) / 100, `Eruption's burn, clever, on a ${grows} attack`);
  }
  // FUMES (Flame and Poison): both with Dexterity
  const fumes = resolveSkill(SKILLS.shot, ['fumes', null], [null, null], 'dex', nimble);
  near(fumes.ignite, (30 + 0.8 * 120) / 100, 'Fumes\' burn with Dexterity');
  near(fumes.poison, (20 + 0.4 * 120) / 100, 'Fumes\' poison with Dexterity');
  // SCALD (Flame and Frost): Intelligence
  near(resolveSkill(SKILLS.orb, ['scald', null], [null, null], 'int', clever).chill, Math.min(70, 30 + 0.3 * 120) / 100, 'Scald\'s chill with Intelligence');
  near(resolveSkill(SKILLS.orb, ['scald', null], [null, null], 'int', strong).chill, Math.min(70, 30 + 0.3 * 10) / 100, 'and not with Strength');
  // FLAME alone: the weapon's
  near(resolveSkill(strike, ['fire', null], [null, null], 'str', strong).ignite, (30 + 0.8 * 120) / 100, 'Flame on a sword: Strength');
  near(resolveSkill(SKILLS.shot, ['fire', null], [null, null], 'dex', nimble).ignite, (30 + 0.8 * 120) / 100, 'Flame on a bow: Dexterity');
  near(resolveSkill(SKILLS.orb, ['fire', null], [null, null], 'int', clever).ignite, (30 + 0.8 * 120) / 100, 'Flame on a staff: Intelligence');
  near(resolveSkill(strike, ['fire', null], [null, null], 'str', clever).ignite, (30 + 0.8 * 10) / 100, 'and a clever warrior\'s sword gets nothing of it');
  // (on the evasive move, the class's: the warrior's Leap, Strength)
  near(resolveSkill(SKILLS.leap, ['fire', null], [null, null], 'warrior', strong).ignite, (30 + 0.8 * 120) / 100, 'Flame on Leap: the warrior\'s Strength');
  // LIGHTNING alone on a sword: its arcs and their count with Strength
  const bolt = resolveSkill(strike, ['lightning', null], [null, null], 'str', strong);
  near(bolt.arcDmg, (40 + 0.5 * 120) / 100, 'Lightning\'s arcs with Strength');
  assert.equal(bolt.arcs, 2 + Math.floor(120 / 40), 'and how many');
  // BEHIND: Flame's burning ground on a bow, Dexterity; Eruption behind, Strength
  near(resolveSkill(SKILLS.shot, [null, null], ['fire', null], 'dex', nimble).zone!.dps, (25 + 0.6 * 120) / 100, 'of Flame on a bow: Dexterity');
  near(resolveSkill(SKILLS.shot, [null, null], ['eruption', null], 'dex', strong).zone!.dps, (25 + 0.6 * 120) / 100, 'of Eruption: Strength');
  // every other word as before: Power with Strength
  assert.ok(resolveSkill(strike, ['power', null], [null, null], 'str', strong).dmgMult > resolveSkill(strike, ['power', null], [null, null], 'str', clever).dmgMult, 'Power with Strength');
});

test('off: every word with its own, as before', () => {
  const clever = hero(10, 10, 120);
  const strong = hero(120, 10, 10);
  ATTR_SPLIT.on = false;
  try {
    near(resolveSkill(SKILLS.strike, ['fire', null], [null, null], 'str', clever).ignite, (30 + 0.8 * 120) / 100, 'Flame with Intelligence, whatever the weapon');
    near(resolveSkill(SKILLS.strike, ['eruption', null], [null, null], 'str', strong).ignite, (30 + 0.8 * 10) / 100, 'Eruption\'s burn with Intelligence (Flame\'s own)');
    assert.equal(resolveSkill(SKILLS.strike, ['lightning', null], [null, null], 'str', clever).arcs, 2 + Math.floor(120 / 40), 'Lightning\'s arcs by Intelligence');
    for (const w of ALL_WORD_IDS) assert.equal(wordAttr(w), WORDS[w].attr, `${w}: its own`);
  } finally {
    ATTR_SPLIT.on = true;
  }
});
