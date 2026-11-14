// THE QUEST LINE OF FLOORS 11 TO 15 (game/quests1115.ts, QUESTS1115, off until his yes to its pictures). Planned with him
// 13 Nov 2026: THE UNSTRUCK PAGES (the mystic asks for the Crier's bottled voice, floor 12; it tells of three pages written before
// the Hush: the Palimpsest's, the Physician's, one chained in the library's stacks; laid down in the Censor's fight, each dries
// all his ink on the floor) and THE STOLEN CLAPPER (the armourer; the first Bells won on 11 to 15 gives it; brought, the camp's
// bell rings and he lays out his pick of three fully modded rares, gloves, boots and a helm: one taken, the others go back).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT2 } from '../src/game/act1';
import { CRIERS_JAR } from '../src/game/act2/undercity';
import { Game } from '../src/game/game';
import type { RunSave } from '../src/game/game';
import { inkedCount } from '../src/game/act1_rules/censor';
import { PAGES, QUESTS1115, pagesInHand } from '../src/game/quests1115';
import { emptyControls } from '../src/game/state';
import type { Drop, Monster } from '../src/game/state';
import { DEEP_WORD_IDS } from '../src/game/types';
import { EXITS } from '../src/game/ways';
import { questBanner } from '../src/ui/guide';
import { seasoned } from './helpers';

type Inner = {
  handIn: () => boolean;
  kill: (m: Monster) => void;
  bellsStruck: (x: number, y: number, rad: number) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

function on<T>(run: () => T, quests = true): T {
  const was = [QUESTS1115.on, EXITS.on, ACT2.on];
  QUESTS1115.on = quests;
  EXITS.on = true;
  ACT2.on = true;
  try {
    return run();
  } finally {
    [QUESTS1115.on, EXITS.on, ACT2.on] = was;
  }
}

/** A hero of this class come to floor `depth` of the Hush, god (no harm), the floor's pack cleared but its boss. */
function at(depth: number, cls: 'warrior' | 'ranger' = 'warrior', seed = 11): Game {
  const g = seasoned(new Game(cls, seed), 30);
  (g as unknown as { god: boolean }).god = true;
  g.depth = depth;
  g.cleared = depth - 1;
  g.wayDepth = depth;
  g.enterDungeon();
  return g;
}

/** Walk him onto (x, y) and let the game run a moment (what lies there is taken). */
function walkTo(g: Game, x: number, y: number, secs = 0.8): void {
  for (let i = 0; i < Math.round(secs * 30); i++) {
    g.hero.x = x;
    g.hero.y = y;
    g.hero.life = g.hero.d.maxLife;
    g.update(1 / 30, emptyControls());
  }
}

/** Into the camp (floor 11 or more reached), beside the one of `kind`. */
function campBeside(g: Game, kind: 'mystic' | 'armourer'): { x: number; y: number } {
  g.wayDepth = Math.max(g.wayDepth, 11);
  g.enterTown();
  const s = g.level.stations.find((q) => q.kind === kind)!;
  assert.ok(s, `the camp has its ${kind}`);
  g.hero.x = s.x;
  g.hero.y = s.y;
  return s;
}

/** Every bell of a Hush floor rung, the Muffled Bell struck first: the explosion. */
function winBells(g: Game): void {
  const B = g.level.bells!;
  assert.ok(B, 'the floor has its Bells');
  inner(g).bellsStruck(B.plan.muffled.x, B.plan.muffled.y, 0.5);
  for (const b of B.plan.bells) inner(g).bellsStruck(b.x, b.y, 0.6);
  assert.equal(B.phase, 'won');
}

const questDrops = (g: Game, thing: 'page' | 'clapper'): Drop[] => g.drops.filter((d) => d.kind === 'quest' && d.thing === thing);

test('off: no one asks, no clapper falls with the explosion, the jar stays where it lies', () =>
  on(() => {
    const g = at(11);
    g.monsters = g.monsters.filter((m) => m.boss);
    winBells(g);
    assert.equal(questDrops(g, 'clapper').length, 0);
    assert.equal(g.jarDue(), null);
    assert.equal(g.clapperDue(), null);
    const h = at(12);
    const jar = h.level.props.find((p) => p.name === CRIERS_JAR)!;
    assert.ok(jar, "the Crier's jar lies in the Rat King's nest, as the art laid it");
    walkTo(h, jar.x, jar.y + 0.6, 0.3);
    assert.equal(jar.state, 0);
    assert.equal(h.hero.jar, undefined);
  }, false));

test('the mystic asks for a bottled voice once floor 11 is cleared (her feather first), and not before', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.cleared = 10;
    assert.equal(g.jarDue(), null, 'not before floor 11 is cleared');
    g.cleared = 11;
    assert.equal(g.jarDue(), 'jarAsk');
    g.hero.feather = 'given';
    g.hero.roll = 'given';
    campBeside(g, 'mystic');
    assert.equal(g.handInNear(), 'jarAsk');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.jar, 'asked');
    assert.equal(g.jarDue(), null, 'asked once');
    assert.ok(!g.questGivers().includes('mystic'));
  }));

