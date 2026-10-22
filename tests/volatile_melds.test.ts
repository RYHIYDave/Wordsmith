// VOLATILE'S MELDS (behind VOLT_MELDS, game/melds.ts, off): the five of his page "Wordsmith: Word Combinations" left out on
// 13 Oct 2026 by his pick “Only damage words meld”. His words to the main chat, 21 Oct 2026 (Pacific), 19:29: “Can you also add
// the volatile melds”; 19:30: “We have info on them but I’d like them to be in the game”. Their looks are the art chat's to draw
// (his pick by 19:31, “The art chat (Recommended)”); until his yes to them the switch stays off. These tests hold:
//   1. off: none of them can be made, and the game's words are as they were;
//   2. on: each damage word melds with Volatile into its own, and Volatile with nothing else;
//   3. in front: Demolition's bigger explosions and the half-life burst; Powderkeg's blast setting others burning; Shatter's shards;
//      Chain Reaction's arcs; Rupture's poison;
//   4. behind: Demolition's one huge slow rune; Powderkeg's burning ground; Shatter's freezing; Chain Reaction's linked runes;
//      Rupture's cloud.
//   run: tsx --test tests/volatile_melds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { MELD_TUNE, VOLT_MELDS, meldOf, meldProblem, wordIds } from '../src/game/melds';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster, Zone } from '../src/game/state';
import { VOLT_MELD_IDS } from '../src/game/types';
import type { ClassId, MonsterKind, WordId } from '../src/game/types';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  damageMonster(m: Monster, dmg: number, el: 'phys' | 'fire' | 'frost' | 'lightning', crit: boolean, skill: number): void;
  addRune(i: number, x: number, y: number, frac: number): void;
}

function volt<T>(fn: () => T): T {
  const was = VOLT_MELDS.on;
  VOLT_MELDS.on = true;
  try {
    return fn();
  } finally {
    VOLT_MELDS.on = was;
  }
}

