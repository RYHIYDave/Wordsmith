// THE BOSS'S ENTRANCE AND THE FLOORS' NAMES (game/defs.ts BOSS_INTRO and FLOOR_NAMES; ui/cards.ts). His
// words, 10 Oct 2026, 21:30: "I’d like the boss fights to go like this.  The gate closes and the boss says
// a little line.  And the boss’s name shows up all stylized on the screen.  And I like the first 5 levels
// to be called Prison Level 1, Prison Level 2, so on.  But when you enter the next dungeon it’s called
// something that relates to the boss or the location.  And that is also stylized with the actual level
// under that in smaller font"; his pick at 21:33, "A"; at 21:49, to films of it: "Yeah man looks
// awesome.  Makes sure the boss spawns far enough back so it can’t be hit before your character enters
// the gate".
//
// What is held here:
//   - both switches are on in the game;
//   - every floor has its own name and its level, "Prison Level N"; coming into a floor says them
//     (for the screen to show), and not the old line "Dungeon N";
//   - the boss waits at the back of his hall, well further in than its middle;
//   - until his gate falls behind the hero he stands where he is, and nothing harms him;
//   - the gate falls: he says one of his lines and his name is given, and for BOSS_INTRO.secs he stands
//     and nothing harms him; then he fights and can be hurt;
//   - with the switch off the boss is where he was, and fights at once.
//   run: tsx --test tests/boss_intro.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BOSS_INTRO, BOSS_LINES, FLOOR_NAMES, floorTitle } from '../src/game/defs';
import { GATE_INSIDE, insideBy } from '../src/game/doors';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';

const DT = 1 / 60;

function withIntro<T>(on: boolean, run: () => T): T {
  const was = BOSS_INTRO.on;
  BOSS_INTRO.on = on;
  try {
    return run();
  } finally {
    BOSS_INTRO.on = was;
  }
}

/** A dungeon at `depth`, with nothing in it but its boss, the hero `inside` tiles in from the boss's gate on the line to him. */
function hall(seed: number, depth: number, inside: number): { g: Game; boss: Monster; events: GameEvent[] } {
  const g = new Game('ranger', seed);
  g.depth = depth;
  g.cleared = depth - 1;
  g.enterDungeon();
  g.monsters = g.monsters.filter((m) => m.boss);
  const boss = g.boss as Monster;
  const s = g.level.doors.find((d) => d.spot.kind === 'bossgate')!.spot;
  const gx = s.alongX ? s.a + 1.5 : s.plane;
  const gy = s.alongX ? s.plane : s.a + 1.5;
  const n = Math.hypot(boss.x - gx, boss.y - gy);
  const k = inside / Math.max(0.01, insideBy(s, boss.x, boss.y));
  g.hero.x = gx + ((boss.x - gx) / n) * n * k;
  g.hero.y = gy + ((boss.y - gy) / n) * n * k;
  g.hero.life = g.hero.d.maxLife;
  const events: GameEvent[] = [];
  return { g, boss, events };
}

function steps(g: Game, secs: number, events: GameEvent[]): void {
  const c = emptyControls();
  for (let t = 0; t < secs; t += DT) {
    g.hero.life = g.hero.d.maxLife;
    g.update(DT, c);
    events.push(...g.events);
    g.events.length = 0;
  }
}

const hurt = (g: Game, m: Monster, n: number): void => (g as unknown as { damageMonster: (m: Monster, n: number, el: string, crit: boolean, skill: number) => void }).damageMonster(m, n, 'phys', false, 0);

test('both switches are on in the game (his yes of 21:49)', () => {
  assert.equal(BOSS_INTRO.on, true);
  assert.equal(FLOOR_NAMES.on, true);
});

