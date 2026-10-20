// ENDLESS MODE (game/endless.ts, behind ENDLESS: off until his yes to pictures of it from the game). His words to the main chat,
// 20 Oct 2026, 14:18 Pacific: “I’d like once you beat whatever the last level we have built, it picks a random leveled scaled
// up so you can go in an endless mode of harder and harder levels until you want to stop.  Or until you die?  We’ll call it
// endless mode and if you die it’s over.” His picks: “Pick up where you left off (Recommended)”, “The hero too”, “10% more
// each level (Recommended)”, “All 15 floors”.
//   1. the switch is off, and off the game is as it was: the last floor beaten, home, and nothing more;
//   2. on, the last floor beaten opens the endless levels: home as before, told so, and the town's waypoint takes him onto the
//      first, a floor of those built, never the last one beaten; its card says which level it is, with the warning;
//   3. every way on from an endless level (the stairwell, the mine shaft, the way on) takes him to the next, another floor;
//   4. which floor an endless level is: one of all those built, the same for the same hero and level, never the one before;
//   5. an endless level's monsters as strong as one floor past the last built, and 10% more life and damage on each level after;
//      what drops goes by that depth; in town the vendors' too;
//   6. floor 1 as an endless level is without the lesson: its monsters carry words;
//   7. a death on an endless level is the hero's end, even in Normal mode; off one, a Normal hero wakes as before;
//   8. the waypoint to town and back to the endless level reached, the same floor; the town's gate to floor 1 as before, no
//      endless level; and it is all kept in the save.
//   run: tsx --test tests/endless.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { lastFloor } from '../src/game/act1';
import { scaleDmg, scaleLife } from '../src/game/defs';
import { ENDLESS, ENDLESS_OPENS, ENDLESS_WARN, endlessFloorFor, endlessName, endlessPower, endlessTough } from '../src/game/endless';
import { Game } from '../src/game/game';
import { MODES } from '../src/game/modes';
import { RNG } from '../src/engine/rng';
import { seasoned } from './helpers';

type Take = { takeWay(t: string): void };
const take = (g: Game, to: string): void => (g as unknown as Take).takeWay(to);

function endless<T>(fn: () => T, on = true): T {
  const was = ENDLESS.on;
  ENDLESS.on = on;
  try {
    return fn();
  } finally {
    ENDLESS.on = was;
  }
}

/** A seasoned hero on the last floor built, about to beat it. */
function atTheLast(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 30);
  g.depth = lastFloor();
  g.cleared = lastFloor() - 1;
  g.wayDepth = lastFloor();
  g.enterDungeon();
  return g;
}

test('the switch is off until his yes; off, the last floor beaten is home and nothing more, as it was', () => {
  assert.equal(ENDLESS.on, false, 'off: pictures first, his rule');
  endless(() => {
    const g = atTheLast(3);
    take(g, 'on');
    assert.ok(g.level.town, 'home to town');
    assert.equal(g.endless, 0, 'no endless level');
    assert.equal(g.wayDepth, lastFloor());
    assert.ok(!('endless' in g.save()), 'nothing of it in the save');
    assert.equal(g.power, g.depth);
    assert.equal(g.tough, 1);
  }, false);
});

test('on, the last floor beaten opens the endless levels: home, told so; the waypoint onto the first, its card with the warning', () => endless(() => {
  const g = atTheLast(5);
  take(g, 'on');
  assert.ok(g.level.town, 'home to town, as before');
  assert.equal(g.endless, 1);
  assert.ok(g.endlessFloor >= 1 && g.endlessFloor <= lastFloor() && g.endlessFloor !== lastFloor(), `the first endless level a floor built, not the last (${g.endlessFloor})`);
  assert.ok(g.events.some((e) => e.t === 'msg' && e.text === ENDLESS_OPENS), 'told the endless levels are open');
  // (the town's waypoint, stood on, says where it goes)
  const W = g.level.ways!.way!;
  g.hero.x = W.x;
  g.hero.y = W.y;
  W.awake = true;
  assert.equal(g.interactHint(), `Waypoint: to ${endlessName(1)}`);
  assert.equal(g.power, endlessPower(1), 'in town the vendors have what the endless level reached has');
  g.events.length = 0;
  take(g, 'way');
  assert.equal(g.inEndless, true);
  assert.equal(g.depth, g.endlessFloor, 'the floor it is');
  assert.ok(!g.level.town);
  const card = g.events.find((e) => e.t === 'floorName');
  assert.ok(card && card.t === 'floorName');
  if (card && card.t === 'floorName') {
    assert.equal(card.level, 'Endless 1');
    assert.equal(card.warn, ENDLESS_WARN);
  }
  assert.equal(g.floorLevel, 'Endless 1');
}));

test('every way on from an endless level, the stairwell, the mine shaft and the way on, takes him to the next: another floor', () => endless(() => {
  const g = atTheLast(7);
  take(g, 'on');
  take(g, 'way');
  for (const [n, way] of [[1, 'down'], [2, 'up'], [3, 'on'], [4, 'down']] as const) {
    const was = g.depth;
    const cleared = g.cleared;
    assert.equal(g.endless, n);
    g.events.length = 0;
    take(g, way);
    assert.ok(!g.level.town, `${way}: not home`);
    assert.equal(g.inEndless, true);
    assert.equal(g.endless, n + 1, `${way}: on to the next`);
    assert.notEqual(g.depth, was, 'another floor');
    assert.equal(g.depth, g.endlessFloor);
    assert.equal(g.cleared, cleared + 1);
    assert.ok(g.events.some((e) => e.t === 'msg' && e.text === `Endless ${n} cleared`));
    assert.equal(g.meta.bestEndless, n);
  }
}));

