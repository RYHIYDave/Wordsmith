// ACT 2, THE HUSH (floors 11 to 15, behind ACT2, game/act1.ts: off until his yes). The owner, 19 Oct 2026, 11:01 Pacific, to the
// planning chat: "Get levels 11-15 into the game". What every floor of it has, whoever's map-maker lays it: the switch's two
// ways; the way on from floor 10 to the city and home from the fifteenth; each floor laid with its own ground, no stronghold of
// the descent's, nothing of Act 1 fighting there; the Hush on the hero.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT2, ACT1_FLOORS, act1Floor, act2Floor, landOf, lastFloor } from '../src/game/act1';
import { ACT2_OWN, act2Pack } from '../src/game/act2_mobs';
import { bossKind } from '../src/game/bosses';
import { MONSTERS, floorTitle } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { makeDungeon } from '../src/game/level';
import { RNG } from '../src/engine/rng';
import { ACT1_KINDS, FIRST5_KINDS, MONSTER_KINDS, NEW_KINDS, T_FLOOR } from '../src/game/types';
import { seasoned } from './helpers';

function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

test('the switch is off, and with it off floor 10 is the last: floors 11 to 15 are not the Hush', () => {
  assert.equal(ACT2.on, false);
  assert.equal(lastFloor(), 10);
  for (let d = 11; d <= 15; d++) {
    assert.equal(act1Floor(d), 0);
    assert.equal(act2Floor(d), 0);
    assert.equal(makeDungeon(d, 7).land, undefined, `floor ${d} is not laid as open ground`);
  }
  assert.equal(floorTitle(11).level, 'Prison Level 11');
});

test('with it on, floors 11 to 15 are the Hush: each its ground, its place and its boss, as his doc has them', () => hush(() => {
  assert.equal(lastFloor(), 15);
  const lands = ['gateward', 'undercity', 'millrace', 'housequiet', 'library'];
  const places = ['The Gate Ward', 'The Undercity', 'The Millrace', 'The House of Quiet', 'The Great Library'];
  const bosses = ['crier', 'ratking', 'palimpsest', 'physician', 'censor'];
  for (let d = 11; d <= 15; d++) {
    assert.equal(act2Floor(d), d);
    assert.equal(landOf(d), lands[d - 11]);
    assert.equal(ACT1_FLOORS[d].place, places[d - 11]);
    assert.equal(ACT1_FLOORS[d].boss, bosses[d - 11]);
    assert.equal(floorTitle(d).level, `${places[d - 11]}, Level ${d}`);
    // (the Warden stands in for a boss not built yet)
    assert.ok(bossKind(d) === bosses[d - 11] || bossKind(d) === 'warden');
  }
  assert.equal(act2Floor(10), 0, 'the descent is not the Hush');
  assert.equal(act2Floor(16), 0);
}));

test('each floor of the Hush is laid: its own ground, the hero and the boss on the floor, no stronghold', () => hush(() => {
  for (let d = 11; d <= 15; d++) {
    for (const seed of [1, 2, 3]) {
      const L = makeDungeon(d, seed);
      assert.ok(L.land, `floor ${d} seed ${seed} is laid as open ground`);
      const land = L.land!;
      assert.equal(land.kind, landOf(d));
      assert.equal(land.holds.length, 0, 'no stronghold of the descent');
      const f = L.floor;
      const at = (p: { x: number; y: number }): number => f.tiles[Math.floor(p.y) * f.w + Math.floor(p.x)];
      assert.equal(at(f.start), T_FLOOR, 'the hero starts on the floor');
      assert.equal(at(f.boss), T_FLOOR, 'the boss waits on the floor');
      assert.ok(L.ways?.onward, 'its way on, asleep till the boss dies');
      assert.ok(L.act1, 'it is dressed');
      assert.equal(L.act1!.floor, d);
    }
  }
}));

test('nothing of Act 1 fights on floors 11 to 15 (his words: "let’s keep the acts separate"): their packs are the Hush\'s own', () => hush(() => {
  const old = new Set<string>([...MONSTER_KINDS, ...NEW_KINDS, ...FIRST5_KINDS, ...ACT1_KINDS]);
  const rng = new RNG(5);
  for (let d = 11; d <= 15; d++) {
    for (const m of ACT2_OWN[d]) assert.ok(!old.has(m.kind), `${m.kind} is the Hush's`);
    for (let i = 0; i < 40; i++) {
      for (const tier of ['normal', 'elite', 'champion'] as const) {
        const p = act2Pack(d, rng, tier);
        assert.ok(MONSTERS[p.kind], p.kind);
        // (while a kind is not built, the cult's dagger cultist stands in: allowed only until the Hushed are)
        assert.ok(!old.has(p.kind) || p.kind === 'dagger', `${p.kind} on floor ${d}`);
        assert.ok(p.size >= 1);
      }
    }
  }
}));

test('the way on: floor 10 takes him home, the siege broken, and the town\'s waypoint on into the city; the fifteenth, home', () => hush(() => {
  const g = seasoned(new Game('warrior', 4), 30);
  const take = (to: string): void => (g as unknown as { takeWay(t: string): void }).takeWay(to);
  g.depth = 10;
  g.cleared = 9;
  g.wayDepth = 10;
  g.enterDungeon();
  take('on');
  assert.ok(g.level.town, 'home to town');
  assert.equal(g.wayDepth, 11, 'the waypoint takes him on to floor 11');
  g.depth = 11;
  g.enterDungeon();
  take('on');
  assert.equal(g.depth, 12, 'from 11 on to 12');
  assert.ok(!g.level.town);
  g.depth = 15;
  g.enterDungeon();
  take('on');
  assert.ok(g.level.town, 'from the fifteenth home');
  assert.equal(g.wayDepth, 15, 'no sixteenth yet');
}));

test('THE HUSH: his words go dark for a while, his attacks as with no word in them; they come back as it runs out', () => {
  const g = seasoned(new Game('warrior', 6), 20);
  const h = g.hero;
  h.words.fire = (h.words.fire ?? 0) + 1;
  h.skills[0].front[0] = 'fire';
  g.refresh();
  const named = h.skills[0].r.name;
  assert.match(named, /Flame/);
  g.hush(4);
  assert.equal(g.hushT, 4);
  assert.doesNotMatch(h.skills[0].r.name, /Flame/, 'dark');
  assert.equal(h.skills[0].front[0], 'fire', 'the word stays where it is');
  g.hush(1);
  assert.equal(g.hushT, 4, 'the longer of the two');
  for (let i = 0; i < 90; i++) g.update(0.05, emptyControls());
  assert.equal(g.hushT, 0);
  assert.equal(h.skills[0].r.name, named, 'his words are his again');
});
