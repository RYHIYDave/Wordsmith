// FLOOR 9'S WARD-STONE HUNT ON THE QUEST LINE (quests610.ts PIECE_BOSSES, game.ts huntLines, ui/guide.ts huntBanner). His words,
// 14 Nov 2026, 10:14 (Eastern): “i need the quest to be updated so it has "defeat the __________" for each boss”.
// @ts-ignore
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { F9_LAIRS } from '../src/game/f9_lairs';
import { Game } from '../src/game/game';
import { huntBanner } from '../src/ui/guide';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

const floor9 = (on: boolean, quest: boolean): Game => {
  const g = new Game('warrior', 9);
  g.depth = 9;
  g.cleared = 8;
  g.wayDepth = 9;
  if (quest) {
    g.hero.feather = 'given';
    g.hero.pieces = 0;
  }
  g.enterDungeon();
  return g;
};

test('on coming into the Pinewood after the ward-stone, the quest line reads DEFEAT for each boss, ticked off as each falls; it goes in its time', () => {
  const was = F9_LAIRS.on;
  F9_LAIRS.on = true;
  try {
    const g = floor9(true, true);
    const b = huntBanner(g);
    assert.ok(b, 'the line is up');
    assert.equal(b!.caption, 'QUEST');
    assert.deepEqual(b!.lines.map((l) => `${l.how} ${l.what}`), ['DEFEAT the MIST WOLF', 'DEFEAT the TROLL CHIEFTAIN', 'DEFEAT the HOLLOW STAG']);
    assert.ok(b!.lines.every((l) => !l.done), 'none done yet');
    const wolf = g.monsters.find((m) => m.kind === 'mistwolf')!;
    g.huntSeen(99);
    assert.equal(huntBanner(g), null, 'gone in its time');
    g.kill(wolf);
    const b2 = huntBanner(g);
    assert.ok(b2, 'up again as one falls');
    assert.deepEqual(b2!.lines.map((l) => l.done), [true, false, false], 'the wolf ticked off');
  } finally {
    F9_LAIRS.on = was;
  }
});

test('not after the ward-stone, or with the side bosses off: no such line', () => {
  const was = F9_LAIRS.on;
  try {
    F9_LAIRS.on = true;
    assert.equal(huntBanner(floor9(true, false)), null, 'not after it');
    F9_LAIRS.on = false;
    assert.equal(huntBanner(floor9(false, true)), null, 'side bosses off');
  } finally {
    F9_LAIRS.on = was;
  }
});
