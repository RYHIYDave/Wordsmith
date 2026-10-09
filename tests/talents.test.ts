// THE SKILL TREES (game/talents.ts, TALENTS: OFF until the owner has seen pictures and said yes).
// His answers of 8 Oct 2026, 15:16: ten points, one every five levels; big changes and small steps;
// the mage three paths (fire, lightning, frost), the ranger a path with forks like an arrow, the
// warrior's shape ours to find; a few talents that work with words.
//   run: tsx --test tests/talents.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import type { RunSave } from '../src/game/game';
import { TALENTS, TALENT_EVERY, TALENT_MAX, TALENT_TUNE, TREES, cleanTalents, nextTalentLevel, takeProblem, talentMods, talentOpen, talentPoints, unlearnProblem } from '../src/game/talents';
import { CLASS_IDS, WORD_IDS } from '../src/game/types';
import type { ClassId } from '../src/game/types';
import { wrapText } from '../src/engine/font';
import { seasoned } from './helpers';

/** With the switch on for a while, and off again after (the game's own until his yes). */
function on(fn: () => void): void {
  TALENTS.on = true;
  try {
    fn();
  } finally {
    TALENTS.on = false;
  }
}

test('the switch is off: no talents can be taken, and they add nothing', () => {
  assert.equal(TALENTS.on, false);
  const g = seasoned(new Game('mage', 3), 30);
  assert.equal(g.talentsLeft(), 0);
  assert.notEqual(g.talentProblem('kindling'), null);
  assert.notEqual(g.takeTalent('kindling'), null);
  assert.deepEqual(g.hero.talents, []);
  assert.deepEqual(talentMods('mage', ['kindling']), []);
  // (and a save holds nothing of them)
  assert.equal('talents' in g.save(), false);
});

test('ten points, one at every fifth level', () => {
  assert.equal(TALENT_EVERY, 5);
  assert.equal(TALENT_MAX, 10);
  assert.equal(talentPoints(1), 0);
  assert.equal(talentPoints(4), 0);
  assert.equal(talentPoints(5), 1);
  assert.equal(talentPoints(9), 1);
  assert.equal(talentPoints(10), 2);
  assert.equal(talentPoints(50), 10);
  assert.equal(talentPoints(70), 10);
  assert.equal(nextTalentLevel(1), 5);
  assert.equal(nextTalentLevel(12), 15);
  assert.equal(nextTalentLevel(50), null);
});

test('each class has fifteen talents in a shape of its own, every one reachable, more than the ten points can take', () => {
  for (const cls of CLASS_IDS) {
    const tree = TREES[cls];
    assert.equal(tree.cls, cls);
    assert.equal(tree.talents.length, 15, cls);
    const ids = tree.talents.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length, `${cls}: each id once`);
    for (const t of tree.talents) {
      for (const f of t.from) assert.ok(ids.includes(f), `${cls}: ${t.id} comes from ${f}, which is in the tree`);
      assert.ok(tree.paths.some((p) => p.id === t.path), `${cls}: ${t.id} is on a path of the tree`);
      if (t.word) assert.ok(WORD_IDS.includes(t.word), `${cls}: ${t.id} works with a word of the game`);
    }
    // (every talent can be reached from a place to start)
    const reach = new Set(tree.talents.filter((t) => !t.from.length).map((t) => t.id));
    assert.ok(reach.size >= 1, `${cls}: somewhere to start`);
    for (let n = 0; n < 20; n++) for (const t of tree.talents) if (t.from.some((f) => reach.has(f))) reach.add(t.id);
    assert.equal(reach.size, 15, `${cls}: every talent reachable`);
    // a mix: some big changes, more small steps; and a few that work with words
    const big = tree.talents.filter((t) => t.big).length;
    assert.ok(big >= 4 && big <= 6, `${cls}: ${big} big talents`);
    const worded = tree.talents.filter((t) => t.word).length;
    assert.ok(worded >= 2 && worded <= 4, `${cls}: ${worded} talents that work with words ("a few")`);
    // the figures and the paths' names stand by talents of the tree
    for (const p of tree.paths) assert.ok(ids.includes(p.label.node), `${cls}: ${p.id}'s name by ${p.label.node}`);
    for (const f of tree.figures ?? []) {
      const need = f.kind === 'fill' ? [...f.ids] : [f.pommel, f.guard, f.tip, ...f.quillons];
      for (const id of need) assert.ok(ids.includes(id), `${cls}: a figure through ${id}`);
    }
  }
});