test("floor 12: the Crier's jar walked up to is his; brought to the mystic, it tells of the pages and gives one of the city's words", () =>
  on(() => {
    const g = at(12);
    g.hero.feather = 'given';
    g.hero.jar = 'asked';
    g.enterDungeon();
    const jar = g.level.props.find((p) => p.name === CRIERS_JAR)!;
    assert.ok(jar);
    assert.equal(jar.state, 0);
    walkTo(g, jar.x + 0.4, jar.y + 0.6, 0.2);
    assert.equal(jar.state, 1, 'taken from the nest');
    assert.equal(jar.solid, false);
    assert.equal(g.hero.jar, 'got');
    assert.equal(g.turnInFor(), 'mystic', 'a marker over the waypoint home');
    const before = DEEP_WORD_IDS.reduce((n, w) => n + g.hero.words[w], 0);
    campBeside(g, 'mystic');
    assert.equal(g.handInNear(), 'jarGive');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.jar, 'given');
    assert.equal(DEEP_WORD_IDS.reduce((n, w) => n + g.hero.words[w], 0), before + 1, "one of the city's words");
  }));

test('the pages: none until the jar is brought; then the Palimpsest drops the oldest, the Physician his, the stacks hold the third', () =>
  on(() => {
    // (the jar not brought: the Palimpsest drops none)
    // (floor 13's boss is a pair now, the Scraper and the Quill, their ultimate the Palimpsest: the page falls as the last of them does)
    const bosses = (g: Game): Monster[] => g.monsters.filter((m) => m.boss && !m.dead);
    const n = at(13);
    for (const m of bosses(n)) inner(n).kill(m);
    assert.equal(questDrops(n, 'page').length, 0, 'none before the jar is brought');

    for (const [depth, bit] of [[13, 1], [14, 2]] as const) {
      const g = at(depth);
      g.hero.jar = 'given';
      g.enterDungeon();
      const bs = bosses(g);
      assert.ok(bs.length >= 1, `floor ${depth}'s boss`);
      assert.ok(depth !== 14 || bs[0].kind === 'physician', 'the Physician on floor 14');
      if (depth === 13) {
        assert.deepEqual(bs.map((m) => m.kind).sort(), ['quill', 'scraper'], 'the Scraper and the Quill');
        inner(g).kill(bs[0]);
        assert.equal(questDrops(g, 'page').length, 0, 'not while the other fights on');
        inner(g).kill(bs[1]);
      } else inner(g).kill(bs[0]);
      const d = questDrops(g, 'page');
      assert.equal(d.length, 1, `floor ${depth}'s boss drops a page`);
      walkTo(g, d[0].x, d[0].y);
      assert.equal(g.hero.pages, bit, `page ${bit} taken`);
      assert.equal(questDrops(g, 'page').length, 0);
      // (taken: killed again, none)
      g.enterDungeon();
      for (const m of bosses(g)) inner(g).kill(m);
      assert.equal(questDrops(g, 'page').length, 0, 'once');
    }

    const g = at(15);
    g.hero.jar = 'given';
    g.hero.pages = 3;
    g.enterDungeon();
    const d = questDrops(g, 'page');
    assert.equal(d.length, 1, 'the third lies on floor 15');
    assert.equal(d[0].page, 2);
    const L = g.level;
    assert.equal(L.walk[Math.floor(d[0].y) * L.floor.w + Math.floor(d[0].x)], 1, 'on floor he can walk to');
    const side = (L.land?.areas ?? []).filter((a) => a.role === 'side');
    assert.ok(side.some((a) => Math.hypot(a.blob.x - d[0].x, a.blob.y - d[0].y) < 6), 'in a side area of the library');
    walkTo(g, d[0].x, d[0].y);
    assert.equal(g.hero.pages, 7, 'all three');
  }));