test('every floor has its own name and its level, "Prison Level N"; coming into a floor says them, and not "Dungeon N"', () => {
  const names = [1, 2, 3, 4, 5].map((d) => floorTitle(d).name);
  assert.equal(new Set(names).size, 5, 'five names, each its own');
  for (let d = 1; d <= 5; d++) assert.equal(floorTitle(d).level, `Prison Level ${d}`);
  // (ACT 1, THE DESCENT: floors 6 to 10 are out of the Prison and down the mountain, each its place and its boss's name: game/act1.ts)
  const places = ['The Quarry', 'The Ledge Road', 'Echo Canyon', 'The Pinewood', 'The Sunken Fen'];
  for (let d = 6; d <= 10; d++) assert.equal(floorTitle(d).level, `${places[d - 6]}, Level ${d}`);
  assert.equal(floorTitle(6).name, 'The Unfinished Cut');
  assert.equal(floorTitle(11).name, FLOOR_NAMES.beyond, 'past the tenth, the deep’s');
  const g = new Game('warrior', 5);
  g.depth = 2;
  g.cleared = 1;
  g.events.length = 0;
  g.enterDungeon();
  const named = g.events.find((e) => e.t === 'floorName') as { name: string; level: string } | undefined;
  assert.deepEqual(named && { name: named.name, level: named.level }, floorTitle(2));
  assert.equal(g.events.some((e) => e.t === 'msg' && /^Dungeon \d/.test(e.text)), false, 'no line "Dungeon 2"');
});

test('the boss waits at the back of his hall, well further in than its middle', () => {
  for (const seed of [9, 11, 23, 57, 101, 404]) {
    for (const depth of [1, 2, 3, 4, 5]) {
      const g = new Game('warrior', seed);
      g.depth = depth;
      g.cleared = depth - 1;
      g.enterDungeon();
      const s = g.level.doors.find((d) => d.spot.kind === 'bossgate')!.spot;
      const b = g.boss as Monster;
      const at = `dungeon ${depth}, seed ${seed}`;
      assert.ok(insideBy(s, b.x, b.y) >= insideBy(s, g.level.floor.boss.x, g.level.floor.boss.y) + 2, `${at}: further in than the hall's middle`);
      assert.ok(insideBy(s, b.x, b.y) >= 8, `${at}: ${insideBy(s, b.x, b.y).toFixed(1)} tiles in from his gate`);
    }
  }
});

test('until his gate falls behind the hero, the boss stands where he is, and nothing harms him', () => {
  const { g, boss, events } = hall(9, 1, GATE_INSIDE - 1.5);
  const at = [boss.x, boss.y];
  steps(g, 3, events);
  assert.equal(g.level.doors.find((d) => d.spot.kind === 'bossgate')!.want, 1, 'his gate is still up');
  assert.deepEqual([boss.x, boss.y], at, 'he has not moved');
  const life = boss.life;
  hurt(g, boss, 50);
  assert.equal(boss.life, life, 'a blow does nothing to him');
  assert.equal(events.some((e) => e.t === 'bossIntro'), false);
});

test('the gate falls: he says one of his lines and his name is given; he stands, unharmed, for BOSS_INTRO.secs; then he fights, and can be hurt', () => {
  const { g, boss, events } = hall(9, 1, GATE_INSIDE + 1);
  const at = [boss.x, boss.y];
  steps(g, 0.1, events);
  const intro = events.find((e) => e.t === 'bossIntro') as { name: string; line: string | null; secs: number } | undefined;
  assert.ok(intro, 'his entrance');
  assert.equal(intro!.name, boss.name);
  assert.ok(intro!.line !== null && BOSS_LINES.warden!.includes(intro!.line), `one of his lines: ${intro!.line}`);
  assert.equal(intro!.secs, BOSS_INTRO.secs);
  assert.equal(g.level.doors.find((d) => d.spot.kind === 'bossgate')!.want, 0, 'his gate is down');
  steps(g, BOSS_INTRO.secs - 0.3, events);
  assert.deepEqual([boss.x, boss.y], at, 'he stands while he says it');
  const life = boss.life;
  hurt(g, boss, 50);
  assert.equal(boss.life, life, 'and nothing harms him');
  steps(g, 2, events);
  assert.ok(Math.hypot(boss.x - at[0], boss.y - at[1]) > 0.3 || events.some((e) => e.t === 'hit' && e.onHero), 'then he fights: he comes at the hero, or strikes him');
  const now = boss.life;
  hurt(g, boss, 50);
  assert.equal(boss.life, now - 50, 'and can be hurt');
});

test('with the switch off the boss is where he was, and fights at once', () => {
  withIntro(false, () => {
    const g = new Game('ranger', 9);
    g.depth = 1;
    g.enterDungeon();
    const f = g.level.floor;
    const b = g.boss as Monster;
    assert.ok(Math.hypot(b.x - f.boss.x, b.y - f.boss.y) <= Math.hypot(1, 2) + 0.01, 'by the hall’s middle');
    const life = b.life;
    hurt(g, b, 50);
    assert.equal(b.life, life - 50);
  });
});
