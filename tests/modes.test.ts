// THE TWO MODES (game/modes.ts): Normal and Hardcore, picked when a hero is made and kept for life
// (the owner's gameplay rulebook, approved 8 Oct 2026, 10:33, "Heroes, death and the two modes").
// A NORMAL death wakes the hero in town, without what was found in that dungeon and a share of the
// gold carried in; the level, the gear worn in and the words stay. HARDCORE is the game as it was.
// PICTURES FIRST: its pictures went to him at 13:34; his answers at 13:35, "Yes, as it is
// (Recommended)" and, of the gold, "A quarter (Recommended)". The switch (MODES.on) is on from
// Version 19.1; these tests hold it on where they ask about Normal mode, and off where they ask
// that the game without it is as it was.
//   run: tsx --test tests/modes.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { Game, cleanMeta, newMeta } from '../src/game/game';
import type { RunSave } from '../src/game/game';
import { plainWeapon } from '../src/game/items';
import { MODES, MODE_BEFORE, NORMAL } from '../src/game/modes';
import type { HeroMode } from '../src/game/modes';
import { WORD_IDS } from '../src/game/types';
import { seasoned } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

type Inner = { gainXp: (n: number) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

/** With the switch held as asked, and put back after. */
function modes<T>(on: boolean, fn: () => T): T {
  const was = MODES.on;
  MODES.on = on;
  try {
    return fn();
  } finally {
    MODES.on = was;
  }
}

/** A warrior of the given mode gone into dungeon 3 with 240 gold and a spare FLAME. */
function goneIn(mode: HeroMode, seed = 21): Game {
  const g = new Game('warrior', seed);
  g.mode = mode;
  g.depth = 3;
  g.cleared = 2;
  g.hero.gold = 240;
  g.hero.words.fire = 1;
  g.enterDungeon();
  return g;
}

const killed = (g: Game): void => {
  g.hero.invuln = 0;
  g.hurtHero(1e9, 'phys', [], null, 'a test');
};
const tiles = (g: Game): string => Array.from(g.level.floor.tiles).join('');

test('the switch is on, on his yes, and a Normal death costs a quarter of the gold carried in', () => {
  assert.equal(MODES.on, true);
  assert.equal(NORMAL.goldShare, 0.25);
});

test('the switch is off: every hero is made, and dies, as before', () => {
  modes(false, () => {
    const g = goneIn('normal');
    killed(g);
    assert.ok(g.over);
    assert.equal(g.wakes, false, 'nobody wakes in town while the switch is off');
    assert.equal(g.wakeSave(), null);
    assert.equal(g.meta.deaths, 1);
    assert.equal(new Game('mage', 4).mode, 'hardcore', 'a hero made without the cards is Hardcore, the old rule');
    assert.equal('mode' in new Game('ranger', 5).save(), false, 'nothing of the modes is written while the switch is off');
  });
});

test('a Normal death: the hero falls, and will wake in town; no hero is lost', () => {
  modes(true, () => {
    const g = goneIn('normal');
    killed(g);
    assert.ok(g.over, 'the hero falls as ever');
    assert.ok(g.wakes);
    assert.equal(g.meta.deaths, 0, 'the Lexicon counts lost heroes only');
    const run = g.wakeSave() as RunSave;
    assert.ok(run);
    assert.equal(run.mode, 'normal');
  });
});

test('waking: what was found in the dungeon is lost, and a share of the gold carried in; the level, the gear worn in and the words stay', () => {
  modes(true, () => {
    const g = goneIn('normal');
    const h = g.hero;
    const wornIn = JSON.stringify(h.gear);
    const bagIn = JSON.stringify(h.bag);
    const fireIn = h.words.fire;
    // (the bag's first two places are free for what is found)
    h.bag[0] = null;
    h.bag[1] = null;
    // found in the dungeon: a sword put on, a bow in the bag, two words of FROST, gold, two levels
    h.bag[0] = plainWeapon('greatsword', 1);
    assert.equal(g.equipFromBag(0), null);
    h.bag[1] = plainWeapon('bow', 3);
    h.words.frost += 2;
    h.gold += 140;
    const was = h.level;
    inner(g).gainXp(4000);
    assert.ok(h.level > was, 'levels were gained in the dungeon');
    const level = h.level;
    const xp = h.xp;
    killed(g);
    assert.deepEqual(g.losses(), { items: 2, words: 2, gold: 140, share: Math.floor(240 * NORMAL.goldShare) });
    const w = Game.restore(g.wakeSave() as RunSave, g.meta);
    assert.ok(w.level.town, 'in town');
    assert.equal(w.hero.life, w.hero.d.maxLife, 'whole again');
    assert.equal(w.hero.level, level, 'the level stays');
    assert.equal(w.hero.xp, xp);
    assert.equal(JSON.stringify(w.hero.gear), wornIn, 'the gear worn in, and not what was put on');
    assert.equal(JSON.stringify(w.hero.bag), bagIn, 'the bag as it went in: nothing found is in it');
    assert.equal(w.hero.words.frost, 0, 'the words found are gone');
    assert.equal(w.hero.words.fire, fireIn, 'the words carried in stay');
    assert.equal(w.hero.gold, 240 - Math.floor(240 * NORMAL.goldShare), 'the gold found is gone, and a share of the rest');
    assert.equal(w.depth, 3, 'the same dungeon waits');
    assert.equal(w.cleared, 2);
    assert.equal(w.mode, 'normal', 'kept for life');
    // and it is the same dungeon, tile for tile
    const before = tiles(g);
    w.enterDungeon();
    assert.equal(tiles(w), before);
  });
});

test('a word set in a slot in the dungeon goes; one set before going in stays where it was', () => {
  modes(true, () => {
    // (a slot to set it in: THE FIRST LEVELS open them with the wordsmith's ring, tests/helpers.ts seasoned)
    const g = seasoned(new Game('warrior', 33), 1);
    g.mode = 'normal';
    g.hero.words.fire = 1;
    assert.equal(g.socket(0, 'front', 'fire'), null);
    g.depth = 2;
    g.enterDungeon();
    g.hero.words.frost = 1;
    // (the slot taken by FROST: FLAME back to the pouch, FROST into its place)
    g.unsocket(0, 'front', 0);
    assert.equal(g.socket(0, 'front', 'frost'), null);
    killed(g);
    const w = Game.restore(g.wakeSave() as RunSave, g.meta);
    assert.equal(w.hero.skills[0].front[0], 'fire');
    assert.equal(w.hero.words.frost, 0);
    assert.equal(w.hero.words.fire, 0, 'FLAME is in its slot, not the pouch');
  });
});

test('a Hardcore death is the end of the hero, as it always was', () => {
  modes(true, () => {
    const g = goneIn('hardcore');
    killed(g);
    assert.ok(g.over);
    assert.equal(g.wakes, false);
    assert.equal(g.wakeSave(), null);
    assert.equal(g.meta.deaths, 1);
    assert.equal(g.save().mode, 'hardcore');
  });
});

test('the first dungeon: its fallen wordsmith is there to be searched again', () => {
  modes(true, () => {
    const g = Game.forFirstRun('ranger', 8);
    g.mode = 'normal';
    g.endGuide();
    // (the body searched: its word found)
    (g as unknown as { bodySearched: boolean }).bodySearched = true;
    g.hero.words.frost += 1;
    killed(g);
    assert.ok(g.wakes);
    const run = g.wakeSave() as RunSave;
    assert.equal(run.body, false, 'the satchel is back on the body');
    assert.equal(run.guide ?? null, null, 'the prompts are not begun again');
  });
});

test('nobody wakes in the practice room, or in the first dungeon while its prompts run', () => {
  modes(true, () => {
    const p = Game.forPractice('mage', 3);
    p.mode = 'normal';
    killed(p);
    assert.equal(p.over, false);
    assert.equal(p.wakes, false);
    const f = Game.forFirstRun('warrior', 9);
    f.mode = 'normal';
    killed(f);
    assert.equal(f.over, false, 'UP AGAIN, as ever');
  });
});

test('a hero saved before there were modes is Normal; a save keeps its mode', () => {
  modes(true, () => {
    const g = goneIn('hardcore');
    const s = g.save();
    delete (s as Partial<RunSave>).mode;
    assert.equal(Game.restore(s).mode, MODE_BEFORE);
    assert.equal(MODE_BEFORE, 'normal');
    assert.equal(Game.restore({ ...s, mode: 'hardcore' }).mode, 'hardcore');
    assert.equal(Game.restore({ ...s, mode: 'normal' }).mode, 'normal');
    assert.equal(Game.restore({ ...s, mode: 'easy' as HeroMode }).mode, MODE_BEFORE);
  });
});

test('the cards remember the mode last picked', () => {
  assert.equal(newMeta().mode, 'normal', 'Normal unless another is picked');
  assert.equal(cleanMeta({ mode: 'hardcore' }).mode, 'hardcore');
  assert.equal(cleanMeta({ mode: 'other' as HeroMode }).mode, 'normal');
  assert.equal(cleanMeta(null).mode, 'normal');
});

test('the share of the gold: nothing carried in, nothing lost of it', () => {
  modes(true, () => {
    const g = goneIn('normal');
    g.hero.gold = 0;
    // (the snapshot is taken as the hero goes in: take it again with no gold)
    g.depth = 3;
    g.enterDungeon();
    g.hero.gold += 55;
    killed(g);
    assert.deepEqual(g.losses(), { items: 0, words: 0, gold: 55, share: 0 });
    assert.equal((g.wakeSave() as RunSave).gold, 0);
    for (const w of WORD_IDS) assert.ok(g.hero.words[w] >= 0);
  });
});
