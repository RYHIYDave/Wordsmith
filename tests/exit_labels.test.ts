// THE EXITS' NAMES (game/exit_labels.ts, behind EXIT_LABELS, off until his yes). The owner, 23 Oct 2026, 11:37 (Pacific):
// “I’d like the exits to be labeled like the stash once they open when the boss dies.”; asked what a label says, by 11:38:
// “What it is”.
//
// What is held here: on a floor of each kind, no name while the boss lives; once he has fallen and the way has opened, its
// name (STAIRS, CAVE, CAGE, the ways on of floors 6 to 10 by what each is, WAY ON for a column of light), at the way; none
// in town.
//   run: tsx --test tests/exit_labels.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { EXIT_LABELS, ONWARD_NAME, exitLabels } from '../src/game/exit_labels';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { CAVE_OPENING, ONWARD, SHAFT, STAIR_OPENING } from '../src/game/ways';

const DT = 1 / 30;
function run(g: Game, secs: number): void {
  for (let k = 0; k < secs / DT; k++) {
    g.events.length = 0;
    g.update(DT, emptyControls());
  }
}
/** A game on floor `depth`, the boss's company gone, the hero kept alive and well away from the boss's ground. */
function on(depth: number, seed = 5): Game {
  const g = new Game('warrior', seed);
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  g.hero.invuln = 1e9;
  for (const m of g.monsters) if (!m.boss) m.dead = true;
  return g;
}
function fell(g: Game): void {
  for (let k = 0; k < 6 && g.boss; k++) {
    g.bossReady();
    g.kill(g.boss);
  }
  const on = g.level.ways?.onward;
  if (on && !on.awake) {
    on.awake = true;
    on.warpAt = g.time;
  }
}

test('the switch, off until his yes', () => {
  assert.equal(EXIT_LABELS.on, false);
});

test('no name while the boss lives; once the way has opened, what it is', () => {
  const cases: { depth: number; name: string; wait: number }[] = [
    { depth: 2, name: 'STAIRS', wait: STAIR_OPENING + 0.5 },
    { depth: 4, name: 'CAVE', wait: CAVE_OPENING + 0.5 },
    { depth: 5, name: 'CAGE', wait: SHAFT.down + 0.5 },
    ...[6, 7, 8, 9, 10].map((d) => ({ depth: d, name: ONWARD_NAME[d], wait: ONWARD[d].secs + 0.5 })),
    { depth: 12, name: 'WAY ON', wait: 0.5 },
  ];
  for (const c of cases) {
    const g = on(c.depth);
    assert.deepEqual(exitLabels(g.level).map((e) => e.text), [], `floor ${c.depth}: nothing while he lives`);
    fell(g);
    run(g, c.wait);
    const names = exitLabels(g.level);
    assert.deepEqual(names.map((e) => e.text), [c.name], `floor ${c.depth}: ${c.name}`);
    for (const e of names) {
      assert.ok(e.x > 0 && e.y > 0 && e.x < g.level.floor.w && e.y < g.level.floor.h, `floor ${c.depth}: on the floor`);
      assert.ok(e.lift > 0);
    }
  }
});

test('none in town', () => {
  const g = new Game('warrior', 3);
  g.wayDepth = 6;
  g.enterTown();
  assert.deepEqual(exitLabels(g.level), []);
});
