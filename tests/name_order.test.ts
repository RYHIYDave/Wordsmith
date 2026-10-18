// NAMES BY ORDER (game/words.ts, behind NAME_ORDER, off) and THE RISING NAME IN ITS COLOURS (render/fx.ts,
// behind NAME_RAINBOW, off). The owner, 18 Oct 2026, 09:41: "When the name of the ability comes up, it seems
// like the color of the whole name changes.  I like it when all the words are their respective rune color and
// the word is all rainbowed out"; 09:45: "Like if you wanted precise and flame on the before side, Flaming
// Precise Strike and Precision Flame Strike are the same, but the wording changes based on where words are put
// in the chain."
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SKILLS, WORDS } from '../src/game/defs';
import { RANK_IDS, RANK_OF, WORD_IDS, MELD_IDS } from '../src/game/types';
import type { WordId } from '../src/game/types';
import { LEAD_FORM, NAME_ORDER, frontNames, leadForm, resolveSkill, skillName } from '../src/game/words';
import { Game } from '../src/game/game';
import { NAME_RAINBOW } from '../src/render/fx';

function ordered(fn: () => void): void {
  const was = NAME_ORDER.on;
  NAME_ORDER.on = true;
  try {
    fn();
  } finally {
    NAME_ORDER.on = was;
  }
}

test('both switches are off, and with them off a name reads as it always has', () => {
  assert.equal(NAME_ORDER.on, false);
  assert.equal(NAME_RAINBOW.on, false);
  assert.equal(skillName(SKILLS.strike, ['fire', 'precise'], [null, null]), 'Flame Precise Strike');
  assert.equal(skillName(SKILLS.strike, ['precise', 'fire'], [null, null]), 'Precise Flame Strike');
  assert.equal(skillName(SKILLS.orb, ['twin', 'fire'], ['swift', 'volatile']), 'Twin Flame Orb of Swiftness and Ruin');
});

test('his two names: Flaming Precise Strike and Precision Flame Strike, the same attack', () => ordered(() => {
  assert.equal(skillName(SKILLS.strike, ['fire', 'precise'], [null, null]), 'Flaming Precise Strike');
  assert.equal(skillName(SKILLS.strike, ['precise', 'fire'], [null, null]), 'Precision Flame Strike');
  // what it does is the same either way: only the name differs
  const g = Game.forPractice('warrior', 5);
  const a = resolveSkill(SKILLS.strike, ['fire', 'precise'], [null, null], 'str', g.hero.d);
  const b = resolveSkill(SKILLS.strike, ['precise', 'fire'], [null, null], 'str', g.hero.d);
  assert.deepEqual({ ...a, name: '', lines: [] }, { ...b, name: '', lines: [] });
  assert.notEqual(a.name, b.name);
}));

test('only the first of two in front changes: one word alone, the word by the name, and words behind read as before', () => ordered(() => {
  for (const w of WORD_IDS) {
    assert.equal(skillName(SKILLS.shot, [w, null], [null, null]), `${WORDS[w].front} Shot`, `${w} alone`);
    assert.equal(skillName(SKILLS.shot, [null, w], [null, null]), `${WORDS[w].front} Shot`, `${w} alone, in the second socket`);
  }
  assert.equal(skillName(SKILLS.orb, ['twin', 'fire'], ['swift', 'volatile']), 'Echo Flame Orb of Swiftness and Ruin');
  assert.deepEqual(frontNames(['heavy', 'poison']).map((p) => p.text), ['Crushing', 'Poison']);
}));

test('every word has a leading form of its own, none empty and none twice; a ranked word leads as its word', () => {
  const all = [...WORD_IDS, ...MELD_IDS] as (keyof typeof LEAD_FORM)[];
  for (const w of all) assert.ok(LEAD_FORM[w] && LEAD_FORM[w].trim() === LEAD_FORM[w], `${w}`);
  assert.equal(new Set(all.map((w) => LEAD_FORM[w])).size, all.length, 'no two words lead alike');
  for (const r of RANK_IDS) assert.equal(leadForm(r as WordId), LEAD_FORM[RANK_OF[r].word]);
});
