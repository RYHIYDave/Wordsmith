// FLOOR 4, MORE ACTION IN THE GAME (game/defs.ts ACTION_F4; game.ts 'frenzy', frenzyStab): the dagger cultist's frenzy, the rules
// the main chat put to the art chat's pictures (his yes to them). Held here:
//   1. off, his one blow as ever; on, the frenzy, and the art's switch (DAGGER_FRENZY) on and off with it;
//   2. a hero before him is stabbed again and again as he drives forward; one behind him is not;
//   3. as the frenzy lands he is carried on as far as it drove him (FRENZY.travel), where the floor lets him.
//   run: tsx --test tests/action_f4_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { DAGGER_FRENZY, FRENZY } from '../src/art/cultists';
import { useActionF4 } from '../src/art/bestiary';
import { ACTION_F4, MONSTERS, movesOf } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';

function on<T>(fn: () => T): T {
  const was = ACTION_F4.on;
  useActionF4(true);
  try {
    return fn();
  } finally {
    useActionF4(was);
  }
}

/** A dagger cultist `d` tiles from the hero along +x, just beginning his frenzy at him (turned to him as it begins); `behind`: the hero then slips round behind him. */
function frenzy(d: number, behind = false): { g: Game; m: Monster; hits: number } {
  const g = new Game('warrior', 4245);
  g.depth = 4;
  g.enterDungeon();
  g.monsters = [];
  const h = g.hero;
  const m = g.spawn('dagger', h.x + d, h.y, -1, 0, false, g.rng);
  g.monsters = [m];
  m.state = 'chase';
  const G = g as unknown as { startMove(m: Monster, def: unknown, moves: unknown, i: number): void };
  G.startMove(m, MONSTERS.dagger, movesOf(m), 0);
  if (behind) h.x = m.x + 1.0;
  let hits = 0;
  let life = h.life;
  const c = emptyControls();
  for (let k = 0; k < 40; k++) {
    h.invuln = 0;
    g.update(1 / 30, c);
    if (h.life < life) hits++;
    life = h.life;
    h.life = h.d.maxLife;
    life = h.life;
  }
  return { g, m, hits };
}

test('1. off, his one blow; on, the frenzy, and the art with it', () => {
  assert.equal(ACTION_F4.on, false);
  assert.equal(movesOf({ kind: 'dagger', champion: false }), null);
  on(() => {
    assert.ok(DAGGER_FRENZY.on);
    assert.deepEqual(movesOf({ kind: 'dagger', champion: false })!.map((m) => m.id), ['frenzy']);
  });
  assert.ok(!DAGGER_FRENZY.on);
});

test('2. before him, stabbed again and again; behind him, not', () => {
  on(() => {
    const before = frenzy(1.2);
    assert.ok(before.hits >= 3, `${before.hits} stabs landed before him`);
    const behind = frenzy(1.2, true);
    assert.equal(behind.hits, 0, 'none behind him');
  });
});

test('3. carried on as far as it drove him', () => {
  on(() => {
    const { g, m } = frenzy(3);
    const moved = Math.abs(m.x - (g.hero.x + 3));
    assert.ok(Math.abs(moved - FRENZY.travel) < 0.05, `carried ${moved.toFixed(2)} tiles`);
  });
});
