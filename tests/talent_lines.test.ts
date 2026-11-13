// THE LINES WORK BOTH WAYS (game/talents.ts BOTH_WAYS). His words, 12 Nov 2026, 18:09: “i cant go from quick draw to venom in the
// skill tree for the ranger”; his pick: “Every tree, both ways (Recommended)”. Checks:
//   1. the Ranger: from Quick Draw (reached by Steady Aim) Venom and Windrunner are open, and are taken;
//   2. every tree: a talent joined by a line to one taken is open, the one before it or one after it;
//   3. the Warrior's weapons: with one weapon his, the other two weapons' paths stay shut, even where a line joins them;
//   4. undoing: a talent may be undone while what hangs on it is still joined to the start some other way; off, as it was.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BOTH_WAYS, TREES, joinedTo, takeProblem, talentOpen, unlearnProblem } from '../src/game/talents';
import { CLASS_IDS } from '../src/game/types';

const LV = 60;

test('1. the Ranger: from Quick Draw, Venom and Windrunner are open, and are taken', () => {
  assert.equal(BOTH_WAYS.on, true);
  const taken = ['fleet', 'steadyaim', 'quickdraw'];
  assert.ok(talentOpen('ranger', taken, 'venom'));
  assert.ok(talentOpen('ranger', taken, 'windrunner'));
  assert.equal(takeProblem('ranger', LV, taken, 'venom'), null);
  // (and Keen Eye, where the other feather begins, is open as it always was)
  assert.equal(takeProblem('ranger', LV, [...taken, 'venom'], 'keeneye'), null);
});

test('2. every tree: a talent joined by a line to one taken is open, before it or after it', () => {
  for (const cls of CLASS_IDS) {
    const tree = TREES[cls];
    for (const t of tree.talents) {
      for (const j of joinedTo(cls, t)) {
        const other = tree.talents.find((q) => q.id === j)!;
        // (the Warrior's weapon paths: below)
        if (cls === 'warrior' && ['axe', 'gsword', 'hammer'].includes(t.path)) continue;
        const roots = tree.talents.filter((q) => !q.from.length).map((q) => q.id);
        assert.ok(talentOpen(cls, [...roots, j], t.id) || t.id === j || roots.includes(t.id), `${cls}: ${t.id} shut with ${other.id} taken`);
      }
    }
  }
});

test("3. the Warrior's weapons: the other two weapons' paths stay shut, even where a line joins them", () => {
  // (the battle axe's Red Mist, then Honed Edge between the axe and the sword: the sword's Drilled Lunge stays shut)
  const taken = ['battleaxe', 'rend', 'redmist', 'honededge'];
  assert.equal(takeProblem('warrior', LV, taken, 'drilledleap'), 'Not your weapon');
  assert.ok(!talentOpen('warrior', taken, 'drilledleap'));
  // (his own path's, walked down from the top, open)
  assert.ok(talentOpen('warrior', ['battleaxe', 'rend', 'redmist', 'headlong'], 'twinaxes'));
});

test('4. undoing: allowed while what hangs on it is still joined to the start another way; off, as it was', () => {
  // (Quick Draw reached from both feathers: either feather's middle may be undone)
  const taken = ['fleet', 'windrunner', 'keeneye', 'venom', 'quickdraw'];
  assert.equal(unlearnProblem('ranger', taken, 'venom'), null);
  assert.equal(unlearnProblem('ranger', taken, 'windrunner'), null);
  // (Long Shot hangs on Quick Draw alone)
  assert.notEqual(unlearnProblem('ranger', [...taken, 'longshot'], 'quickdraw'), null);
  BOTH_WAYS.on = false;
  try {
    assert.ok(!talentOpen('ranger', ['fleet', 'steadyaim', 'quickdraw'], 'venom'));
  } finally {
    BOTH_WAYS.on = true;
  }
});
