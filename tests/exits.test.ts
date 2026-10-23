// THE WAYS BETWEEN THE FLOORS (game/ways.ts, EXITS, off until he has seen the art chat's pictures and said yes). His words,
// 22 Oct 2026, 11:21 (Pacific): “I’d like to fix the level exits in 4-15.  Level four should end with a wall crumbling
// down after the boss is killed and a cave entrance is exposed.  Then you enter the fleshmancer’s lair.  Let’s put the
// empty elevator cage in the bottom corner of the prison town so you come up to town from beating the fleshmancer.  Then
// you head out the big gate at the top of the town to enter the quarry and head back down the mountain to the town.  So
// the gate needs to be blocked or barred up until that point.  You’ll start a new game in town and the wordsmith will
// give you a quest to find the key to turn on the altar or whatever it is I can’t remember.  I guess have some stairs in
// town also and you go down the stairs to enter level 1.  Then have exits that lead to the next zone in a natural way as
// opposed to just a waypoint being plopped down.”
//
// What is held here:
//   - off, the game is as it was: the town has no stairs nor shaft, a new player wakes on floor 1, floor 4 has its
//     stairwell and floor 5 no mouth;
//   - on, a new game begins in town, a new player's too, his lessons there: walking, then the wordsmith's quest, then
//     the stairs; used, the wordsmith gives the quest once, while his ring is dark (and it is kept with the run);
//   - on, the town's stairs: their top step takes him down to floor 1, in at its doorway; that doorway walked into
//     brings him back up, out of the town's stairs;
//   - on, the town's gate is barred until the Fleshmancer is beaten: it does not rise; then it rises and leads out to
//     the Quarry, floor 6;
//   - on, floor 4 has a cave in a back wall of its boss's hall and no stairwell: shut while the boss lives; as he dies
//     its wall crumbles, and CAVE_OPENING later walking into it takes him down to floor 5, which begins just inside the
//     cave's other end, its waypoint beside him;
//   - on, the cage's ride up from floor 5 ends in the town's corner: he does nothing until it has opened; the gate is
//     unbarred.
//   run: tsx --test tests/exits.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { doorMiddle, doorTiles } from '../src/game/doors';
import { Game, newGuide } from '../src/game/game';
import { makeDungeon, makeTown } from '../src/game/level';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Level, Monster } from '../src/game/state';
import type { Element } from '../src/game/types';
import { CAVE_OPENING, CURTAIN_SECS, EXITS, GATE_RISE_AT, SHAFT, TOWN_ARRIVE, TOWN_SHAFT, TOWN_STAIR, UNBAR_SECS, UNBAR_SEEN, topStep } from '../src/game/ways';

const DT = 1 / 60;

/** The switch, set for the length of `run` and put back. */
function exitsSet<T>(on: boolean, run: () => T): T {
  const was = EXITS.on;
  EXITS.on = on;
  try {
    return run();
  } finally {
    EXITS.on = was;
  }
}

type Inner = { damageMonster: (m: Monster, dmg: number, el: Element, crit: boolean, skill: number) => void; questPromptT: number };
const inner = (g: Game): Inner => g as unknown as Inner;

function steps(g: Game, n: number, c: Controls = emptyControls()): GameEvent[] {
  const out: GameEvent[] = [];
  for (let k = 0; k < n; k++) {
    g.events.length = 0;
    g.update(DT, { ...c });
    out.push(...g.events);
  }
  return out;
}
function walking(mx: number, my: number): Controls {
  const c = emptyControls();
  c.mx = mx;
  c.my = my;
  return c;
}
function using(): Controls {
  const c = emptyControls();
  c.interact = true;
  return c;
}
function until(g: Game, secs: number, done: () => boolean, c: Controls = emptyControls()): number {
  for (let k = 0; k < secs / DT; k++) {
    if (done()) return k;
    g.events.length = 0;
    g.update(DT, { ...c });
  }
  return done() ? Math.round(secs / DT) : -1;
}
const tileOf = (L: Level, x: number, y: number): number => Math.floor(y) * L.floor.w + Math.floor(x);
function killBoss(g: Game): Monster {
  const boss = g.monsters.find((m) => m.boss)!;
  g.bossReady();
  inner(g).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
  return boss;
}

