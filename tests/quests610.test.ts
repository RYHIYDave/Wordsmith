// THE QUEST LINE OF FLOORS 6 TO 10 (game/quests610.ts, QUESTS610, off), its first part. His words, 7 Nov 2026, 00:18 and 00:23
// (Eastern): the mystic asks for a feather of the Queen vulture; the Queen fallen, a short scene at her eyrie's edge (he walks to
// it, the picture pans out to the town, his line); the feather brought, the way to the Pinewood; there, two pieces of a ward-stone
// in its side areas and a third with the Stag.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { EYRIE_LINES, EYRIE_SCENE, QUESTS610, piecesTaken } from '../src/game/quests610';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { EXITS } from '../src/game/ways';
import { seasoned } from './helpers';

const DT = 1 / 30;
type Inner = { handIn: () => boolean; kill: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

function on<T>(run: () => T): T {
  const was = [QUESTS610.on, EXITS.on];
  QUESTS610.on = true;
  EXITS.on = true;
  try {
    return run();
  } finally {
    [QUESTS610.on, EXITS.on] = was;
  }
}

test('off, as in the game: the mystic has nothing to ask, and the Queen falls with no scene', () => {
  assert.equal(QUESTS610.on, false);
  const g = seasoned(new Game('warrior', 9), 20);
  g.wayDepth = 7;
  assert.equal(g.mysticDue(), null);
  g.depth = 7;
  g.cleared = 6;
  g.enterDungeon();
  const q = g.monsters.find((m) => m.boss)!;
  inner(g).kill(q);
  assert.equal(g.scene, null);
  assert.equal(g.hero.feather, undefined);
});

test("the mystic asks for the Queen's feather once the way down the mountain is open, and not before", () => {
  on(() => {
    const g = seasoned(new Game('warrior', 9), 20);
    g.wayDepth = 5;
    assert.equal(g.mysticDue(), null, 'not while the gate down the mountain is barred');
    g.wayDepth = 6;
    assert.equal(g.mysticDue(), 'featherAsk');
    g.enterTown();
    const s = g.level.stations.find((q) => q.kind === 'mystic')!;
    g.hero.x = s.x;
    g.hero.y = s.y;
    assert.equal(g.handInNear(), 'featherAsk');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.feather, 'asked');
    assert.equal(g.mysticDue(), null, 'asked once');
  });
});

test('the Queen fallen: her feather taken; the scene walks him to the edge, pans out, says his line, pans back; once', () => {
  on(() => {
    const g = seasoned(new Game('ranger', 9), 20);
    (g as unknown as { god: boolean }).god = true;
    g.hero.feather = 'asked';
    g.depth = 7;
    g.cleared = 6;
    g.enterDungeon();
    g.monsters = g.monsters.filter((m) => m.boss);
    const q = g.monsters.find((m) => m.boss)!;
    assert.equal(q.kind, 'queen');
    g.hero.x = q.x - 1;
    g.hero.y = q.y + 1.5;
    inner(g).kill(q);
    assert.equal(g.hero.feather, 'got');
    assert.ok(g.scene, 'the scene begins');
    g.events.length = 0;
    const to = g.scene!.to;
    const phases = new Set<string>();
    const lines: string[] = [];
    let maxPan = 0;
    for (let k = 0; k < 30 * 20 && g.scene; k++) {
      // (whatever the player does, the scene has him)
      const c = emptyControls();
      c.mx = 1;
      c.fire = true;
      g.events.length = 0;
      g.update(DT, c);
      if (g.scene) phases.add(g.scene.phase);
      maxPan = Math.max(maxPan, g.scenePan());
      for (const e of g.events as GameEvent[]) if (e.t === 'quip') lines.push(e.text);
    }
    assert.equal(g.scene, null, 'it ends');
    assert.deepEqual([...phases], ['wait', 'walk', 'out', 'hold', 'back']);
    assert.ok(Math.hypot(g.hero.x - to.x, g.hero.y - to.y) < 0.6, 'he walked to the edge');
    assert.equal(maxPan, 1, 'the picture panned all the way out');
    assert.deepEqual(lines.filter((l) => l === EYRIE_LINES.ranger), [EYRIE_LINES.ranger], 'his line, once');
    assert.equal(g.hero.citySeen, true);
    // (it lasts about as long as it says)
    const most = EYRIE_SCENE.after + EYRIE_SCENE.walk + EYRIE_SCENE.out + EYRIE_SCENE.hold + EYRIE_SCENE.back;
    assert.ok(most < 20);
    // (a second time down there, no scene)
    g.depth = 7;
    g.enterDungeon();
    const q2 = g.monsters.find((m) => m.boss)!;
    inner(g).kill(q2);
    assert.equal(g.scene, null, 'seen once');
  });
});

test('the feather brought to the mystic; in the Pinewood, two pieces in its side areas and the third with the Stag', () => {
  on(() => {
    const g = seasoned(new Game('warrior', 4), 24);
    (g as unknown as { god: boolean }).god = true;
    g.wayDepth = 8;
    g.hero.feather = 'got';
    g.enterTown();
    const s = g.level.stations.find((q) => q.kind === 'mystic')!;
    g.hero.x = s.x;
    g.hero.y = s.y;
    assert.equal(g.handInNear(), 'featherGive');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.feather, 'given');
    g.depth = 9;
    g.cleared = 8;
    g.enterDungeon();
    const lying = g.drops.filter((d) => d.kind === 'piece');
    const carried = g.monsters.filter((m) => m.piece !== undefined);
    assert.equal(lying.length + carried.length, 3, 'three pieces on the floor');
    assert.ok(carried.some((m) => m.boss && m.kind === 'stag' && m.piece === 2), 'the Stag carries the third');
    const land = g.level.land!;
    const side = land.areas.find((a) => a.role === 'side')!;
    assert.ok(lying.some((d) => d.piece === 0 && Math.hypot(d.x - side.blob.x, d.y - side.blob.y) < 2), 'one in the side area');
    for (const m of carried) inner(g).kill(m);
    for (let k = 0; k < 6; k++) {
      const d = g.drops.find((q) => q.kind === 'piece');
      if (!d) break;
      g.hero.x = d.x;
      g.hero.y = d.y;
      for (let n = 0; n < 30; n++) g.update(DT, emptyControls());
    }
    assert.equal(piecesTaken(g.hero.pieces), 3, 'all three taken');
    // (back in the Pinewood with all three, none laid again)
    g.enterDungeon();
    assert.equal(g.drops.filter((d) => d.kind === 'piece').length + g.monsters.filter((m) => m.piece !== undefined).length, 0);
  });
});
