// THE QUEST LINE OF FLOORS 1 TO 5 (game/quests15.ts, QUESTS15, off until his yes in play with the art chat's pictures). His words,
// 4 Nov 2026, 00:27, read back to him in six steps: “Yes, that's it (Recommended)”; the Meldstone's, 08:22; “Go”, 6 Nov, 13:02.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { doorTiles } from '../src/game/doors';
import { Game } from '../src/game/game';
import { meldOf } from '../src/game/melds';
import { FURNACE_WORD, MELDSTONE_WORDS, QUESTS15 } from '../src/game/quests15';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { Element } from '../src/game/types';
import { EXITS } from '../src/game/ways';
import { STOKER_ON } from '../src/art/stoker';
import { FIRE_GONE } from '../src/game/quests15';
import { GEAR_PERIL } from '../src/game/act1_rules/stoker';
import { ST_DIES } from '../src/art/stoker_moves';

const DT = 1 / 60;
type Inner = { handIn: () => boolean; damageMonster: (m: Monster, dmg: number, el: Element, crit: boolean, skill: number) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

function on<T>(run: () => T, q = true, stoker = false): T {
  const was = [QUESTS15.on, EXITS.on, STOKER_ON.on];
  QUESTS15.on = q;
  EXITS.on = true;
  STOKER_ON.on = stoker;
  try {
    return run();
  } finally {
    [QUESTS15.on, EXITS.on, STOKER_ON.on] = was;
  }
}
function at(g: Game, kind: string): void {
  const s = g.level.stations.find((q) => q.kind === kind);
  assert.ok(s, `the ${kind} in town`);
  g.hero.x = s!.x;
  g.hero.y = s!.y;
}
function steps(g: Game, n: number): void {
  for (let k = 0; k < n; k++) {
    g.events.length = 0;
    g.update(DT, emptyControls());
  }
}
function down3(g: Game): void {
  g.depth = 3;
  g.cleared = 2;
  g.wayDepth = 3;
  g.enterDungeon();
}

test('off, nothing of it: floor 3 as it was, the armourer his shop', () =>
  on(() => {
    const g = new Game('warrior', 7);
    g.hero.ring = true;
    g.enterTown();
    at(g, 'armourer');
    assert.equal(g.handInNear(), null);
    down3(g);
    assert.ok(!g.level.furnace, 'no furnace room');
  }, false));

test('the whole line: the armourer asks, floor 3 burns, the keeper\'s gear, the crank, the reward, the Meldstone asked and brought', () =>
  on(() => {
    const g = new Game('warrior', 7);
    const h = g.hero;
    // (before the ring is lit, the armourer has nothing)
    h.ring = false;
    g.enterTown();
    at(g, 'armourer');
    assert.equal(g.handInNear(), null, 'nothing before the ring');
    h.ring = true;
    assert.equal(g.handInNear(), 'furnace');
    assert.ok(inner(g).handIn());
    assert.equal(h.furnace, 'asked');
    assert.equal(g.handInNear(), null, 'asked once');

    // FLOOR 3: the furnace room, its keeper and crank; the hall's portcullis held down
    down3(g);
    const F = g.level.furnace!;
    assert.ok(F, 'a furnace room');
    const keeper = g.monsters.find((m) => m.id === F.keeper)!;
    assert.ok(keeper && keeper.maxLife > 200, `its keeper, of many lives (${keeper?.maxLife})`);
    const r = F.room;
    assert.ok(F.crank.tx >= r.x && F.crank.tx < r.x + r.w && F.crank.ty >= r.y && F.crank.ty < r.y + r.h, 'the crank in the room');
    const boss = g.level.floor.rooms.find((q) => q.kind === 'boss')!;
    assert.ok(!(r.x === boss.x && r.y === boss.y), 'not the hall');
    if (F.gate >= 0) {
      const d = g.level.doors[F.gate];
      assert.equal(d.want, 0, 'the portcullis down');
      for (const i of doorTiles(g.level.floor, d.spot)) assert.equal(g.level.walk[i], 0, 'its way barred');
    }
    // (the crank without its gear: nothing)
    h.x = F.crank.x + 0.6;
    h.y = F.crank.y;
    steps(g, 5);
    assert.equal(h.furnace, 'asked', 'no gear, no turning');
    assert.equal(F.out, false);
    // (the keeper killed: his gear; he stands away from the crank)
    h.x = r.x + r.w - 0.5;
    h.y = r.y + r.h - 0.5;
    h.invuln = 1e9;
    inner(g).damageMonster(keeper, 1e9, 'phys', false, 0);
    steps(g, 3);
    assert.equal(h.furnace, 'gear');
    // (the crank, with it: the furnace out, the way open)
    h.x = F.crank.x + 0.6;
    h.y = F.crank.y;
    steps(g, 5);
    assert.equal(h.furnace, 'out');
    assert.equal(F.out, true);
    if (F.gate >= 0) assert.equal(g.level.doors[F.gate].want, 1, 'the portcullis up');

    // TOWN: the armourer's reward, a word by class (not the class's first)
    g.enterTown();
    at(g, 'armourer');
    assert.equal(g.handInNear(), 'reward');
    const w = FURNACE_WORD.warrior;
    const n0 = h.words[w];
    inner(g).handIn();
    assert.equal(h.words[w], n0 + 1, `the armourer's word, ${w}`);
    assert.equal(h.furnace, 'done');
    assert.equal(g.handInNear(), null);

    // THE WORDSMITH: his ask for the Meldstone; then the Meldstone brought: two words, and the gate unbarred
    at(g, 'wordsmith');
    assert.equal(g.handInNear(), 'meldAsk');
    inner(g).handIn();
    assert.equal(h.meldAsk, true);
    h.meld = 'stone';
    g.wayDepth = 5;
    const [a, b] = MELDSTONE_WORDS;
    const na = h.words[a];
    const nb = h.words[b];
    assert.equal(g.handInNear(), 'meldstone');
    inner(g).handIn();
    assert.equal(h.meld, 'open');
    assert.equal(h.words[a], na + 1);
    assert.equal(h.words[b], nb + 1);
    assert.ok(g.wayDepth >= 6, 'the gate down the mountain unbarred');
    assert.ok(meldOf(a, b), 'the two words meld');
  }));

test('the reward is never the class\'s first word', async () => {
  const { FIRST_WORD } = await import('../src/game/defs');
  for (const [cls, w] of Object.entries(FURNACE_WORD)) assert.notEqual(w, FIRST_WORD[cls as keyof typeof FIRST_WORD].word, cls);
});

test('a hero who has been down past floor 3 already: no fire, no furnace room', () =>
  on(() => {
    const g = new Game('warrior', 7);
    g.hero.ring = true;
    g.depth = 3;
    g.cleared = 3;
    g.wayDepth = 4;
    g.enterDungeon();
    assert.ok(!g.level.furnace);
  }));

test('save and load keep the quest\'s step and the ask', () =>
  on(() => {
    const g = new Game('warrior', 7);
    g.hero.furnace = 'gear';
    g.hero.meldAsk = true;
    const s = g.save();
    const g2 = Game.restore(JSON.parse(JSON.stringify(s)));
    assert.equal(g2.hero.furnace, 'gear');
    assert.equal(g2.hero.meldAsk, true);
  }));

test('THE STOKER (his art in): his arena at the end of an open hallway; he fights; his gear lies and is taken; the crank; the fire goes out, the way opens', () =>
  on(() => {
    const g = new Game('warrior', 7);
    const h = g.hero;
    h.ring = true;
    h.furnace = 'asked';
    down3(g);
    const L = g.level;
    const F = L.furnace!;
    const A = L.arena!;
    assert.ok(A && F && F.spot, 'the arena, the furnace in its wall');
    const keeper = g.monsters.find((m) => m.id === F.keeper)!;
    assert.equal(keeper.kind, 'stoker');
    assert.ok(keeper.x >= A.room.x && keeper.x < A.room.x + A.room.w && keeper.y >= A.room.y && keeper.y < A.room.y + A.room.h, 'he stands in it');
    // (the way to him open from where the floor begins, through the floor's doors (each opens as it is walked up to) and the hallway)
    const W = L.floor.w;
    const ways = new Uint8Array(L.walk);
    for (const dd of L.doors) if (dd.spot.kind !== 'bossgate') for (const i of doorTiles(L.floor, dd.spot)) ways[i] = 1;
    const seen = new Uint8Array(L.walk.length);
    const q = [Math.floor(L.floor.start.y) * W + Math.floor(L.floor.start.x)];
    seen[q[0]] = 1;
    while (q.length) {
      const i = q.pop()!;
      for (const j of [i + 1, i - 1, i + W, i - W]) if (ways[j] === 1 && !seen[j]) {
        seen[j] = 1;
        q.push(j);
      }
    }
    assert.equal(seen[Math.floor(keeper.y) * W + Math.floor(keeper.x)], 1, 'he can be walked to');
    // (the hall's way barred by the fire, its portcullis up)
    const d = L.doors[F.gate];
    steps(g, 2);
    for (const i of doorTiles(L.floor, d.spot)) assert.equal(L.walk[i], 0, 'barred by the fire');
    // (he fights: a hero five tiles off, kept alive, sees his fire)
    h.x = keeper.x + 4;
    h.y = keeper.y;
    h.invuln = 0;
    let fire = 0;
    for (let k = 0; k < 60 * 12; k++) {
      g.update(DT, emptyControls());
      h.life = h.d.maxLife;
      if (g.perils.some((p) => p.a1 === 'stoker:coals' || p.a1 === 'stoker:rake')) fire++;
      if (g.over) break;
    }
    assert.ok(fire > 0, 'his coals or his rake');
    // (killed: his gear lies, and is taken once it lies still)
    h.invuln = 1e9;
    h.x = A.room.x + 0.6;
    h.y = A.room.y + 0.6;
    inner(g).damageMonster(keeper, 1e9, 'phys', false, 0);
    steps(g, 2);
    const gear = g.perils.find((p) => p.a1 === GEAR_PERIL);
    assert.ok(gear, 'his gear');
    assert.notEqual(h.furnace, 'gear', 'not his till it is taken');
    steps(g, Math.ceil(ST_DIES.gearStill * 60) + 5);
    h.x = gear!.x;
    h.y = gear!.y;
    steps(g, 3);
    assert.equal(h.furnace, 'gear', 'taken');
    // (the crank: turned; the fire goes out; the way open after)
    h.x = F.crank.x + 0.6;
    h.y = F.crank.y;
    steps(g, 3);
    assert.equal(h.furnace, 'out');
    assert.equal(F.out, true);
    for (const i of doorTiles(L.floor, d.spot)) assert.equal(L.walk[i], 0, 'still burning as it goes out');
    h.x = A.room.x + 0.6;
    h.y = A.room.y + 0.6;
    steps(g, Math.ceil(FIRE_GONE * 60) + 10);
    assert.ok(F.gone);
    for (const i of doorTiles(L.floor, d.spot)) assert.equal(L.walk[i], 1, 'the way open');
  }, true, true));