test("the Censor's fight: with his ink on the floor, a page laid down dries all of it; three pages, three times; dead and come again, all three again", () =>
  on(() => {
    const g = at(15);
    g.hero.jar = 'given';
    g.hero.pages = 7;
    g.enterDungeon();
    const c = g.monsters.find((m) => m.kind === 'censor')!;
    assert.ok(c, 'the Censor on floor 15');
    g.monsters = [c];
    g.drops.length = 0;
    // (fight him, standing by: until his ink lies on the floor)
    const fight = (): void => {
      for (let i = 0; i < 30 * 30 && inkedCount(g.level) < PAGES.least + 2; i++) {
        g.hero.x = c.x + 2.2;
        g.hero.y = c.y + 0.4;
        g.hero.life = g.hero.d.maxLife;
        g.update(1 / 30, emptyControls());
      }
      assert.ok(inkedCount(g.level) >= PAGES.least, 'his ink lies on the floor');
    };
    for (let k = 1; k <= 3; k++) {
      fight();
      assert.match(g.interactHint() ?? '', /Unstruck page/);
      const ctl = emptyControls();
      ctl.interact = true;
      g.update(1 / 30, ctl);
      assert.equal(inkedCount(g.level), 0, `page ${k}: the floor clean`);
      assert.equal(pagesInHand(g.hero.pages, g.level.pagesUsed), 3 - k);
    }
    fight();
    assert.doesNotMatch(g.interactHint() ?? '', /Unstruck page/, 'none left');
    g.enterDungeon();
    assert.equal(pagesInHand(g.hero.pages, g.level.pagesUsed), 3, 'come again: all three again');
  }));

test('the clapper: the armourer asks once floor 10 is cleared; the first Bells won gives it, once; brought, the camp bell rings and three fully modded rares are laid out', () =>
  on(() => {
    const t = seasoned(new Game('warrior', 9), 30);
    t.cleared = 9;
    assert.equal(t.clapperDue(), null);
    t.cleared = 10;
    assert.equal(t.clapperDue(), 'clapperAsk');

    const g = at(11);
    g.monsters = g.monsters.filter((m) => m.boss);
    winBells(g);
    const c = questDrops(g, 'clapper');
    assert.equal(c.length, 1, 'the clapper falls with the explosion, asked for or not');
    const L = g.level;
    assert.equal(L.walk[Math.floor(c[0].y) * L.floor.w + Math.floor(c[0].x)], 1);
    walkTo(g, c[0].x, c[0].y);
    assert.equal(g.hero.clapper, 'got');
    // (won again on another floor: none)
    const g2 = at(13);
    g2.hero.clapper = 'got';
    g2.monsters = g2.monsters.filter((m) => m.boss);
    winBells(g2);
    assert.equal(questDrops(g2, 'clapper').length, 0, 'one clapper');

    const s = campBeside(g, 'armourer');
    assert.equal(g.handInNear(), 'clapperGive');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.clapper, 'given');
    assert.ok(g.level.campBell, "the camp's bell hangs");
    const cb = g.level.campBell!;
    assert.ok(Math.hypot(cb.x - s.x, cb.y - s.y) <= 3.3, 'by the forge');
    assert.equal(cb.rungAt, g.time, 'and rings');
    const laid = g.drops.filter((d) => d.choice);
    assert.equal(laid.length, 3);
    assert.deepEqual(laid.map((d) => d.item!.slot).sort(), ['boots', 'gloves', 'helm']);
    for (const d of laid) {
      assert.equal(d.item!.rarity, 2, 'a rare');
      assert.equal(d.item!.affixes.length, 4, 'fully modded: two prefixes and two suffixes');
      assert.equal(g.level.walk[Math.floor(d.y) * g.level.floor.w + Math.floor(d.x)], 1);
    }
    for (let i = 0; i < laid.length; i++) for (let j = i + 1; j < laid.length; j++) assert.ok(Math.hypot(laid[i].x - laid[j].x, laid[i].y - laid[j].y) >= 1.5, 'apart');
  }));