test('the switch is on in the game (Version 24.1, his “Yes, this part now (Recommended)”); off, the town has no stairs nor shaft, a new player wakes on floor 1, floor 4 its stairwell and floor 5 no mouth', () => {
  assert.equal(EXITS.on, true);
  exitsSet(false, () => {
  const T = makeTown(7);
  assert.equal(T.ways!.stair, null);
  assert.ok(!T.ways!.shaft);
  const g = Game.forFirstRun('warrior', 11);
  assert.equal(g.level.town, false);
  assert.equal(g.depth, 1);
  for (const seed of [3, 17, 29]) {
    const L4 = makeDungeon(4, seed);
    assert.ok(!L4.ways!.cave, 'no cave on floor 4');
    assert.ok(L4.ways!.stairs.length > 0, 'its stairwell');
    assert.ok(!makeDungeon(5, seed).ways!.mouth, 'no mouth on floor 5');
  }
  });
});

test('on, a new game begins in town, a new player too: walking, then the wordsmith\'s quest, then the stairs', () =>
  exitsSet(true, () => {
    const g = Game.forFirstRun('ranger', 23);
    assert.equal(g.level.town, true, 'he begins in town');
    assert.ok(g.guide);
    assert.equal(g.guideStep(), 'move');
    g.guide!.walked = 999;
    assert.equal(g.guideStep(), 'quest');
    // (beside the wordsmith, the use button gives the quest, once)
    const st = g.level.stations.find((s) => s.kind === 'wordsmith')!;
    g.hero.x = st.x;
    g.hero.y = st.y + 1;
    assert.equal(g.handInNear(), 'quest');
    assert.equal(g.interactHint(), 'Talk to the wordsmith');
    const ev = steps(g, 1, using());
    assert.ok(ev.some((e) => e.t === 'questGiven'), 'the quest is given');
    assert.equal(g.questGiven, true);
    assert.equal(g.guideStep(), 'stairs');
    assert.equal(g.handInNear(), null, 'he gives it once');
    // (kept with the run)
    const back = Game.restore(JSON.parse(JSON.stringify(g.save())));
    assert.equal(back.questGiven, true);
    // (with the ring lit, the wordsmith has no quest to give)
    const lit = new Game('mage', 5);
    lit.hero.ring = true;
    assert.equal(lit.questDue(), false);
  }));

test('on, the town\'s stairs: on plain floor, their top step takes him down to floor 1, in at its doorway; walked into, that brings him up out of the town\'s stairs', () =>
  exitsSet(true, () => {
    const g = new Game('warrior', 31);
    g.hero.invuln = 1e9;
    const st = g.level.ways!.stair!;
    assert.ok(st && st.open, 'the stairs are open');
    assert.deepEqual({ x: st.x, y: st.y, way: st.way, long: st.long, wide: st.wide }, TOWN_STAIR);
    const top = topStep(st);
    g.hero.x = top.x - 1.2;
    g.hero.y = top.y;
    const k = until(g, 4, () => g.inDungeon, walking(1, 0));
    assert.ok(k > 0, 'he goes down');
    assert.equal(g.depth, 1);
    const d = g.level.doors[g.level.ways!.gate];
    assert.ok(d, 'floor 1 has its doorway');
    // (back up: into the doorway)
    const i = doorTiles(g.level.floor, d.spot)[1];
    g.hero.x = (i % g.level.floor.w) + 0.5;
    g.hero.y = Math.floor(i / g.level.floor.w) + 0.5;
    assert.ok(until(g, 3, () => g.level.town) > 0, 'up to town');
    const W2 = g.level.ways!;
    const top2 = topStep(W2.stair!);
    assert.ok(Math.hypot(g.hero.x - top2.x, g.hero.y - top2.y) < 1.6, 'beside the stairs');
    assert.equal(g.level.walk[tileOf(g.level, g.hero.x, g.hero.y)], 1, 'on floor he can walk on');
  }));

