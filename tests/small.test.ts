// TWO SMALL THINGS (Version 18.6). The owner, 7 Oct 2026, 19:13: "Some small things, I need the
// ranged enemies to not run away from you, and I need the pick up range increased slightly."
//
// And at 19:35: "Also the larger guardian mobs are just big damage sponges and could use at least
// a 30% reduction in HP".
//
// What is held here:
//   - A RANGED MONSTER HOLDS ITS GROUND. Awake, with the hero right beside it, a Bone Archer and a
//     Cultist stay where they stand and shoot. (Until Version 18.5 each backed straight away from
//     a hero nearer than 4.5 and 4 tiles.) From beyond the distance it keeps, it still comes
//     nearer, and stops there.
//   - THINGS ARE PICKED UP FROM A LITTLE FURTHER. Gold, an orb and a word come to a hero within
//     `TUNE.dropPull` (3.2 tiles; 2.6 until 18.5) and are taken when they reach him; a piece of
//     gear, which lies where it fell, is taken from `TUNE.gearTake` (1.1 tiles; 0.75 until 18.5).
//   - A GUARDIAN HAS 30% LESS LIFE: three and a half times a brute's at its depth, where it was
//     five times.
//   run: tsx --test tests/small.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { RNG } from '../src/engine/rng';
import { MONSTERS, TUNE, scaleLife } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Drop, Monster } from '../src/game/state';
import type { Item } from '../src/game/types';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const DT = 1 / 60;

