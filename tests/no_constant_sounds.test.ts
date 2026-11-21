// NO CONSTANT SOUND BUT THE MUSIC (the sound chat's fifteenth batch, 15 Nov 2026: assets/sound/README.md; his words in the sound
// chat, 14:43 Eastern, “The only constant sound I want in levels or towns is the music.  Everything else is sound effects.”; and to
// the main chat, 14:26, “Can you give me a small update with the new torch sound changes”; game/world_sounds.ts WORLD_LOOPS,
// FIRE_REACH, AMBIENT, OWL_HOOT):
//   1. the world's loops off: none in town, the camp, the Rim or any floor;
//   2. a brazier's pop heard only right beside it: at full within 1 tile, less by 2, none past 2.5; every 10 to 25 s;
//   3. the breeze in the hall and the camp, three takes, 13 to 30 s; the owl half as often.
//
//   run: tsx --test tests/no_constant_sounds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { takesOf } from '../src/engine/audio';
import { Game } from '../src/game/game';
import { makeRim } from '../src/game/rim';
import { AMBIENT, FIRE_REACH, OWL_HOOT, WORLD_LOOPS, ambientWants, loopWants } from '../src/game/world_sounds';

test('1. the world\'s loops off: none anywhere', () => {
  assert.equal(WORLD_LOOPS.on, false);
  const g = new Game('warrior', 3);
  assert.deepEqual(loopWants(g, true), {}, 'the town');
  g.level = makeRim(11, true);
  assert.deepEqual(loopWants(g, true), {}, 'the Rim');
  for (const d of [1, 3, 10, 13]) {
    const f = Game.forPractice('warrior', d);
    assert.deepEqual(loopWants(f, true), {}, `floor ${d}`);
  }
});

test('2. a brazier\'s pop only right beside it, every 10 to 25 s', () => {
  assert.deepEqual([FIRE_REACH.near, FIRE_REACH.far], [1, 2.5]);
  assert.deepEqual([AMBIENT.fire.from, AMBIENT.fire.to, AMBIENT.fire.vol], [10, 25, 2.15]);
  for (let d = 1; d <= 20; d++) {
    const g = Game.forPractice('warrior', d);
    const b = g.level.props.find((p) => p.kind === 'brazier' && p.state !== 1);
    if (!b) continue;
    const others = g.level.props.filter((p) => p.kind === 'brazier' && p.state !== 1 && p !== b);
    const clear = (x: number, y: number): boolean => others.every((p) => Math.hypot(p.x - x, p.y - y) > FIRE_REACH.far);
    const pop = (): number | undefined => ambientWants(g, true).find((w) => w.a.name === 'fire_pop')?.vol;
    g.hero.x = b.x + 0.5;
    g.hero.y = b.y;
    assert.equal(pop(), AMBIENT.fire.vol, 'beside it: at full');
    for (const [dx, dy] of [[1.75, 0], [-1.75, 0], [0, 1.75], [0, -1.75]]) {
      if (!clear(b.x + dx, b.y + dy)) continue;
      g.hero.x = b.x + dx;
      g.hero.y = b.y + dy;
      const v = pop() ?? 0;
      assert.ok(v > 0 && v < AMBIENT.fire.vol, `1.75 tiles off: less (${v})`);
      break;
    }
    for (const [dx, dy] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) {
      if (!clear(b.x + dx, b.y + dy)) continue;
      g.hero.x = b.x + dx;
      g.hero.y = b.y + dy;
      assert.equal(pop(), 0, '3 tiles off: none (was heard to 7)');
      return;
    }
  }
  throw new Error('no floor with a brazier and a clear spot 3 tiles off it');
});

test('3. the breeze in the hall and the camp, three takes; the owl half as often', () => {
  for (const a of [AMBIENT.hall, AMBIENT.camp]) assert.deepEqual([a.name, a.from, a.to, a.vol], ['breeze', 13, 30, 0.9]);
  assert.equal(takesOf('breeze'), 3);
  assert.equal(takesOf('fire_pop'), 2, 'the rest: two, as ever');
  assert.deepEqual({ ...OWL_HOOT }, { from: 40, to: 80 });
});
