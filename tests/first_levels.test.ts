// THE FIRST LEVELS (game/defs.ts, FIRST_LEVELS; the owner's notes of 8 Oct 2026, 20:34 to 22:25,
// and his yes at 23:06: ON SINCE VERSION 19.5). With the switch on (the game's own) the abilities
// open by level, wordsmithing opens with the wordsmith's ring, the slots open in his order, and the
// first dungeon is gentler and carries no words; switched off, the game is as it was before.
//   run: tsx --test tests/first_levels.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { FIRST_DUNGEON, FIRST_LEVELS, FIRST_WORD, GUIDE, MONSTERS, MOVE_OPENS, SLOT_OPENS, TUNE, useFirstLevels } from '../src/game/defs';
import { eliteRoomCount, monsterBudget, packSizeRange } from '../src/game/dungeon';
import { FIRST_GATE, Game, cleanMeta, newMeta } from '../src/game/game';
import { flowField } from '../src/game/nav';
import type { RunSave } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';
import type { ClassId } from '../src/game/types';
import { guideBanner, guideSlot } from '../src/ui/guide';

const DT = 1 / 30;
type Inner = { gainXp: (n: number) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

/** With the first levels on, as the game has them (and on again after, whatever happens). */
function on(fn: () => void): void {
  useFirstLevels(true);
  try {
    fn();
  } finally {
    useFirstLevels(true);
  }
}
/** With the first levels off for a while (the game as it was before Version 19.5), and on again after. */
function off(fn: () => void): void {
  useFirstLevels(false);
  try {
    fn();
  } finally {
    useFirstLevels(true);
  }
}

/** Up to `level`, by the game's own experience. */
function upTo(g: Game, level: number): GameEvent[] {
  const seen: GameEvent[] = [];
  while (g.hero.level < level) {
    inner(g).gainXp(40);
    seen.push(...g.events);
    g.events.length = 0;
  }
  return seen;
}

/** A new player's first character, on a device that has seen nothing (the ring has never been lit). */
function fresh(cls: ClassId, seed = 21): Game {
  return Game.forFirstRun(cls, seed, newMeta());
}

/** The hero walks up to the fallen wordsmith of the first dungeon. */
function search(g: Game): void {
  const b = g.level.body;
  assert.ok(b, 'a fallen wordsmith in the first dungeon');
  g.hero.x = b!.x;
  g.hero.y = b!.y + 0.6;
  g.update(DT, emptyControls());
}

/** In town, the hero walks up to the wordsmith. */
function toWordsmith(g: Game): void {
  if (!g.level.town) g.enterTown();
  const st = g.level.stations.find((s) => s.kind === 'wordsmith');
  assert.ok(st, 'the wordsmith in town');
  g.hero.x = st!.x + 0.5;
  g.hero.y = st!.y + 0.5;
  g.update(DT, emptyControls());
}

test('the switch is on, since Version 19.5', () => {
  assert.equal(FIRST_LEVELS.on, true);
  assert.deepEqual(SLOT_OPENS, { front: [1, 5], behind: [7, 10] });
  assert.equal(monsterBudget(1), FIRST_DUNGEON.budget);
  const g = fresh('warrior');
  assert.equal(g.hero.ring, false, 'a new player: the ring is dark');
  assert.deepEqual([0, 1, 2].map((i) => g.moveOpen(i)), [true, false, false]);
});

test('switched off, the game is as it was', () => off(() => {
  assert.equal(FIRST_LEVELS.on, false);
  assert.deepEqual(SLOT_OPENS, { front: [1, 5], behind: [1, 10] });
  assert.equal(monsterBudget(1), 120);
  assert.deepEqual(packSizeRange(1), { min: 3, max: 6 });
  assert.equal(eliteRoomCount(1), 2);
  for (const cls of CLASS_IDS) {
    const g = fresh(cls);
    assert.equal(g.hero.ring, true, 'wordsmithing from the start');
    for (let i = 0; i < 3; i++) assert.ok(g.moveOpen(i), `${cls}: ability ${i} open at level 1`);
    assert.deepEqual(g.slots(), [1, 1]);
    assert.ok(g.monsters.some((m) => m.words.length > 0), `${cls}: words on the first dungeon's elites and boss`);
    search(g);
    assert.equal(g.hero.quest, null);
    assert.ok(g.drops.some((d) => d.kind === 'word' && d.word === FIRST_WORD[cls].word), `${cls}: the satchel's word`);
  }
  // (and the save says nothing of the ring)
  const s = fresh('warrior').save() as RunSave;
  assert.equal(s.ring, undefined);
  assert.equal(s.quest, undefined);
}));

test('on: the abilities open by level, tap at once, tap and hold at 2, swipe at 5', () => {
  on(() => {
    assert.deepEqual(MOVE_OPENS, [1, 2, 5]);
    const g = new Game('warrior', 5, newMeta());
    g.enterDungeon();
    assert.deepEqual([0, 1, 2].map((i) => g.moveOpen(i)), [true, false, false]);
    const two = upTo(g, 2);
    assert.ok(two.some((e) => e.t === 'moveOpen' && e.skill === 1), 'the slow attack opens at 2, and is announced');
    assert.deepEqual([0, 1, 2].map((i) => g.moveOpen(i)), [true, true, false]);
    const five = upTo(g, 5);
    assert.ok(five.some((e) => e.t === 'moveOpen' && e.skill === 2), 'the swipe opens at 5, and is announced');
    assert.deepEqual([0, 1, 2].map((i) => g.moveOpen(i)), [true, true, true]);
    // (in the practice room everything is open)
    const p = Game.forPractice('mage', 3);
    for (let i = 0; i < 3; i++) assert.ok(p.moveOpen(i));
  });
});

test('on: an ability not open yet does nothing when asked for', () => {
  on(() => {
    for (const cls of CLASS_IDS) {
      const g = new Game(cls, 9, newMeta());
      g.enterDungeon();
      const h = g.hero;
      const c = emptyControls();
      c.cast = true;
      c.castX = h.x + 2;
      c.castY = h.y;
      c.evade = true;
      c.evadeX = h.x + 3;
      c.evadeY = h.y;
      g.update(DT, c);
      assert.equal(h.windup, null, `${cls}: no slow attack begun at level 1`);
      assert.equal(h.move, null, `${cls}: no swipe at level 1`);
      assert.equal(h.skills[1].uses + h.skills[2].uses, 0);
    }
  });
});

test('on: no wordsmithing until the ring is lit; the satchel holds the quest item; the ring gives the first word, for the quick attack', () => {
  on(() => {
    for (const cls of CLASS_IDS) {
      const g = fresh(cls);
      const h = g.hero;
      assert.equal(h.ring, false, `${cls}: the ring is dark`);
      assert.deepEqual(g.slots(), [0, 0]);
      for (const s of h.skills) assert.equal(s.front.length + s.behind.length, 0, `${cls}: no slots`);
      search(g);
      assert.equal(h.quest, 'heart', `${cls}: the quest item taken`);
      assert.ok(!g.drops.some((d) => d.kind === 'word'), `${cls}: no word from the satchel`);
      assert.equal(h.potions, TUNE.potionMax, 'and full flasks, as before');
      assert.equal(g.guideStep(), 'carry');
      g.enterTown();
      assert.equal(g.guideStep(), 'ring');
      assert.ok(guideBanner(g, true)?.text.includes('wordsmith'));
      // (the trade is shut while the ring is dark)
      assert.equal(g.sellWord(FIRST_WORD[cls].word), 'The runes are dark');
      g.events.length = 0;
      toWordsmith(g);
      assert.equal(h.ring, true, `${cls}: the ring is lit`);
      assert.equal(g.meta.ring, true, 'and stays lit on this device');
      assert.equal(h.quest, null);
      assert.ok(g.events.some((e) => e.t === 'ring'), 'the ring\'s moment, for its animation');
      const w = FIRST_WORD[cls].word;
      assert.equal(h.words[w], 1, `${cls}: the wordsmith gives ${w}`);
      assert.equal(g.offer, w, 'the inventory opens for it');
      assert.deepEqual(g.slots(), [1, 0], 'one slot in front, none behind');
      assert.equal(h.skills[0].front.length, 1);
      assert.equal(h.skills[1].front.length, 0, 'none on the slow attack, not open yet');
      assert.deepEqual(guideSlot(g, w), { skill: 0, side: 'front', idx: 0 }, `${cls}: the first word goes before the quick attack`);
      assert.equal(g.placeWord({ skill: 0, side: 'front', idx: 0 }, w), null);
      // (his answer, 22:19: "No special moment": set in town, the lesson is over)
      assert.equal(g.guide, null, `${cls}: the lesson ends with the first word set`);
      g.enterDungeon();
      assert.ok(!g.monsters.some((m) => m.packId === -7), 'no dead rise for it');
    }
  });
});

test('on: the slots open in his order: one in front, the second in front, then behind', () => {
  on(() => {
    const g = new Game('ranger', 4, { ...newMeta(), ring: true, taught: true });
    assert.equal(g.hero.ring, true, 'a hero on a device whose ring is lit');
    const at = (lv: number): string => {
      upTo(g, lv);
      return g.slots().join();
    };
    assert.equal(g.slots().join(), '1,0');
    assert.equal(at(4), '1,0');
    assert.equal(at(5), '2,0');
    assert.equal(at(6), '2,0');
    assert.equal(at(7), '2,1');
    assert.equal(at(10), '2,2');
  });
});

test('on: no words on the first dungeon\'s monsters, and none fall before the ring is lit', () => {
  on(() => {
    for (const cls of CLASS_IDS) {
      const g = fresh(cls, 33);
      for (const m of g.monsters) {
        assert.equal(m.words.length, 0, `${cls}: ${m.name} carries no word in the first dungeon`);
        assert.equal(m.carries.length, 0);
      }
    }
    // (deeper, with the ring lit, they have them again)
    const g = new Game('warrior', 8, { ...newMeta(), ring: true, taught: true });
    g.depth = 3;
    g.cleared = 2;
    g.enterDungeon();
    assert.ok(g.monsters.some((m) => m.words.length > 0), 'elites with words in the third dungeon');
  });
});

test('on: the first dungeon is gentler: fewer monsters, smaller packs, one room of elites, every blow soft', () => {
  on(() => {
    assert.equal(monsterBudget(1), FIRST_DUNGEON.budget);
    assert.deepEqual(packSizeRange(1), { min: FIRST_DUNGEON.packMin, max: FIRST_DUNGEON.packMax });
    assert.equal(eliteRoomCount(1), FIRST_DUNGEON.eliteRooms);
    assert.equal(monsterBudget(2), 128, 'the second as it was');
    for (const cls of CLASS_IDS) {
      const g = fresh(cls, 41);
      const plain = g.monsters.filter((m) => !m.elite && !m.boss);
      assert.ok(plain.length <= FIRST_DUNGEON.budget * 1.25, `${cls}: ${plain.length} monsters`);
      // (at most half a blow; the first pack, the softball, a quarter)
      for (const m of plain) assert.ok(m.dmgMax <= MONSTERS[m.kind].dmgMax * GUIDE.softDmg + 1e-9, `${m.name} hits soft wherever it stands`);
    }
  });
});

test('on: a hero saved before the first levels keeps his ring, and a device that saved before them has it dark; one saved with them keeps his quest item', () => {
  on(() => {
    const old = new Game('mage', 6, { ...newMeta(), taught: true, ring: true });
    const s = old.save() as RunSave;
    delete s.ring;
    delete s.quest;
    const back = Game.restore(s, newMeta());
    assert.equal(back.hero.ring, true, 'a save from before: the ring lit');
    // (a DEVICE that saved before Version 19.5 has never had the ring lit, taught or not: its next
    // new hero goes for the MASTER RUNE-STONE, as in the pictures; once lit, it stays lit)
    assert.equal(cleanMeta({ taught: true } as never).ring, false);
    assert.equal(cleanMeta({ taught: true, ring: true } as never).ring, true);
    assert.equal(new Game('mage', 9, cleanMeta({ taught: true } as never)).hero.ring, false);
    assert.equal(new Game('mage', 9, cleanMeta({ taught: true, ring: true } as never)).hero.ring, true);
    const g = fresh('mage', 7);
    search(g);
    const again = Game.restore(g.save() as RunSave, newMeta());
    assert.equal(again.hero.ring, false);
    assert.equal(again.hero.quest, 'heart');
  });
  // (and on again, as the game has it)
  assert.deepEqual(SLOT_OPENS, { front: [1, 5], behind: [7, 10] });
  assert.equal(FIRST_LEVELS.on, true);
});

test('on: the first pack is a softball: a few slow skeletons that barely hurt and fall to a tap or two', () => {
  on(() => {
    for (const cls of CLASS_IDS) {
      for (const seed of [51, 52, 53]) {
        const g = fresh(cls, seed);
        const f = g.level.floor;
        const dist = flowField(g.level.walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, g.level.step);
        const at = (m: { x: number; y: number }): number => dist[Math.floor(m.y) * f.w + Math.floor(m.x)];
        const first = g.monsters.filter((m) => !m.boss && m.packId >= 0).sort((a, b) => at(a) - at(b))[0];
        const pack = g.monsters.filter((m) => m.packId === first.packId);
        const S = FIRST_DUNGEON.softball;
        assert.ok(pack.length >= 1 && pack.length <= S.size, `${cls} ${seed}: ${pack.length} in the first pack`);
        for (const m of pack) {
          assert.equal(m.kind, 'skeleton', `${cls} ${seed}: skeletons only`);
          assert.equal(m.elite, false);
          assert.equal(m.speed, S.speed, 'slow');
          assert.ok(Math.abs(m.dmgMax - MONSTERS.skeleton.dmgMax * S.dmg) < 1e-9, 'barely hurts');
          assert.ok(m.maxLife < MONSTERS.skeleton.life, `falls to a tap or two: ${m.maxLife} life`);
        }
      }
    }
  });
});


test('on: the lesson shows the moves that are open: tap alone at first, tap and hold from level 2, the swipe from 5', () => {
  on(() => {
    const g = fresh('warrior', 23);
    assert.ok(g.guide);
    g.guide!.met = true;
    g.guide!.walked = GUIDE.steps;
    assert.deepEqual(g.guideRows().map((r) => r.id), ['quick']);
    upTo(g, 2);
    assert.deepEqual(g.guideRows().map((r) => r.id), ['quick', 'slow']);
    upTo(g, 5);
    assert.deepEqual(g.guideRows().map((r) => r.id), ['quick', 'slow', 'evade']);
  });
});

test('on: the first dungeon\'s gate takes no word, which would be burned for nothing; the second\'s does', () => {
  on(() => {
    // (a later hero, the ring lit, with a word from the Lexicon)
    const g = new Game('warrior', 12, { ...newMeta(), ring: true, taught: true });
    g.hero.words.swift = 1;
    assert.ok(g.level.town);
    assert.equal(g.depth, 1);
    assert.equal(g.planProblem('swift'), FIRST_GATE);
    assert.equal(g.planWord('swift'), FIRST_GATE);
    assert.equal(g.hero.words.swift, 1, 'the word stays in the pouch');
    assert.deepEqual(g.plan, []);
    g.depth = 2;
    g.cleared = 1;
    assert.equal(g.planWord('swift'), null);
    assert.deepEqual(g.plan, ['swift']);
  });
});

test('on: a hero who leaves the first dungeon without the MASTER RUNE-STONE finds the fallen wordsmith in the next, until he is found', () => {
  on(() => {
    const g = fresh('warrior', 61);
    assert.ok(g.level.body, 'the fallen wordsmith in the first dungeon');
    // (home without searching him)
    g.depth = 2;
    g.cleared = 1;
    g.enterTown();
    g.enterDungeon();
    assert.ok(g.level.body, 'and again in the second, since without the MASTER RUNE-STONE there is no wordsmithing');
    search(g);
    assert.equal(g.hero.quest, 'heart');
    // (found, he is not laid again; nor for a hero whose ring is lit)
    g.depth = 3;
    g.cleared = 2;
    g.enterDungeon();
    assert.ok(!g.level.body, 'not again once found');
    const lit = new Game('mage', 62, { ...newMeta(), ring: true, taught: true });
    lit.depth = 2;
    lit.cleared = 1;
    lit.enterDungeon();
    assert.ok(!lit.level.body, 'not for a hero whose ring is lit');
  });
});

test('on: what the master rune-stone\'s pictures show follows the rules: lying by the fallen wordsmith, carried, the ring dark until it is given', () => {
  on(() => {
    const g = fresh('ranger', 71);
    assert.deepEqual(g.questView(), { dark: true, carried: false, lying: true }, 'a new player: the stone lies by him, the ring dark');
    search(g);
    assert.deepEqual(g.questView(), { dark: true, carried: true, lying: false }, 'taken up: carried');
    assert.ok(g.events.some((e) => e.t === 'quest'), 'the moment it is taken up, for its flight');
    toWordsmith(g);
    assert.deepEqual(g.questView(), { dark: false, carried: false, lying: false }, 'given: the ring lit');
    // (a later hero, the ring lit on the device: no stone, the ring lit; and the practice room is lit)
    const later = Game.forFirstRun('mage', 72, { ...newMeta(), ring: true, taught: false });
    assert.deepEqual(later.questView(), { dark: false, carried: false, lying: false });
  });
});
