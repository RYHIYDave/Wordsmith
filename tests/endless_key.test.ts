// ENDLESS MODE'S KEY (src/game/endless_key.ts; behind ENDLESS_KEY, off). His idea, 7 Nov 2026: the bosses of endless floors 5, 10,
// 15 and 20 each drop a quarter of a stone tablet; the four set in the wordsmith's bench open a portal to a final boss. His picks:
// a quarter drops “Always, if you lack it (Recommended)”; the tablet is “Used up, collect again (Recommended)”; a fallen hero's
// quarters are “Kept in the shared stash”.
//   1. off, nothing: no quarter drops, the trophies wall is empty, the wordsmith has nothing to take;
//   2. on: the boss of an endless level on floor 5 drops the first quarter, once; taken, it is the account's (and so the next
//      hero's), cleaned and kept in its record; none from floor 6, none when held already, none outside endless mode;
//   3. at the Shaft's Rim the quarters held hang on the trophies wall; the four held, the wordsmith sets them in his bench: they
//      are used up, the landing opens when the bench's flare is done, and stays open for him (kept in his save) until he goes
//      down; walked into, it takes him down into its light (stage 2: tests/final_fight.test.ts).
//   run: tsx --test tests/endless_key.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { PORTAL_OPEN_FRAMES } from '../src/art/endless_portal';
import { ENDLESS_TOWN, LANDING } from '../src/art/shaft_rim';
import { lastFloor } from '../src/game/act1';
import { ENDLESS } from '../src/game/endless';
import { ENDLESS_KEY, KEY_TIMES, quarterOf, quartersOf, tabletWhole } from '../src/game/endless_key';
import { Game, cleanMeta } from '../src/game/game';
import type { Drop, Monster } from '../src/game/state';
import { seasoned } from './helpers';

type Inner = { takeWay(t: string): void; questThingTaken(d: Drop): void; handIn(): boolean; updateKey(dt: number): void };
const inner = (g: Game): Inner => g as unknown as Inner;

function keyed<T>(fn: () => T, on = true): T {
  const was = [ENDLESS_KEY.on, ENDLESS.on, ENDLESS_TOWN.on] as const;
  ENDLESS_KEY.on = on;
  ENDLESS.on = true;
  ENDLESS_TOWN.on = true;
  try {
    return fn();
  } finally {
    [ENDLESS_KEY.on, ENDLESS.on, ENDLESS_TOWN.on] = was;
  }
}

/** A seasoned hero home at the Shaft's Rim, the last floor beaten. */
function home(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 30);
  g.depth = lastFloor();
  g.cleared = lastFloor() - 1;
  g.wayDepth = lastFloor();
  g.enterDungeon();
  inner(g).takeWay('on');
  return g;
}
/** Down from the Rim into an endless level on this floor. */
function endlessOn(g: Game, floor: number): void {
  g.endlessFloor = floor;
  inner(g).takeWay('way');
  assert.equal(g.depth, floor);
  assert.ok(g.inEndless);
}
const bossOf = (g: Game): Monster => {
  const m = g.monsters.find((q) => q.boss && q.life > 0);
  assert.ok(m, 'the level has its boss');
  return m as Monster;
};
const lines = (g: Game): string[] => g.events.flatMap((e) => (e.t === 'msg' ? [e.text] : []));
const quarters = (g: Game): Drop[] => g.drops.filter((d) => d.kind === 'quest' && d.thing === 'quarter');

test('the quarters: floors 5, 10, 15, 20 in order; bits as the four', () => {
  assert.deepEqual([5, 10, 15, 20].map(quarterOf), [0, 1, 2, 3]);
  assert.equal(quarterOf(6), null);
  assert.deepEqual(quartersOf(0b0101), [true, false, true, false]);
  assert.ok(tabletWhole(15) && !tabletWhole(7));
});

test('off: no quarter drops, the trophies wall is empty, the wordsmith takes nothing', () => keyed(() => {
  const g = home(41);
  g.meta.quarters = 15;
  assert.deepEqual(g.quartersHeld(), [false, false, false, false]);
  assert.notEqual(g.handInNear(), 'tablet');
  endlessOn(g, 5);
  g.kill(bossOf(g));
  assert.equal(quarters(g).length, 0);
}, false));

