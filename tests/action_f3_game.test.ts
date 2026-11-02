// FLOOR 3, MORE ACTION IN THE GAME (game/defs.ts ACTION_F3; game.ts wallUp and hitMonster; render.ts its glance): the Boneward's
// shield wall, the rules the main chat put to the art chat's pictures (his yes to them). Held here:
//   1. off, as ever; on, the art's switch (BONEWARD_WALL) on and off with it;
//   2. its wall up, a blow from before it does nothing (it glances, `glanceT`), a blow from behind or the side hurts it;
//   3. its wall down (its spear gone; its throw begun; just after picking its spear up), a blow from before hurts it.
//   run: tsx --test tests/action_f3_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BONEWARD_WALL, WALL } from '../src/art/action_f3_fx';
import { useActionF3 } from '../src/art/bestiary';
import { ACTION_F3 } from '../src/game/defs';
import { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';

function on<T>(fn: () => T): T {
  const was = ACTION_F3.on;
  useActionF3(true);
  try {
    return fn();
  } finally {
    useActionF3(was);
  }
}

/** A Boneward 1.5 tiles before the hero, facing the way `face` (radians) from him, awake; the hero's quick attack's index. */
function setUp(face: number): { g: Game; m: Monster } {
  const g = new Game('warrior', 4244);
  g.depth = 3;
  g.enterDungeon();
  g.monsters = [];
  const h = g.hero;
  const m = g.spawn('boneward', h.x + 1.5, h.y, -1, 0, false, g.rng);
  m.state = 'chase';
  m.fx = Math.cos(face);
  m.fy = Math.sin(face);
  return { g, m };
}

const hit = (g: Game, m: Monster): void => (g as unknown as { hitMonster(m: Monster, i: number, frac: number, quiet: boolean): void }).hitMonster(m, 0, 1, true);

test('1. off as ever; on, the art with it', () => {
  assert.equal(ACTION_F3.on, false);
  on(() => assert.ok(BONEWARD_WALL.on));
  assert.ok(!BONEWARD_WALL.on);
});

test('2. its wall up: from before, the blow glances off and does nothing; from behind or the side, it hurts', () => {
  on(() => {
    // (facing the hero, back toward -x: he is straight before it)
    const front = setUp(Math.PI);
    const life0 = front.m.life;
    hit(front.g, front.m);
    assert.equal(front.m.life, life0, 'from before: nothing');
    assert.equal(front.m.glanceT, 0, 'it glances');
    for (const face of [0, Math.PI / 2]) {
      const s = setUp(face);
      const l0 = s.m.life;
      hit(s.g, s.m);
      assert.ok(s.m.life < l0, `facing ${face.toFixed(2)}: hurt`);
    }
  });
});

test('3. its wall down: its spear gone, its throw begun, just after picking it up: from before, it hurts', () => {
  on(() => {
    const cases: [string, (m: Monster) => void][] = [
      ['its spear gone', (m) => void (m.bare = true)],
      ['just after picking its spear up', (m) => void (m.raisedT = WALL.raisedAgain / 2)],
    ];
    for (const [what, set] of cases) {
      const s = setUp(Math.PI);
      set(s.m);
      const l0 = s.m.life;
      hit(s.g, s.m);
      assert.ok(s.m.life < l0, `${what}: hurt`);
    }
    const s = setUp(Math.PI);
    assert.ok(s.g.wallUp(s.m), 'up, standing');
    s.m.state = 'windup';
    s.m.move = 2;
    s.m.t = 0.5;
    assert.equal(s.g.wallUp(s.m), false, 'down from the start of its throw');
  });
});