test('the shapes: the mage three paths of five from her rune; the arrow two feathers to start from; the swords two pommels and a crossing that is both', () => {
  const mage = TREES.mage;
  assert.ok(mage.root, 'her rune');
  for (const path of ['fire', 'lightning', 'frost']) {
    const ts = mage.talents.filter((t) => t.path === path);
    assert.equal(ts.length, 5, path);
    assert.equal(ts.filter((t) => !t.from.length).length, 1, `${path} starts at her rune`);
    assert.ok(ts[ts.length - 1].big, `${path} ends in a big talent`);
  }
  const ranger = TREES.ranger;
  assert.deepEqual(ranger.talents.filter((t) => !t.from.length).map((t) => t.id).sort(), ['fleet', 'keeneye']);
  const point = ranger.talents.find((t) => t.id === 'farsight')!;
  assert.deepEqual([...point.from].sort(), ['hail', 'minefield', 'piercing'], "the arrow's barbs and middle meet at its point");
  const warrior = TREES.warrior;
  assert.deepEqual(warrior.talents.filter((t) => !t.from.length).map((t) => t.id).sort(), ['bloodlust', 'thickskin']);
  const cross = warrior.talents.find((t) => t.id === 'earthshaker')!;
  assert.deepEqual([...cross.from].sort(), ['battlerush', 'bulwark'], 'the crossing is reached from either sword');
  // (past the crossing, either sword's tip)
  assert.equal(talentOpen('warrior', ['bloodlust', 'fury', 'battlerush', 'earthshaker'], 'thorns'), true);
  assert.equal(talentOpen('warrior', ['bloodlust', 'fury', 'battlerush', 'earthshaker'], 'wrath'), true);
});

test('a talent is taken with a point, once, after one that leads to it', () => {
  assert.equal(takeProblem('mage', 4, [], 'kindling'), 'Next point at level 5');
  assert.equal(takeProblem('mage', 5, [], 'kindling'), null);
  assert.equal(takeProblem('mage', 5, [], 'searing'), 'Take the one before it first');
  assert.equal(takeProblem('mage', 10, ['kindling'], 'searing'), null);
  assert.equal(takeProblem('mage', 10, ['kindling'], 'kindling'), 'Taken');
  assert.equal(takeProblem('mage', 50, ['kindling', 'searing', 'flamewarp', 'fuel', 'inferno', 'charged', 'forking', 'stormwarp', 'overload', 'stormcaller'], 'bittercold'), 'No points left');
  assert.equal(takeProblem('ranger', 50, [], 'fleet'), null);
  assert.equal(takeProblem('ranger', 50, [], 'keeneye'), null);
  assert.equal(takeProblem('ranger', 50, ['fleet', 'steadyaim'], 'quickdraw'), null, 'the nock is a way onto the shaft');
  assert.equal(takeProblem('warrior', 50, [], 'mage-talent'), 'No such talent');
});

test('with the switch on: the game takes a talent, and a step that is a number adds to the hero', () => {
  on(() => {
    const g = seasoned(new Game('mage', 3), 10);
    assert.equal(g.talentsLeft(), 2);
    const before = g.hero.d.stats.firePct;
    const evs: string[] = [];
    assert.equal(g.takeTalent('searing'), 'Take the one before it first');
    assert.equal(g.takeTalent('kindling'), null);
    for (const e of g.events) if (e.t === 'talent') evs.push(e.id);
    assert.deepEqual(evs, ['kindling']);
    assert.equal(g.hero.d.stats.firePct, before + 25);
    assert.equal(g.talentsLeft(), 1);
    assert.equal(g.takeTalent('charged'), null);
    assert.equal(g.talentsLeft(), 0);
    assert.equal(g.takeTalent('searing'), 'Next point at level 15');
    const w = seasoned(new Game('warrior', 4), 5);
    const dmg = w.hero.d.stats.dmgPct;
    assert.equal(w.takeTalent('bloodlust'), null);
    assert.equal(w.hero.d.stats.dmgPct, dmg + 15);
  });
});