test('on: the boss of endless floor 5 drops the first quarter, once; taken, it is the account\'s and kept', () => keyed(() => {
  const g = home(42);
  endlessOn(g, 5);
  const b = bossOf(g);
  g.kill(b);
  const q = quarters(g);
  assert.equal(q.length, 1, 'one quarter');
  assert.equal(q[0].quarter, 0, 'the first (floor 5\'s)');
  assert.ok(Math.hypot(q[0].x - b.x, q[0].y - b.y) < 4, 'where he fell');
  inner(g).questThingTaken(q[0]);
  assert.equal(g.meta.quarters, 1);
  assert.deepEqual(g.quartersHeld(), [true, false, false, false]);
  // (his name for it, 14 Nov: “Tablet Shard”, not the boss's)
  assert.ok(lines(g).some((l) => /Tablet Shard\. 1 of 4/.test(l)));
  // (kept in the account's record, cleaned; what is not a quarter thrown out)
  assert.equal(cleanMeta({ ...g.meta, quarters: 1 }).quarters, 1);
  assert.equal(cleanMeta({ ...g.meta, quarters: 'x' as unknown as number }).quarters, undefined);
  assert.equal(cleanMeta({ ...g.meta, quarters: 0b110001 }).quarters, 1);
  // (held already: none again)
  const g2 = home(43);
  g2.meta.quarters = 1;
  endlessOn(g2, 5);
  g2.kill(bossOf(g2));
  assert.equal(quarters(g2).length, 0, 'held already');
  // (floor 6's boss carries none)
  const g3 = home(44);
  endlessOn(g3, 6);
  g3.kill(bossOf(g3));
  assert.equal(quarters(g3).length, 0, 'floor 6');
  // (floor 15's the third)
  const g4 = home(45);
  endlessOn(g4, 15);
  g4.kill(bossOf(g4));
  assert.deepEqual(quarters(g4).map((d) => d.quarter), [2]);
}));

test('on, not endless: floor 5\'s boss on the way down drops no quarter', () => keyed(() => {
  const g = seasoned(new Game('warrior', 46), 8);
  g.depth = 5;
  g.wayDepth = 5;
  g.enterDungeon();
  assert.ok(!g.inEndless);
  g.kill(bossOf(g));
  assert.equal(quarters(g).length, 0);
}));

test('the Rim: the four held, the wordsmith sets them; used up; the landing opens and stays open for him', () => keyed(() => {
  const g = home(47);
  assert.ok(g.level.rim, 'at the Rim');
  const ws = g.level.stations.find((s) => s.kind === 'wordsmith') as { x: number; y: number };
  assert.ok(ws, 'the wordsmith is here');
  g.hero.x = ws.x;
  g.hero.y = ws.y;
  // (three of four: nothing to set)
  g.meta.quarters = 7;
  assert.notEqual(g.handInNear(), 'tablet');
  g.meta.quarters = 15;
  g.enterTown();
  assert.deepEqual(g.level.rim?.held, [true, true, true, true], 'the trophies wall hung with all four');
  g.hero.x = ws.x;
  g.hero.y = ws.y;
  assert.equal(g.handInNear(), 'tablet');
  assert.match(g.interactHint() ?? '', /shards/);
  assert.ok(inner(g).handIn());
  assert.equal(g.meta.quarters, 0, 'used up: collect again');
  assert.equal(g.hero.finalOpen, true);
  assert.deepEqual(g.level.rim?.held, [false, false, false, false]);
  assert.notEqual(g.handInNear(), 'tablet', 'not twice');
  const K = g.level.rim?.key as { age: number; open: boolean };
  assert.ok(K && !K.open);
  // (the landing opens once the bench's flare is done and its own opening has run)
  const opens = KEY_TIMES.portal + PORTAL_OPEN_FRAMES / 30;
  let t = 0;
  while (!K.open && t < 20) {
    inner(g).updateKey(0.05);
    t += 0.05;
  }
  assert.ok(K.open && Math.abs(t - opens) < 0.1, `open at ${t.toFixed(2)} s (the art's ${opens.toFixed(2)})`);
  // (kept in his save: back at the Rim it stands open)
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), g.meta);
  assert.equal(back.hero.finalOpen, true);
  // (walked into: he goes down into its light, to the bottom of the shaft: tests/final_fight.test.ts)
  g.hero.x = LANDING[0];
  g.hero.y = LANDING[1];
  inner(g).updateKey(0.05);
  assert.equal((g as unknown as { leaving: { to: string } | null }).leaving?.to, 'final', 'on his way down');
}));