function room(cls: ClassId, words: readonly [number, 'front' | 'behind', WordId][]): { g: Game; a: Inside } {
  const g = Game.forPractice(cls, 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  for (const [i, side, w] of words) {
    h.words[w] = (h.words[w] ?? 0) + 1;
    assert.equal(g.socket(i, side, w), null, `${w} goes ${side} of ability ${i}`);
  }
  g.events.length = 0;
  return { g, a };
}

function put(g: Game, a: Inside, dx: number, dy: number, rank: 0 | 1 | 2 = 0): Monster {
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, rank, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1000;
  return m;
}

function run(g: Game, secs: number): GameEvent[] {
  const seen: GameEvent[] = [];
  for (let t = 0; t < secs - 1e-9; t += DT) {
    g.update(DT, emptyControls());
    seen.push(...g.events);
    g.events.length = 0;
  }
  return seen;
}

/** `m` killed by ability 0. */
function killBy(g: Game, m: Monster): void {
  m.lastSkill = 0;
  g.kill(m);
}

test('1. off, as it is: none of the five can be made, and the words are as they were', () => {
  assert.equal(VOLT_MELDS.on, false, 'off until his yes to their looks');
  assert.equal(meldOf('power', 'volatile'), null);
  assert.equal(meldProblem('power', 'volatile'), 'Only damage words meld');
  for (const m of VOLT_MELD_IDS) assert.ok(!wordIds().includes(m), `${m} is no word of a hero's`);
});

test('2. on: each damage word melds with Volatile into its own, and Volatile with nothing else', () => {
  volt(() => {
    const pairs: [WordId, WordId][] = [['power', 'volatile'], ['fire', 'volatile'], ['frost', 'volatile'], ['lightning', 'volatile'], ['poison', 'volatile']];
    assert.deepEqual(pairs.map(([a, b]) => meldOf(a, b)), ['demolition', 'powderkeg', 'shatter', 'chainreaction', 'rupture']);
    assert.deepEqual(pairs.map(([a, b]) => meldOf(b, a)), ['demolition', 'powderkeg', 'shatter', 'chainreaction', 'rupture'], 'either way round');
    for (const [a, b] of pairs) assert.equal(meldProblem(a, b), null);
    assert.ok(meldProblem('volatile', 'swift'), 'not with a shaping word');
    assert.ok(meldProblem('volatile', 'volatile'), 'not with itself');
    for (const m of VOLT_MELD_IDS) assert.ok(wordIds().includes(m));
  });
});

test("3a. Demolition in front: bigger explosions, and an elite bursts once at half its life", () => {
  volt(() => {
    const { g, a } = room('warrior', [[0, 'front', 'demolition']]);
    const r = g.hero.skills[0].r;
    assert.ok(r.volatile > 0 && r.meld === 'demolition', 'Volatile at work in it');
    const dead = put(g, a, 2, 0);
    const near = put(g, a, 2 + 2.2, 0);
    killBy(g, dead);
    const seen = run(g, 0.3);
    const burst = seen.find((e) => e.t === 'burst' && e.meld === 'demolition') as Extract<GameEvent, { t: 'burst' }> | undefined;
    assert.ok(burst && Math.abs(burst.r - 1.8 * MELD_TUNE.demolition.bigger) < 1e-9, 'half as wide again');
    assert.ok(near.life < near.maxLife, 'and it reaches one 2.2 tiles off');
    // the elite's half-life burst
    const elite = put(g, a, -2, 0, 1);
    const by = put(g, a, -2, 1.2);
    a.damageMonster(elite, 400, 'phys', false, 0);
    assert.ok(!elite.demolished, 'not yet');
    a.damageMonster(elite, 200, 'phys', false, 0);
    assert.ok(elite.demolished, 'at half its life');
    run(g, 0.3);
    assert.ok(by.life < by.maxLife, 'what stands by it is struck');
    const once = by.life;
    a.damageMonster(elite, 100, 'phys', false, 0);
    run(g, 0.3);
    assert.equal(by.life, once, 'once only');
  });
});

test('3b. Powderkeg sets what its blast strikes burning; Shatter bursts a frozen one into shards; Rupture splashes its poison', () => {
  volt(() => {
    const { g, a } = room('warrior', [[0, 'front', 'powderkeg']]);
    const m = put(g, a, 2, 0);
    m.burnT = 2;
    m.burnDps = 5;
    const n = put(g, a, 3, 0);
    killBy(g, m);
    run(g, 0.3);
    assert.ok(n.burnT > 0, 'set burning');
  });
  volt(() => {
    const { g, a } = room('warrior', [[0, 'front', 'shatter']]);
    const m = put(g, a, 2, 0);
    m.frozenT = 1;
    const n = put(g, a, 3.2, 0);
    killBy(g, m);
    assert.equal(n.maxLife - n.life, Math.round(m.maxLife * MELD_TUNE.shatter.share), 'a share of its life');
    assert.ok(n.chillT > 0, 'and chilled');
  });
  volt(() => {
    const { g, a } = room('warrior', [[0, 'front', 'rupture']]);
    const m = put(g, a, 2, 0);
    m.poisonT = 3;
    m.poisonDps = 20;
    m.poisonN = 1;
    const n = put(g, a, 3.2, 0);
    killBy(g, m);
    assert.ok(n.poisonT > 0 && n.poisonDps >= 20 * MELD_TUNE.rupture.share - 1e-9, 'its poison splashed');
  });
});

test("3c. Chain Reaction: an explosion arcs to the nearest, and what they kill explodes in its turn", () => {
  volt(() => {
    const { g, a } = room('warrior', [[0, 'front', 'chainreaction']]);
    const m = put(g, a, 2, 0);
    const near = [put(g, a, 4.6, 0), put(g, a, 2, 2.6), put(g, a, 2, -2.6)];
    for (const o of near) o.life = 1;
    killBy(g, m);
    const seen = run(g, 0.8);
    assert.ok(seen.filter((e) => e.t === 'arc' && e.meld === 'chainreaction').length >= 3, 'three arcs');
    assert.ok(near.every((o) => o.dead), 'the three struck down');
    assert.ok(seen.filter((e) => e.t === 'burst' && e.meld === 'chainreaction').length >= 2, 'and what they killed exploded too');
  });
});

test("4. behind: Demolition's one huge slow rune; Powderkeg's burning ground; Shatter's freezing; Chain Reaction's linked runes; Rupture's cloud", () => {
  volt(() => {
    const { g, a } = room('mage', [[0, 'behind', 'demolition']]);
    a.addRune(0, 18, 15.5, 1);
    a.addRune(0, 20, 15.5, 1);
    const runes = a.zones.filter((z) => z.kind === 'rune');
    assert.equal(runes.length, 1, 'one at a time');
    assert.ok(Math.abs(runes[0].dur - 1.2 * MELD_TUNE.demolition.runeSlow) < 1e-9 && runes[0].r >= 2.0 * MELD_TUNE.demolition.runeWide * 0.99 * g.hero.skills[0].r.size);
  });
  volt(() => {
    const { g, a } = room('mage', [[0, 'behind', 'powderkeg']]);
    a.addRune(0, 18, 15.5, 1);
    run(g, 1.4);
    assert.ok(a.zones.some((z) => z.kind === 'burn' && z.meld === 'powderkeg'), 'burning ground where it went off');
  });
  volt(() => {
    const { g, a } = room('mage', [[0, 'behind', 'shatter']]);
    const m = put(g, a, 3.5, 0);
    a.addRune(0, m.x, m.y, 1);
    run(g, 1.2 - MELD_TUNE.shatter.freezeBefore + 0.05);
    assert.ok(m.frozenT > 0, 'frozen before it goes off');
  });
  volt(() => {
    const { g, a } = room('mage', [[0, 'behind', 'chainreaction']]);
    a.addRune(0, 18, 15.5, 1);
    run(g, 0.6);
    a.addRune(0, 18, 18.5, 1);
    const seen = run(g, 0.8);
    assert.equal(a.zones.filter((z) => z.kind === 'rune').length, 0, 'the second set off by the first, early');
    assert.ok(seen.some((e) => e.t === 'arc' && e.meld === 'chainreaction'), 'the link between them shown');
  });
  volt(() => {
    const { g, a } = room('mage', [[0, 'behind', 'rupture']]);
    a.addRune(0, 18, 15.5, 1);
    run(g, 1.4);
    assert.ok(a.zones.some((z) => z.kind === 'venom' && z.meld === 'rupture'), 'a poison cloud where it went off');
  });
});