test('saved and restored with the hero; an old or damaged list is made safe', () => {
  on(() => {
    const g = seasoned(new Game('ranger', 5), 20);
    for (const id of ['keeneye', 'venom', 'quickdraw', 'longshot']) assert.equal(g.takeTalent(id), null);
    const s = g.save();
    assert.deepEqual(s.talents, ['keeneye', 'venom', 'quickdraw', 'longshot']);
    const back = Game.restore(JSON.parse(JSON.stringify(s)) as RunSave);
    assert.deepEqual(back.hero.talents, ['keeneye', 'venom', 'quickdraw', 'longshot']);
    assert.equal(back.hero.d.stats.critChance, g.hero.d.stats.critChance);
    // a save from before: none
    const old = { ...s } as Partial<RunSave>;
    delete old.talents;
    assert.deepEqual(Game.restore(old as RunSave).hero.talents, []);
  });
  // (damaged: another class's, twice, out of order, more than the level gives)
  assert.deepEqual(cleanTalents('ranger', 20, ['kindling', 'keeneye', 'keeneye', 'quickdraw', 'venom', 'quickdraw', 'longshot', 'lightstep']), ['keeneye', 'venom', 'quickdraw', 'longshot']);
  assert.deepEqual(cleanTalents('ranger', 20, 'nonsense'), []);
});

test("every talent's words fit its card in a few lines, in plain words", () => {
  for (const cls of CLASS_IDS as readonly ClassId[]) {
    for (const t of TREES[cls].talents) {
      const lines = wrapText(t.text, 136 - 10);
      assert.ok(lines.length <= 4, `${cls}: ${t.id} takes ${lines.length} lines`);
      assert.ok(t.name.length <= 14, `${cls}: ${t.name} is short`);
    }
  }
});

test('undoing a talent: in town, for gold, and only one that nothing taken hangs on alone', () => {
  // (the tree: what may be undone)
  assert.equal(unlearnProblem('mage', ['kindling', 'searing'], 'searing'), null, 'the last of a path');
  assert.equal(unlearnProblem('mage', ['kindling', 'searing'], 'kindling'), 'Undo the ones after it first');
  assert.equal(unlearnProblem('mage', ['kindling'], 'charged'), 'Not taken');
  // two ways onto the arrow's shaft: either feather may go while the other holds it
  assert.equal(unlearnProblem('ranger', ['fleet', 'windrunner', 'keeneye', 'venom', 'quickdraw'], 'venom'), null);
  assert.equal(unlearnProblem('ranger', ['fleet', 'windrunner', 'quickdraw'], 'windrunner'), 'Undo the ones after it first');
  on(() => {
    const g = seasoned(new Game('mage', 3), 10);
    assert.equal(g.takeTalent('kindling'), null);
    assert.equal(g.takeTalent('searing'), null);
    assert.equal(g.level.town, true, 'a new run begins in town');
    assert.equal(g.unlearnPrice(), TALENT_TUNE.unlearnPerLevel * 10);
    g.hero.gold = 0;
    assert.equal(g.unlearnTalent('searing'), `Needs ${g.unlearnPrice()} gold`);
    g.hero.gold = 1000;
    assert.equal(g.unlearnTalent('kindling'), 'Undo the ones after it first');
    assert.equal(g.unlearnTalent('searing'), null);
    assert.deepEqual(g.hero.talents, ['kindling']);
    assert.equal(g.hero.gold, 1000 - TALENT_TUNE.unlearnPerLevel * 10);
    assert.equal(g.talentsLeft(), 1, 'the point back to spend');
    // out of town: not there
    g.enterDungeon();
    assert.equal(g.unlearnTalent('kindling'), 'Undone in town only');
  });
});