test('which floor an endless level is: one of all those built, the same for the same hero and level, never the one before', () => {
  const seen = new Set<number>();
  let prev = lastFloor();
  for (let n = 1; n <= 400; n++) {
    const f = endlessFloorFor(77, n, prev);
    assert.ok(f >= 1 && f <= lastFloor(), `level ${n}: ${f}`);
    assert.notEqual(f, prev, `level ${n}: not the floor before`);
    assert.equal(endlessFloorFor(77, n, prev), f, 'the same again');
    seen.add(f);
    prev = f;
  }
  assert.equal(seen.size, lastFloor(), 'every floor built comes up, the first too (his pick, all of them)');
});

test('an endless level\'s monsters: as one floor past the last built, then 10% more life and damage each level; what drops by that depth', () => endless(() => {
  assert.equal(endlessPower(1), lastFloor() + 1);
  assert.equal(endlessPower(5), lastFloor() + 5);
  assert.equal(endlessTough(1), 1);
  assert.ok(Math.abs(endlessTough(2) - 1.1) < 1e-9);
  assert.ok(Math.abs(endlessTough(10) - Math.pow(1.1, 9)) < 1e-9, 'level 10 about 2.4 times level 1');
  for (const n of [1, 4, 9]) {
    const g = atTheLast(11);
    take(g, 'on');
    g.endless = n;
    take(g, 'way');
    assert.equal(g.power, endlessPower(n));
    assert.ok(Math.abs(g.tough - endlessTough(n)) < 1e-12);
    const on = g.spawn('skeleton', g.hero.x, g.hero.y, 9001, 0, false, new RNG(1));
    // (the same monster as it would be on a floor that deep, not endless)
    g.inEndless = false;
    const depth = g.depth;
    g.depth = endlessPower(n);
    const off = g.spawn('skeleton', g.hero.x, g.hero.y, 9002, 0, false, new RNG(1));
    g.depth = depth;
    // (life is whole: as near as that lets it be)
    assert.ok(Math.abs(on.maxLife - off.maxLife * endlessTough(n)) <= 1, `level ${n}: life ${on.maxLife} against ${off.maxLife}`);
    const dmgOn = (on.dmgMin + on.dmgMax) / 2;
    const dmgOff = (off.dmgMin + off.dmgMax) / 2;
    assert.ok(Math.abs(dmgOn / dmgOff - endlessTough(n)) < 0.01, `level ${n}: damage ${dmgOn} against ${dmgOff}`);
    // (as strong as that depth gives, by the floors' own rule)
    assert.ok(off.maxLife > 0 && scaleLife(endlessPower(n)) > scaleLife(lastFloor()) && scaleDmg(endlessPower(n)) > scaleDmg(lastFloor()));
  }
}));

test('floor 1 as an endless level is without the lesson: its monsters carry words', () => endless(() => {
  const g = atTheLast(13);
  take(g, 'on');
  g.endlessFloor = 1;
  take(g, 'way');
  assert.equal(g.depth, 1);
  const bare = (g as unknown as { bareDungeon(): boolean }).bareDungeon();
  assert.equal(bare, false, 'not the first dungeon\'s bare monsters');
  assert.ok(g.monsters.some((m) => m.words.length > 0), 'some carry words');
  // (the town's gate to floor 1 is the first floor as ever: no endless level)
  take(g, 'warpTown');
  take(g, 'gateIn');
  assert.equal(g.inEndless, false);
  assert.equal(g.depth, 1);
  assert.equal(g.power, 1);
  assert.equal(g.tough, 1);
}));

test('a death on an endless level is the hero\'s end, even in Normal mode; off one, a Normal hero wakes as before', () => endless(() => {
  const was = MODES.on;
  MODES.on = true;
  try {
    const g = atTheLast(17);
    g.mode = 'normal';
    g.enterDungeon();
    assert.equal(g.wakes, true, 'on a floor, not endless: a Normal hero wakes in town');
    take(g, 'on');
    take(g, 'way');
    assert.equal(g.inEndless, true);
    assert.equal(g.wakes, false, 'on an endless level: lost, his pick “The hero too”');
    assert.equal(g.wakeSave(), null);
  } finally {
    MODES.on = was;
  }
}));

test('the waypoint to town and back to the endless level reached, the same floor; kept in the save', () => endless(() => {
  const g = atTheLast(19);
  take(g, 'on');
  take(g, 'way');
  take(g, 'down');
  take(g, 'on');
  assert.equal(g.endless, 3);
  const floor = g.depth;
  take(g, 'warpTown');
  assert.ok(g.level.town);
  assert.equal(g.inEndless, false);
  assert.equal(g.power, endlessPower(3), 'in town, the vendors as at the endless level reached');
  const s = JSON.parse(JSON.stringify(g.save()));
  assert.equal(s.endless, 3);
  assert.equal(s.endlessFloor, floor);
  const r = Game.restore(s);
  assert.equal(r.endless, 3);
  assert.equal(r.endlessFloor, floor);
  take(r, 'way');
  assert.equal(r.inEndless, true);
  assert.equal(r.endless, 3, 'where he left off');
  assert.equal(r.depth, floor, 'the same floor');
  // (with the switch off, a save that has it is read as before: the waypoint to the deepest floor)
  endless(() => {
    const q = Game.restore(s);
    assert.equal(q.endless, 0);
    take(q, 'way');
    assert.equal(q.inEndless, false);
    assert.equal(q.depth, lastFloor());
  }, false);
}));