type Inner = {
  rng: RNG;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  updatePractice: (dt: number) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room with nobody in it and nobody coming: open floor, eighteen tiles each way, the hero in the middle of it. */
function room(): Game {
  const g = Game.forPractice('warrior', 5);
  inner(g).updatePractice = () => {};
  g.monsters.length = 0;
  g.drops.length = 0;
  g.hero.invuln = 1e9;
  return g;
}
/** Steps of the game with nobody at the controls; how many shots at the hero were loosed in them. */
function steps(g: Game, n: number): number {
  const seen = new Set<unknown>(g.projectiles);
  let shots = 0;
  for (let k = 0; k < n; k++) {
    g.events.length = 0;
    g.update(DT, emptyControls());
    for (const p of g.projectiles) {
      if (seen.has(p)) continue;
      seen.add(p);
      if (p.hostile) shots++;
    }
  }
  return shots;
}
const far = (g: Game, m: { x: number; y: number }): number => Math.hypot(m.x - g.hero.x, m.y - g.hero.y);

test('a ranged monster holds its ground: with the hero right beside it, it stays where it stands and shoots', () => {
  for (const kind of ['archer', 'cultist'] as const) {
    assert.ok(MONSTERS[kind].ranged, `${kind} is a ranged monster`);
    for (const off of [1.2, 2.5, 3.9]) {
      const g = room();
      const h = g.hero;
      const m = inner(g).spawn(kind, h.x + off, h.y, 900, 0, false, inner(g).rng);
      inner(g).wakeUp(m);
      assert.equal(m.state, 'chase', 'it is awake');
      const x0 = m.x;
      const y0 = m.y;
      let moved = 0;
      let shots = 0;
      // eight seconds, looked at every tenth of one
      for (let k = 0; k < 80; k++) {
        shots += steps(g, 6);
        moved = Math.max(moved, Math.hypot(m.x - x0, m.y - y0));
      }
      assert.ok(moved < 0.01, `a ${kind} ${off} tiles from the hero does not back away (it moved ${moved.toFixed(3)} tiles in eight seconds)`);
      assert.ok(shots >= 2, `and it shoots from there (${shots} shots in eight seconds)`);
    }
  }
});

test('a ranged monster still comes for a hero who is out of its reach, and stops as near as it keeps', () => {
  for (const kind of ['archer', 'cultist'] as const) {
    const keep = MONSTERS[kind].keepMax;
    const g = room();
    const h = g.hero;
    h.x = 9.5;
    h.y = 15.5;
    const m = inner(g).spawn(kind, h.x + keep + 3, h.y, 900, 0, false, inner(g).rng);
    inner(g).wakeUp(m);
    const d0 = far(g, m);
    assert.ok(d0 > keep + 2, `it begins ${d0.toFixed(2)} tiles off, further than the ${keep} it keeps`);
    steps(g, 360);
    const d1 = far(g, m);
    assert.ok(d1 <= keep + 0.01 && d1 > keep - 0.6, `it has come to ${d1.toFixed(2)} tiles, the distance it keeps, and no nearer`);
    // and when the hero comes at it, it stands
    h.x = m.x - 1.4;
    h.y = m.y;
    const x0 = m.x;
    const y0 = m.y;
    const shots = steps(g, 420);
    assert.ok(Math.hypot(m.x - x0, m.y - y0) < 0.01, `with the hero come up to it, it has not moved (${Math.hypot(m.x - x0, m.y - y0).toFixed(3)})`);
    assert.ok(shots >= 2, `and has shot ${shots} times`);
  }
});

const lying = (g: Game, d: Partial<Drop> & { x: number; y: number; kind: Drop['kind'] }): Drop => {
  const drop: Drop = { gold: 0, item: null, word: null, age: 5, ...d };
  g.drops.push(drop);
  return drop;
};

test('the pick-up range is a little more than it was: the pull 3.2 tiles for 2.6, a piece of gear from 1.1 for 0.75', () => {
  assert.equal(TUNE.dropPull, 3.2);
  assert.equal(TUNE.gearTake, 1.1);
  assert.equal(TUNE.dropTake, 0.75);
});

test('gold, an orb and a word come to a hero who is within the pull and are taken; beyond it they lie where they are', () => {
  for (const kind of ['gold', 'orb', 'word'] as const) {
    const g = room();
    const h = g.hero;
    h.life = h.d.maxLife * 0.5;
    const had = { gold: h.gold, life: h.life, words: h.words.swift };
    // (further than the 2.6 tiles of Version 18.5, nearer than the pull of today)
    const near = lying(g, { x: h.x + 3.0, y: h.y, kind, gold: 7, word: kind === 'word' ? 'swift' : null });
    const out = lying(g, { x: h.x - (TUNE.dropPull + 0.3), y: h.y, kind, gold: 7, word: kind === 'word' ? 'swift' : null });
    const outAt = out.x;
    assert.ok(3.0 < TUNE.dropPull && 3.0 > 2.6);
    steps(g, 60);
    assert.ok(!g.drops.includes(near), `${kind} three tiles off has come to the hero and been taken`);
    assert.ok(g.drops.includes(out) && out.x === outAt, `${kind} just beyond the pull lies where it lay`);
    if (kind === 'gold') assert.ok(h.gold > had.gold, 'and the gold is his');
    if (kind === 'orb') assert.ok(h.life > had.life, 'and the orb has healed him');
    if (kind === 'word') assert.equal(h.words.swift, had.words + 1, 'and the word is his');
  }
});

test('a piece of gear lies where it fell, and is taken from a full tile away: just inside its range it is taken, just outside it is not', () => {
  const g = room();
  const h = g.hero;
  const spot = h.bag.findIndex((it) => it !== null);
  assert.ok(spot >= 0, 'the practice hero has gear in the bag to drop');
  const it = h.bag[spot] as Item;
  h.bag[spot] = null;
  assert.ok(TUNE.gearTake >= 1 && TUNE.gearTake > 0.75);
  // just outside: it lies, and does not come to him
  const out = lying(g, { x: h.x + TUNE.gearTake + 0.06, y: h.y, kind: 'item', item: it });
  steps(g, 90);
  assert.ok(g.drops.includes(out) && out.x === h.x + TUNE.gearTake + 0.06, 'a piece of gear just outside the range lies where it fell');
  assert.ok(!h.bag.includes(it));
  // just inside (further than the 0.75 of Version 18.5): it is taken
  out.x = h.x + TUNE.gearTake - 0.06;
  assert.ok(TUNE.gearTake - 0.06 > 0.75);
  steps(g, 2);
  assert.ok(!g.drops.includes(out), 'just inside the range it is taken');
  assert.ok(h.bag.includes(it) || Object.values(h.gear).includes(it), 'and is the hero\'s again');
});

test('a guardian has 30% less life than it had: three and a half times a brute\'s at its depth, for five times', () => {
  assert.equal(TUNE.guardianLife, 3.5);
  assert.ok(Math.abs(TUNE.guardianLife / 5 - 0.7) < 1e-9, 'which is 30% less than five times');
  const g = room();
  const h = g.hero;
  const brute = inner(g).spawn('brute', h.x + 4, h.y, 900, 0, false, inner(g).rng);
  const guardian = inner(g).spawn('brute', h.x - 4, h.y, 901, 2, false, inner(g).rng);
  assert.ok(guardian.champion && !brute.champion && !brute.elite);
  const plain = MONSTERS.brute.life * scaleLife(g.depth);
  // (a monster's life is a whole number)
  assert.ok(Math.abs(brute.maxLife - plain * (brute.words.includes('power') ? 1.3 : 1)) <= 0.5, `a brute here has ${brute.maxLife} of life`);
  // (a guardian carries words, and "power" on a monster is 30% more life)
  const want = plain * TUNE.guardianLife * (guardian.words.includes('power') ? 1.3 : 1);
  assert.ok(Math.abs(guardian.maxLife - want) <= 0.5, `a guardian here has ${guardian.maxLife} of life: ${want} is three and a half times a brute's`);
  assert.ok(guardian.maxLife < plain * 5 * (guardian.words.includes('power') ? 1.3 : 1) * 0.71, 'and that is 30% less than five times');
  assert.equal(guardian.life, guardian.maxLife);
});
