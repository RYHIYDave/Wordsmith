// THE MUSTER ROLL (game/quests610.ts MUSTER, off until his yes to its pictures): the strongholds' quest of floors 6 to 10. Planned
// with him 13 Nov 2026: every stronghold of the cult won on 6 to 10 gives up a page of its muster roll; three brought to the mystic
// name the Silent Order and their way in, the sewers; his pick of a fully modded rare belt, amulet or ring (“How about it offers a
// fully modded belt amulet or ring, player chooses”).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import type { RunSave } from '../src/game/game';
import { MUSTER, QUESTS610 } from '../src/game/quests610';
import { QUESTS1115 } from '../src/game/quests1115';
import { emptyControls } from '../src/game/state';
import type { Drop } from '../src/game/state';
import { EXITS } from '../src/game/ways';
import { questBanner } from '../src/ui/guide';
import { seasoned } from './helpers';

type Inner = { handIn: () => boolean; updateHolds: () => void };
const inner = (g: Game): Inner => g as unknown as Inner;

function on<T>(run: () => T, muster = true): T {
  const was = [MUSTER.on, QUESTS610.on, QUESTS1115.on, EXITS.on];
  MUSTER.on = muster;
  QUESTS610.on = true;
  QUESTS1115.on = true;
  EXITS.on = true;
  try {
    return run();
  } finally {
    [MUSTER.on, QUESTS610.on, QUESTS1115.on, EXITS.on] = was;
  }
}

const rollDrops = (g: Game): Drop[] => g.drops.filter((d) => d.kind === 'quest' && d.thing === 'roll');

/** Floor `depth`'s first stronghold won where it stands (its last fight over), the hero far from its door. */
function winHold(g: Game, k = 0): void {
  const L = g.level;
  const st = L.holds![k];
  assert.ok(st, `floor ${g.depth} has a stronghold ${k}`);
  st.entered = true;
  st.wave = 1000;
  g.monsters = [];
  g.hero.x = L.floor.start.x;
  g.hero.y = L.floor.start.y;
  inner(g).updateHolds();
  assert.equal(st.won, true, 'won');
}

function at(depth: number, seed = 11): Game {
  const g = seasoned(new Game('warrior', seed), 30);
  (g as unknown as { god: boolean }).god = true;
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  return g;
}

function walkTo(g: Game, x: number, y: number, secs = 0.8): void {
  for (let i = 0; i < Math.round(secs * 30); i++) {
    g.hero.x = x;
    g.hero.y = y;
    g.hero.life = g.hero.d.maxLife;
    g.update(1 / 30, emptyControls());
  }
}

test('off: a stronghold won gives no page; the mystic has nothing of it', () =>
  on(() => {
    const g = at(6);
    winHold(g);
    assert.equal(rollDrops(g).length, 0);
    assert.equal(g.rollDue(), null);
  }, false));

test('the mystic asks for the roll once she has asked for the feather, and not before', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.wayDepth = 6;
    assert.equal(g.rollDue(), null, 'the feather first');
    g.hero.feather = 'asked';
    assert.equal(g.rollDue(), 'rollAsk');
    g.enterTown();
    const s = g.level.stations.find((q) => q.kind === 'mystic')!;
    g.hero.x = s.x;
    g.hero.y = s.y;
    assert.equal(g.handInNear(), 'rollAsk');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.roll, 'asked');
    assert.equal(g.rollDue(), null, 'asked once');
  }));

test('every stronghold won on 6 to 10 gives a page (asked for or not) until he has three; then none', () =>
  on(() => {
    let taken = 0;
    for (const depth of [6, 7, 8, 9]) {
      const g = at(depth);
      g.hero.rollPages = taken;
      winHold(g);
      const d = rollDrops(g);
      if (taken >= MUSTER.pages) {
        assert.equal(d.length, 0, 'three already: none');
        continue;
      }
      assert.equal(d.length, 1, `floor ${depth}: a page`);
      assert.equal(g.level.walk[Math.floor(d[0].y) * g.level.floor.w + Math.floor(d[0].x)], 1, 'on floor he can walk to');
      walkTo(g, d[0].x, d[0].y);
      assert.equal(g.hero.rollPages, taken + 1);
      taken = g.hero.rollPages!;
    }
    assert.equal(taken, 3);
  }));

test('three pages: "Return to the MYSTIC"; brought, she lays out a fully modded rare belt, amulet and ring; one taken, the others go', () =>
  on(() => {
    const g = at(8);
    g.hero.feather = 'given';
    g.hero.roll = 'asked';
    g.hero.rollPages = 2;
    winHold(g);
    const d = rollDrops(g)[0];
    walkTo(g, d.x, d.y);
    assert.equal(g.turnInFor(), 'mystic');
    assert.equal(questBanner(g)?.text, 'Return to the MYSTIC');
    g.enterTown();
    const s = g.level.stations.find((q) => q.kind === 'mystic')!;
    g.hero.x = s.x;
    g.hero.y = s.y;
    assert.equal(g.handInNear(), 'rollGive');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.roll, 'given');
    const laid = g.drops.filter((q) => q.choice === 'mystic');
    assert.deepEqual(laid.map((q) => q.item!.slot).sort(), ['amulet', 'belt', 'ring']);
    for (const q of laid) {
      assert.equal(q.item!.rarity, 2);
      assert.ok(q.item!.affixes.length >= 3, 'fully modded');
    }
    // (kept in the save until taken)
    const back = Game.restore(JSON.parse(JSON.stringify(g.save())) as RunSave);
    assert.deepEqual(back.hero.laidOut?.mystic?.map((it) => it.uid), g.hero.laidOut?.mystic?.map((it) => it.uid));
    const has = (): number[] => [...g.hero.bag, ...Object.values(g.hero.gear)].filter((it) => !!it).map((it) => it!.uid);
    const before = has().length;
    walkTo(g, laid[0].x, laid[0].y, 1);
    assert.equal(has().length, before + 1, 'one taken');
    assert.equal(g.drops.filter((q) => q.choice === 'mystic').length, 0, 'the others go back');
    assert.equal(g.hero.laidOut, undefined);
    assert.equal(g.rollDue(), null, 'done');
  }));
