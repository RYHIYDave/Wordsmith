// THE UNIQUE ITEMS' TEST PAGE (main.ts `try=uniques`, tools/uniques_try_page.mjs; game/game.ts Game.giftUniques): the level
// select's test hero and the practice room's handed every unique they could find, for him to try their numbers in play (his
// pick of 11 Nov 2026: “Start with these, tune in play (Recommended)”). Only on that page: nothing with the switch off.
//   run: tsx --test tests/uniques_try.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import type { ClassId } from '../src/game/types';
import { LEVEL_UNIQUES, UNIQUE_DEFS, poolFor, uniqueOf } from '../src/game/uniques';

// (THE 62 ALONE: the leveling uniques, on since his yes of 12 Nov 2026, have a roll and a hand-out of their own, and their own test,
// tests/uniques_level.test.ts; here they are set aside)
LEVEL_UNIQUES.on = false;
import { off, on } from './uniques_helpers';

const CLASSES: ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
const fromBosses = UNIQUE_DEFS.filter((d) => d.from === 'boss' || d.from === 'final');

test('off: the test hero is handed nothing, and nothing is said', () =>
  off(() => {
  const g = Game.forTrial('warrior', 5, 6);
  const said = g.events.length;
  assert.deepEqual(g.giftUniques(), { bag: 0, stash: 0 });
  assert.ok(g.hero.bag.every((it) => !uniqueOf(it)));
  assert.ok(g.meta.stash.every((it) => !it));
  assert.equal(g.events.length, said);
  }));

test("on: every hero's own pool is in his bag and the bosses' own and the final boss's two are in his stash, each once, each one he can wear", () => {
  on(() => {
    for (const cls of CLASSES) {
      const g = Game.forTrial(cls, 5, 6);
      const pool = poolFor(cls).map((d) => d.id).sort();
      const got = g.giftUniques();
      const inBag = g.hero.bag.filter((it) => uniqueOf(it)).map((it) => it!.unique!).sort();
      const inStash = g.meta.stash.filter((it) => uniqueOf(it)).map((it) => it!.unique!).sort();
      assert.deepEqual(inBag, pool, `${cls}: his bag`);
      assert.deepEqual(inStash, fromBosses.map((d) => d.id).sort(), `${cls}: his stash`);
      assert.deepEqual(got, { bag: pool.length, stash: fromBosses.length }, cls);
      // (the ten for everyone, his weapon's three, his own two; the twenty bosses' and the final boss's two)
      assert.equal(pool.length, 15, cls);
      assert.equal(fromBosses.length, 22);
      for (const it of [...g.hero.bag, ...g.meta.stash]) if (it && uniqueOf(it)) assert.equal(g.useProblem(it), null, `${cls}: ${it.name}`);
    }
  });
});

test('on: the floor is laid as it would be without them (their dice are their own), and floor 1 and the practice room are handed theirs too', () => {
  on(() => {
    const a = Game.forTrial('mage', 9, 8);
    const b = Game.forTrial('mage', 9, 8);
    b.giftUniques();
    assert.equal(b.monsters.length, a.monsters.length);
    assert.deepEqual(b.monsters.map((m) => [m.kind, m.x, m.y]), a.monsters.map((m) => [m.kind, m.x, m.y]));
    const first = Game.forTrial('ranger', 3, 1);
    assert.equal(first.giftUniques().bag, 15);
    for (const it of first.hero.bag) if (it && uniqueOf(it)) assert.equal(first.useProblem(it), null, it.name);
    const room = Game.forPractice('brawler', 3);
    const free = room.hero.bag.filter((it) => !it).length;
    assert.ok(free >= 15, `the practice room's bag has room for his fifteen (${free} free)`);
    assert.equal(room.giftUniques().bag, 15);
    for (const it of room.hero.bag) if (it && uniqueOf(it)) assert.equal(room.useProblem(it), null, it.name);
  });
});
