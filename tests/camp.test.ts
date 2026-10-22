// ACT 2'S TOWN, THE CAMP INSIDE VELLUM'S GATE (game/camp.ts), behind EXITS (game/ways.ts, off). The art chat's camp (art/hub2_camp.ts,
// his yes there by 11:30 Pacific, 22 Oct 2026); his pick in the main chat by 12:26: “Yes, the camp from then on (Recommended)”,
// offered as: he wakes there after a death, the waypoints of floors 11 to 15 lead there, and its waypoint takes him back down; the
// prison town is left behind.
//
// What is held here:
//   - off, the town is the prison town whatever the hero has reached;
//   - on, his town is the camp once he has come down into the city (Game.wayDepth 11 and on), and the prison town before;
//   - the camp as the art chat laid it: its open yard and streets walkable, every service there and reached on foot from where
//     he comes in, its waypoint awake, its way on to floor 11 reached on foot; nothing solid on the way;
//   - floor 10's way on brings him in through its city gate; its way on takes him to floor 11; floor 15's home is the camp;
//   - its waypoint takes him back down to the deepest floor of the city reached; a saved hero comes back to it.
//   run: tsx --test tests/camp.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CAMP, isCamp, makeCamp } from '../src/game/camp';
import { Game } from '../src/game/game';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Controls, Level } from '../src/game/state';
import { EXITS, WAY_USE } from '../src/game/ways';

const DT = 1 / 60;
function exitsSet<T>(on: boolean, run: () => T): T {
  const was = EXITS.on;
  EXITS.on = on;
  try {
    return run();
  } finally {
    EXITS.on = was;
  }
}
function until(g: Game, secs: number, done: () => boolean, c: Controls = emptyControls()): number {
  for (let k = 0; k < secs / DT; k++) {
    if (done()) return k;
    g.events.length = 0;
    g.update(DT, { ...c });
  }
  return done() ? Math.round(secs / DT) : -1;
}
const tile = (L: Level, x: number, y: number): number => Math.floor(y) * L.floor.w + Math.floor(x);
/** Can he walk from (ax, ay) to within a tile of (bx, by)? */
function reaches(L: Level, ax: number, ay: number, bx: number, by: number): boolean {
  const flow = flowField(L.walk, L.floor.w, L.floor.h, Math.floor(ax), Math.floor(ay));
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const i = tile(L, bx + dx, by + dy);
    if (L.walk[i] === 1 && flow[i] !== UNREACHABLE) return true;
  }
  return false;
}

test('off, the town is the prison town whatever he has reached', () => {
  assert.equal(EXITS.on, false);
  const g = new Game('warrior', 7);
  g.wayDepth = 13;
  g.enterTown();
  assert.equal(isCamp(g.level), false);
});

test('on, his town is the camp once he has come down into the city, and the prison town before', () =>
  exitsSet(true, () => {
    const g = new Game('warrior', 7);
    for (const [d, camp] of [[0, false], [6, false], [10, false], [11, true], [15, true]] as const) {
      g.wayDepth = d;
      g.enterTown();
      assert.equal(isCamp(g.level), camp, `reached ${d}`);
      assert.equal(g.level.town, true);
    }
  }));

test('the camp as laid: every service there and reached on foot from where he comes in; its waypoint awake; its way on reached on foot', () =>
  exitsSet(true, () => {
    const L = makeCamp(3, true);
    assert.ok(isCamp(L));
    const kinds = L.stations.map((s) => s.kind).sort();
    assert.deepEqual(kinds, ['armourer', 'gate', 'lexicon', 'mystic', 'stash', 'stranger', 'wordsmith']);
    assert.equal(L.walk[tile(L, CAMP.arrive.x, CAMP.arrive.y)], 1, 'he comes in on open ground');
    assert.equal(L.walk[tile(L, L.floor.start.x, L.floor.start.y)], 1, 'and where he starts');
    for (const s of L.stations) if (s.kind !== 'gate') assert.ok(reaches(L, CAMP.arrive.x, CAMP.arrive.y, s.x, s.y), `${s.kind} reached`);
    assert.ok(L.ways?.way && reaches(L, CAMP.arrive.x, CAMP.arrive.y, L.ways.way.x, L.ways.way.y), 'its waypoint');
    assert.ok(L.ways?.onward?.awake && reaches(L, CAMP.arrive.x, CAMP.arrive.y, CAMP.onward.x, CAMP.onward.y), 'its way on');
    const g = new Game('mage', 9);
    g.wayDepth = 12;
    g.enterTown();
    assert.equal(g.level.ways!.way!.awake, true);
    // (without the stranger's trades open, no service of his)
    assert.ok(!makeCamp(3, false).stations.some((s) => s.kind === 'stranger'));
  }));

test('floor 10\'s way on brings him in through the camp\'s gate; its way on takes him to floor 11; floor 15\'s home is the camp', () =>
  exitsSet(true, () => {
    const g = new Game('warrior', 21);
    g.hero.invuln = 1e9;
    g.depth = 10;
    g.cleared = 9;
    g.wayDepth = 10;
    g.enterDungeon();
    // (the way on, woken as the boss's death wakes it: the Eye has three stages, and the rules of its death are not what is held here)
    const on = g.level.ways!.onward!;
    on.awake = true;
    g.hero.x = on.x;
    g.hero.y = on.y;
    assert.ok(until(g, 3, () => g.level.town) > 0);
    assert.ok(isCamp(g.level), 'the camp');
    assert.ok(Math.hypot(g.hero.x - CAMP.arrive.x, g.hero.y - CAMP.arrive.y) < 0.01, 'in through its gate');
    assert.equal(g.wayDepth, 11);
    // (out by its barricaded street: floor 11)
    g.hero.x = CAMP.onward.x;
    g.hero.y = CAMP.onward.y;
    assert.ok(until(g, 3, () => g.inDungeon) > 0);
    assert.equal(g.depth, 11);
    // (floor 15's boss beaten: home, to the camp)
    g.depth = 15;
    g.cleared = 14;
    g.wayDepth = 15;
    g.enterDungeon();
    const on15 = g.level.ways!.onward!;
    on15.awake = true;
    g.hero.x = on15.x;
    g.hero.y = on15.y;
    assert.ok(until(g, 3, () => g.level.town) > 0);
    assert.ok(isCamp(g.level), 'home to the camp');
  }));

test('its waypoint takes him back down to the deepest floor of the city reached; a saved hero comes back to the camp', () =>
  exitsSet(true, () => {
    const g = new Game('ranger', 33);
    g.hero.invuln = 1e9;
    g.wayDepth = 13;
    g.enterTown();
    const w = g.level.ways!.way!;
    g.hero.x = w.x;
    g.hero.y = w.y;
    const c = emptyControls();
    c.interact = true;
    g.update(DT, c);
    assert.ok(Math.hypot(g.hero.x - w.x, g.hero.y - w.y) < WAY_USE);
    assert.ok(until(g, 2, () => g.inDungeon) > 0);
    assert.equal(g.depth, 13);
    // (saved in the camp, he comes back to it)
    g.enterTown();
    const back = Game.restore(JSON.parse(JSON.stringify(g.save())));
    assert.ok(isCamp(back.level));
  }));