test('on, the town\'s gate is barred until the Fleshmancer is beaten; then it rises as he comes and leads out to the Quarry, floor 6', () =>
  exitsSet(true, () => {
    const g = new Game('warrior', 41);
    g.hero.invuln = 1e9;
    assert.equal(g.level.ways!.barred, true);
    const d = g.level.doors[g.level.ways!.gate];
    const ti = doorTiles(g.level.floor, d.spot)[1];
    const gx = (ti % g.level.floor.w) + 0.5;
    const gy = Math.floor(ti / g.level.floor.w) + 0.5;
    g.hero.x = gx;
    g.hero.y = gy + 2.5;
    const ev = steps(g, 120);
    assert.equal(d.want, 0, 'barred: it does not rise');
    assert.ok(ev.some((e) => e.t === 'msg' && /barred/.test(e.text)), 'a line says so');
    // (the Fleshmancer beaten: his way on is floor 6)
    g.wayDepth = 6;
    g.enterTown();
    assert.equal(g.level.ways!.barred, false);
    const d2 = g.level.doors[g.level.ways!.gate];
    g.hero.x = gx;
    g.hero.y = gy + GATE_RISE_AT - 1;
    assert.ok(until(g, 3, () => d2.open > 0.9) >= 0, 'it rises');
    assert.ok(until(g, 6, () => g.inDungeon, walking(0, -1)) > 0, 'through it');
    assert.equal(g.depth, 6, 'the Quarry');
  }));

test('on, floor 4 has a cave in a back wall of its boss\'s hall and no stairwell; as the boss dies its wall crumbles, and then walking into it takes him down to floor 5, just inside the cave\'s other end', () =>
  exitsSet(true, () => {
    for (const seed of [3, 17, 29, 101]) {
      const L = makeDungeon(4, seed);
      const cv = L.ways!.cave!;
      assert.ok(cv, `seed ${seed}: a cave`);
      assert.equal(L.ways!.stairs.length, 0);
      assert.equal(cv.state, 'wall');
      const hall = L.floor.rooms.find((r) => r.kind === 'boss')!;
      for (const i of doorTiles(L.floor, cv.spot)) {
        assert.equal(L.walk[i], 0, 'shut while he lives');
        const x = i % L.floor.w;
        const y = Math.floor(i / L.floor.w);
        assert.ok(x >= hall.x - 1 && x <= hall.x + hall.w && y >= hall.y - 1 && y <= hall.y + hall.h, 'in the hall\'s wall');
      }
      const L5 = makeDungeon(5, seed);
      const m = L5.ways!.mouth!;
      assert.ok(m, `seed ${seed}: floor 5's mouth`);
      for (const i of doorTiles(L5.floor, m)) assert.equal(L5.walk[i], 0, 'nobody goes back into it');
      assert.ok(L5.ways!.way, 'its waypoint');
      assert.ok(Math.hypot(L5.ways!.way!.x - L5.floor.start.x, L5.ways!.way!.y - L5.floor.start.y) < 4, 'beside where he comes in');
    }
    const g = new Game('warrior', 53);
    g.hero.invuln = 1e9;
    g.depth = 4;
    g.cleared = 3;
    g.enterDungeon();
    const cv = g.level.ways!.cave!;
    const ev: GameEvent[] = [];
    g.events.length = 0;
    killBoss(g);
    ev.push(...g.events);
    assert.ok(ev.some((e) => e.t === 'caveOpens'), 'the wall crumbles');
    assert.equal(cv.state, 'falling');
    const k = until(g, CAVE_OPENING + 1, () => cv.state === 'open');
    assert.ok(k > 0 && Math.abs(k * DT - CAVE_OPENING) < 0.1, 'open CAVE_OPENING after');
    for (const i of doorTiles(g.level.floor, cv.spot)) assert.equal(g.level.walk[i], 1);
    const i = doorTiles(g.level.floor, cv.spot)[1];
    g.hero.x = (i % g.level.floor.w) + 0.5;
    g.hero.y = Math.floor(i / g.level.floor.w) + 0.5;
    assert.ok(until(g, 3, () => g.depth === 5) > 0, 'down to floor 5');
    assert.equal(g.cleared, 4);
    const f = g.level.floor;
    assert.ok(Math.hypot(g.hero.x - f.start.x, g.hero.y - f.start.y) < 0.01, 'he comes in where the floor begins');
    assert.ok(g.level.ways!.mouth, 'just inside its mouth');
  }));

