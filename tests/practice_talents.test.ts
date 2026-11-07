// IN PRACTICE, EVERY TALENT POINT (game.ts PRACTICE_TALENTS). His words, 7 Nov 2026, 15:12: “And can I get all the talent points
// in practice mode?”
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { TALENT_MAX, TREES } from '../src/game/talents';

test('the practice hero has every point to spend; a hero in a run has his level\'s', () => {
  for (const cls of ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'] as const) {
    const g = Game.forPractice(cls, 3);
    assert.equal(g.talentsLeft(), TALENT_MAX, `${cls} in practice`);
    const run = new Game(cls, 3);
    run.hero.level = 10;
    assert.equal(run.talentsLeft(), 2, `${cls} at level 10 in a run`);
  }
});

test('in practice, talents can be taken past what his level would give', () => {
  const g = Game.forPractice('warrior', 3);
  let took = 0;
  for (let pass = 0; pass < 12 && g.talentsLeft() > 0; pass++) {
    for (const t of TREES.warrior.talents) if (g.talentsLeft() > 0 && g.talentProblem(t.id) === null && g.takeTalent(t.id) === null) took++;
  }
  assert.ok(took > 2, `${took} taken (his level would give 2)`);
});
