// “SPEAK TO THE ...” WHENEVER A QUEST BECOMES AVAILABLE (game/quest_marks.ts SPEAK_NEW, off until his yes). His words, 11 Nov 2026, of
// the quest marker: “Make it a rune, have it flash, and add triggers for “Speak to the (quest giver)” when a quest becomes available”.
// Off, the line comes as it did (on coming into a floor or the town carrying something back; in town, as someone comes due there). On:
// the moment someone has something for him, wherever he is; on coming into town with anyone waiting, a new game too; gone when seen to.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { Game } from '../src/game/game';
import { FIRST_LEVELS } from '../src/game/defs';
import { QUEST_MARKS, SPEAK_NEW } from '../src/game/quest_marks';
import { QUESTS15 } from '../src/game/quests15';
import { QUESTS610 } from '../src/game/quests610';
import { emptyControls } from '../src/game/state';
import { EXITS } from '../src/game/ways';

const DT = 1 / 60;
function steps(g: Game, n: number): void {
  for (let k = 0; k < n; k++) {
    g.events.length = 0;
    g.update(DT, emptyControls());
  }
}
/** The game's quest lines on, the markers on, and the new triggers as `speak` says; everything as it was after. */
function on<T>(speak: boolean, run: () => T): T {
  const was = [SPEAK_NEW.on, QUEST_MARKS.on, EXITS.on, FIRST_LEVELS.on, QUESTS15.on, QUESTS610.on];
  SPEAK_NEW.on = speak;
  QUEST_MARKS.on = true;
  EXITS.on = true;
  FIRST_LEVELS.on = true;
  QUESTS15.on = true;
  QUESTS610.on = true;
  try {
    return run();
  } finally {
    [SPEAK_NEW.on, QUEST_MARKS.on, EXITS.on, FIRST_LEVELS.on, QUESTS15.on, QUESTS610.on] = was;
  }
}
const who = (g: Game): string | null => (g.speakTo ? g.speakTo.who : null);
/** A hero down on a floor, the first dungeon's lessons behind him. */
function down(g: Game, depth: number): void {
  g.guide = null;
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = Math.max(g.wayDepth, depth);
  g.enterDungeon();
  steps(g, 3);
}

test('1. THE SWITCH IS OFF', () => {
  assert.equal(SPEAK_NEW.on, false);
});

test('2. A NEW GAME IN TOWN: the wordsmith has his first quest. Off, the marker alone, no line; on, "Speak to the wordsmith"', () => {
  for (const speak of [false, true]) {
    on(speak, () => {
      const g = new Game('warrior', 7);
      g.enterTown();
      steps(g, 3);
      assert.deepEqual(g.questGivers(), ['wordsmith']);
      assert.equal(who(g), speak ? 'wordsmith' : null, speak ? 'on' : 'off');
    });
  }
});

test('3. THE MASTER RUNE-STONE TAKEN UP IN THE MIDDLE OF A FLOOR: off, nothing till the next floor; on, the line at once; and on the next floor, both', () => {
  for (const speak of [false, true]) {
    on(speak, () => {
      const g = new Game('warrior', 7);
      g.questGiven = true;
      down(g, 1);
      assert.equal(who(g), null, 'nothing to bring back yet');
      g.hero.quest = 'heart';
      steps(g, 2);
      assert.equal(who(g), speak ? 'wordsmith' : null, speak ? 'on, at once' : 'off, not yet');
      // (seen its time, it goes; on the next floor it says so again, as before)
      g.speakSeen(QUEST_MARKS.secs + 1);
      steps(g, 2);
      assert.equal(who(g), null, 'seen its time');
      down(g, 2);
      assert.equal(who(g), 'wordsmith', 'on coming into the next floor');
    });
  }
});

test('4. A QUEST THAT OPENED WHILE HE WAS AWAY (the mystic\'s, the gate down the mountain open): on coming into town, off nothing, on "Speak to the mystic"; in the dungeon, on, the moment it opens', () => {
  for (const speak of [false, true]) {
    on(speak, () => {
      const g = new Game('warrior', 7);
      // (the wordsmith's and the armourer's lines behind him)
      g.questGiven = true;
      g.hero.ring = true;
      g.hero.furnace = 'done';
      g.hero.meldAsk = true;
      g.hero.meld = 'open';
      down(g, 5);
      assert.deepEqual(g.questGivers(), [], 'no one has anything for him');
      assert.equal(who(g), null);
      // (the gate down the mountain opens)
      g.wayDepth = 6;
      steps(g, 2);
      assert.deepEqual(g.questGivers(), ['mystic']);
      assert.equal(who(g), speak ? 'mystic' : null, speak ? 'on, the moment it opens' : 'off');
      g.speakSeen(QUEST_MARKS.secs + 1);
      steps(g, 2);
      g.enterTown();
      steps(g, 3);
      assert.equal(who(g), speak ? 'mystic' : null, speak ? 'on, on coming into town' : 'off');
    });
  }
});

test('5. IT GOES WHEN THEY ARE SEEN TO, in town or out of it; what he brings back comes before a quest to be given', () => {
  on(true, () => {
    const g = new Game('warrior', 7);
    g.enterTown();
    steps(g, 3);
    assert.equal(who(g), 'wordsmith');
    // (the wordsmith has given his quest: no one has anything for him)
    g.questGiven = true;
    steps(g, 2);
    assert.equal(who(g), null, 'seen to');
    // (the stone carried, and the mystic's quest open too: into town, the one he brings something back for)
    g.hero.quest = 'heart';
    g.wayDepth = 6;
    down(g, 2);
    g.speakSeen(QUEST_MARKS.secs + 1);
    steps(g, 2);
    g.enterTown();
    steps(g, 3);
    assert.equal(who(g), 'wordsmith', 'what he brings back first');
    // (out of town, the stone gone from him: the line goes there too)
    down(g, 2);
    assert.equal(who(g), 'wordsmith');
    g.hero.quest = null;
    g.hero.ring = true;
    g.hero.furnace = 'done';
    g.hero.meldAsk = true;
    g.hero.meld = 'open';
    g.hero.feather = 'asked';
    steps(g, 2);
    assert.equal(who(g), null, 'nothing to bring back any more');
  });
});