test('on, the cage\'s ride up from floor 5 ends in the town\'s corner: he does nothing until it has opened, and the gate is unbarred', () =>
  exitsSet(true, () => {
    const g = new Game('warrior', 67);
    g.hero.invuln = 1e9;
    g.depth = 5;
    g.cleared = 4;
    g.wayDepth = 5;
    g.enterDungeon();
    killBoss(g);
    const sh = g.level.ways!.shaft!;
    assert.ok(until(g, SHAFT.down + 1, () => sh.state === 'down') > 0);
    g.hero.x = sh.x + 0.5;
    g.hero.y = sh.y + 0.5;
    const ev: GameEvent[] = [];
    until(g, SHAFT.up + 2, () => {
      if (g.events.length) ev.push(...g.events);
      return g.level.town;
    });
    ev.push(...g.events);
    assert.equal(g.level.town, true);
    assert.equal(g.wayDepth, 6);
    // (its bars still on it: they are struck off the first time he comes in sight of it, the art chat's film)
    assert.ok(!ev.some((e) => e.t === 'gateUnbarred'), 'not yet: the gate is out of sight');
    assert.equal(g.level.ways!.barred, true);
    assert.equal(g.level.ways!.unbar, -1);
    const T = g.level.ways!.shaft!;
    assert.deepEqual({ x: T.x, y: T.y }, TOWN_SHAFT);
    assert.equal(T.state, 'arriving');
    assert.equal(g.arriving(), true);
    const x0 = g.hero.x;
    steps(g, 30, walking(-1, 0));
    assert.equal(g.hero.x, x0, 'he does nothing while it comes up');
    until(g, TOWN_ARRIVE + 1, () => !g.arriving());
    assert.equal(T.state, 'still');
    steps(g, 30, walking(-1, -1));
    assert.ok(g.hero.x < x0, 'then he walks out');
    // (in sight of the gate: its bars are struck off, and it stays shut while they come down; then it rises as he comes)
    const W = g.level.ways!;
    const gate = doorMiddle(g.level.doors[W.gate].spot);
    g.hero.x = gate.x + 0.5;
    g.hero.y = gate.y + UNBAR_SEEN - 1;
    const seen: GameEvent[] = [];
    seen.push(...steps(g, 2, emptyControls()));
    until(g, 1, () => {
      seen.push(...g.events);
      return W.unbar !== -1;
    });
    seen.push(...g.events);
    assert.ok(seen.some((e) => e.t === 'gateUnbarred'), 'the gate unbarred, in sight');
    assert.equal(W.barred, true, 'shut while its bars come down');
    g.hero.x = gate.x;
    g.hero.y = gate.y + 2;
    until(g, UNBAR_SECS + 0.5, () => W.barred === false);
    assert.equal(W.barred, false);
    assert.ok(until(g, 2, () => g.level.doors[W.gate].want === 1) >= 0, 'then it rises as he comes');
    void newGuide;
    void CURTAIN_SECS;
  }));
