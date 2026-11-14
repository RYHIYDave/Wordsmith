// ENDLESS MODE, NO STORY (game/game.ts storyHere). His words, 14 Nov 2026, 13:26 (Eastern): “For endless mode, I’d like all the stuff
// that happens for the story or quests to be turned off.  Like I don’t need the fallen wordsmith in the warden’s quarters in endless if
// that level cycles up.” His picks: the bosses' lines “Keep their lines”; floor 5's temple door “Door open, no key-bearers (Recommended)”.
//   1. storyHere: false on an endless level, true on the same floor in the story and in town;
//   2. floor 1 in endless: no fallen wordsmith, though nothing of him was ever searched;
//   3. floor 3 in endless: no furnace, its arena not laid, though the Stoker's quest was never begun;
//   4. floor 5 in endless: no temple door and no key-bearers; in the story, both as before (floor 5's temple switched on to see it);
//   5. the quests' things in endless: no Pinewood piece, no captain's jar, no Queen's feather; no "Return to" line nor waypoint marker;
//   6. what stays: the strongholds of 6 to 10, the Bells of 11 to 15, and every boss.
//
//   run: tsx --test tests/endless_no_story.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { ENDLESS } from '../src/game/endless';
import { TEMPLE_DOOR } from '../src/art/temple_door';
import { LAIR_TEMPLE } from '../src/art/lair_temple';
import { seasoned } from './helpers';

// (the game as the tests reach into it: its private parts too)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;

/** A seasoned hero on endless level 3, on the given floor (or, `story`, on that floor in the story). */
function on(floor: number, story = false, set?: (g: G) => void): G {
  const g: G = seasoned(new Game('warrior', 5), 30);
  g.cleared = story ? floor - 1 : 19;
  g.wayDepth = story ? floor : 20;
  if (set) set(g);
  if (story) {
    g.depth = floor;
    g.enterDungeon();
  } else {
    g.endless = 3;
    g.endlessFloor = floor;
    g.enterEndless();
  }
  return g;
}

test('storyHere: false on an endless level, true on the same floor in the story and in town', () => {
  assert.equal(ENDLESS.on, true);
  const e = on(7);
  assert.equal(e.inEndless, true);
  assert.equal(e.storyHere, false);
  const s = on(7, true);
  assert.equal(s.inEndless, false);
  assert.equal(s.storyHere, true);
  const t = seasoned(new Game('warrior', 5), 30);
  assert.equal(t.storyHere, true, 'in town');
});

test('floor 1 in endless: no fallen wordsmith, though he was never searched and the count of floors cleared is nought', () => {
  const g = on(1, false, (g) => {
    g.bodySearched = false;
    g.cleared = 0;
  });
  assert.equal(g.level.body ?? null, null, 'no body');
  assert.ok(!g.level.props.some((p: any) => p.kind === 'body'), 'nor its prop');
});

test('floor 3 in endless: no furnace and no Stoker\'s arena, though his quest was never begun', () => {
  const g = on(3, false, (g) => {
    g.cleared = 1;
    g.wayDepth = 3;
    g.hero.furnace = undefined;
  });
  assert.equal(g.furnaceBurns(), false);
  assert.equal(g.level.furnace ?? null, null);
});

test('floor 5 in endless: the temple open, no door and no key-bearers; in the story, both as before', () => {
  assert.equal(TEMPLE_DOOR.on, true);
  // (the door stands only where floor 5 is laid as the mine that becomes his temple, LAIR_TEMPLE: off in the game until his yes to it
  // in play; switched on here, as tests/temple_door.test.ts does)
  const was = LAIR_TEMPLE.on;
  LAIR_TEMPLE.on = true;
  try {
    const e = on(5);
    assert.equal(e.level.temple ?? null, null, 'no temple door');
    assert.ok(!e.level.doors.some((d: any) => d.spot.kind === 'templedoor'));
    assert.ok(!e.monsters.some((m: any) => m.kind === 'keyblade' || m.kind === 'keyflame'), 'no key-bearers');
    assert.ok(e.level.lair, 'the floor itself as ever: the mine and the temple');
    const s = on(5, true);
    assert.ok(s.level.temple, 'the story: the door');
    assert.equal(s.monsters.filter((m: any) => m.kind === 'keyblade' || m.kind === 'keyflame').length, 2, 'and its two key-bearers');
  } finally {
    LAIR_TEMPLE.on = was;
  }
});

test('the quests\' things in endless: no Pinewood piece, no captain\'s jar, no Queen\'s feather; no "Return to" line', () => {
  const nine = on(9, false, (g) => {
    g.hero.feather = 'given';
    g.hero.pieces = 0;
  });
  assert.ok(!nine.drops.some((d: any) => d.kind === 'piece'), 'no ward-stone piece on 9');
  assert.equal(nine.wantsPiece(0), false);
  const twelve = on(12, false, (g) => {
    g.hero.captainJar = undefined;
  });
  assert.equal(twelve.captainJarAt, null, 'no captain\'s jar on 12');
  const seven = on(7, false, (g) => {
    g.hero.feather = 'asked';
  });
  const queen = seven.monsters.find((m: any) => m.kind === 'queen');
  assert.ok(queen, 'the Queen is there');
  seven.queenDown(queen);
  assert.equal(seven.hero.feather, 'asked', 'no feather from her');
  assert.ok(!seven.drops.some((d: any) => d.kind === 'quest'), 'nothing of a quest dropped');
  // (something to bring back in hand: on an endless level no line and no marker)
  const back = on(4, false, (g) => {
    g.hero.feather = 'got';
  });
  back.update(1 / 60, {} as any);
  assert.equal(back.speakTo, null, 'no "Return to" line');
});

test('what stays: the strongholds of 6 to 10, the Bells of 11 to 15, and every boss', () => {
  assert.ok((on(6).level.holds ?? []).length > 0, 'a stronghold on 6');
  assert.ok(on(11).level.bells, 'the Bells on 11');
  for (const f of [1, 5, 10, 15, 20]) assert.ok(on(f).monsters.some((m: any) => m.boss), `a boss on ${f}`);
});