test("the armourer's pick: one taken, the others go back; left lying, laid out again in the camp; kept in the save", () =>
  on(() => {
    const g = seasoned(new Game('ranger', 9), 30);
    g.cleared = 11;
    g.hero.clapper = 'got';
    campBeside(g, 'armourer');
    assert.ok(inner(g).handIn());
    const ids = g.hero.laidOut!.armourer!.map((it) => it.uid);
    // (gone off and come again: the same three)
    const s = JSON.parse(JSON.stringify(g.save())) as RunSave;
    const back = Game.restore(s);
    assert.deepEqual(back.hero.laidOut!.armourer!.map((it) => it.uid), ids, 'kept in the save');
    g.enterTown();
    const laid = g.drops.filter((d) => d.choice);
    assert.deepEqual(laid.map((d) => d.item!.uid).sort(), [...ids].sort(), 'laid out again');
    assert.ok(g.level.campBell, 'the bell still hangs');
    const pick = laid[1];
    // (what he has: in his bag, or put on where that slot was empty)
    const has = (): number[] => [...g.hero.bag, ...Object.values(g.hero.gear)].filter((it) => !!it).map((it) => it!.uid);
    const before = has().length;
    walkTo(g, pick.x, pick.y, 1);
    assert.ok(has().includes(pick.item!.uid), 'the one taken is his');
    assert.equal(has().length, before + 1, 'one, not three');
    assert.equal(g.drops.filter((d) => d.choice).length, 0, 'the others go back');
    assert.equal(g.hero.laidOut, undefined);
  }));

test('saved and loaded: the jar, the pages and the clapper', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.hero.jar = 'given';
    g.hero.pages = 5;
    g.hero.clapper = 'got';
    const s = JSON.parse(JSON.stringify(g.save())) as RunSave;
    const back = Game.restore(s);
    assert.equal(back.hero.jar, 'given');
    assert.equal(back.hero.pages, 5);
    assert.equal(back.hero.clapper, 'got');
  }));

// His words, 13 Nov 2026, 18:19: “Remember we want triggers for “speak to ______” when the quest becomes available and “return to
// __________” when the quest is complete” (game/quest_marks.ts SPEAK_RETURN).
test('"Speak to the armourer" as his quest opens; the jar picked up in the sewers, "Return to the mystic" at once, and on coming into the camp', () =>
  on(() => {
    const g = at(12);
    g.hero.feather = 'given';
    g.hero.jar = 'asked';
    g.hero.clapper = 'asked';
    g.enterDungeon();
    g.update(1 / 30, emptyControls());
    assert.equal(g.speakTo, null, 'nothing to bring back yet');
    const jar = g.level.props.find((p) => p.name === CRIERS_JAR)!;
    walkTo(g, jar.x + 0.4, jar.y + 0.6, 0.2);
    assert.equal(g.speakTo?.who, 'mystic');
    assert.equal(g.speakTo?.back, true);
    assert.equal(questBanner(g)?.text, 'Return to the MYSTIC');
    g.wayDepth = 12;
    g.enterTown();
    g.update(1 / 30, emptyControls());
    assert.equal(questBanner(g)?.text, 'Return to the MYSTIC', 'and on coming into the camp');

    const t = seasoned(new Game('warrior', 9), 30);
    t.hero.feather = 'given';
    t.hero.jar = 'given';
    t.cleared = 9;
    t.wayDepth = 11;
    t.enterTown();
    t.update(1 / 30, emptyControls());
    t.cleared = 10;
    t.update(1 / 30, emptyControls());
    assert.equal(t.speakTo?.who, 'armourer', 'the moment his quest opens');
    assert.equal(questBanner(t)?.text, 'Speak to the ARMOURER');
  }));
