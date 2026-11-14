// THE QUEST LINE OF FLOORS 16 TO 20 (game/quests1620.ts, QUESTS1620, off until his yes to its pictures). Planned with him
// 13 Nov 2026: THE CLOCKWORK SONGBIRD (the armourer; required: its key from the Prince, its spring from the Queen, the bird from
// before the King's throne; mended, it opens the Quiet Tower and sings against the Moth once a phase), THE WHOLE COURT (the
// stranger: one card of each royal for a unique) and THE CAPTAIN'S VOICE (a bottled voice on floor 12; the silent knight-captain
// of floor 19 given it, his knights stand down and he gives a weapon).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT2, HIGH_CITY } from '../src/game/act1';
import { CRIERS_JAR } from '../src/game/act2/undercity';
import { Game } from '../src/game/game';
import type { RunSave } from '../src/game/game';
import { BIRD_ALL, BIRD_BODY, BIRD_KEY, BIRD_SPRING, BROKEN_BIRD, CAPTAIN_JAR_VARIANT, QUESTS1620, SONG } from '../src/game/quests1620';
import { emptyControls } from '../src/game/state';
import type { Drop, Monster } from '../src/game/state';
import { LAST_WORD_IDS } from '../src/game/types';
import { EXITS } from '../src/game/ways';
import { questBanner } from '../src/ui/guide';
import { seasoned } from './helpers';

type Inner = {
  handIn: () => boolean;
  kill: (m: Monster) => void;
  takeWay: (to: string) => void;
  hushT: number;
};
const inner = (g: Game): Inner => g as unknown as Inner;

function on<T>(run: () => T, quests = true): T {
  const was = [QUESTS1620.on, EXITS.on, ACT2.on, HIGH_CITY.on];
  QUESTS1620.on = quests;
  EXITS.on = true;
  ACT2.on = true;
  HIGH_CITY.on = true;
  try {
    return run();
  } finally {
    [QUESTS1620.on, EXITS.on, ACT2.on, HIGH_CITY.on] = was;
  }
}

/** A hero come to floor `depth` of the High City, god (no harm). */
function at(depth: number, seed = 11): Game {
  const g = seasoned(new Game('warrior', seed), 30);
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

/** The use button, once. */
function use(g: Game): void {
  const c = emptyControls();
  c.interact = true;
  g.update(1 / 30, c);
}

/** Into the camp, beside the one of `kind`. */
function campBeside(g: Game, kind: 'armourer' | 'stranger'): { x: number; y: number } {
  g.wayDepth = Math.max(g.wayDepth, 16);
  g.enterTown();
  const s = g.level.stations.find((q) => q.kind === kind)!;
  assert.ok(s, `the camp has its ${kind}`);
  g.hero.x = s.x;
  g.hero.y = s.y;
  return s;
}

const said = (g: Game, re: RegExp): boolean => g.events.some((e) => e.t === 'msg' && re.test(e.text));
const questDrops = (g: Game, thing: 'key' | 'spring'): Drop[] => g.drops.filter((d) => d.kind === 'quest' && d.thing === thing);
const boss = (g: Game, kind: string): Monster => {
  const m = g.monsters.find((q) => q.kind === kind && q.boss && !q.dead)!;
  assert.ok(m, `the ${kind} on floor ${g.depth}`);
  return m;
};

test('off: the armourer asks nothing, the Prince drops no key, the tower is not shut, no captain stands in the barracks', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.cleared = 18;
    assert.equal(g.birdDue(), null);
    const p = at(17);
    inner(p).kill(boss(p, 'prince'));
    assert.equal(questDrops(p, 'key').length, 0);
    const k = at(19);
    assert.equal(k.level.captain, undefined);
    k.wayDepth = 19;
    inner(k).takeWay('on');
    assert.equal(k.depth, 20, 'on up to the tower, as before');
  }, false));

test('and off with the High City off: nothing of it even with its own switch on', () =>
  on(() => {
    HIGH_CITY.on = false;
    const g = seasoned(new Game('warrior', 9), 30);
    g.cleared = 18;
    assert.equal(g.birdDue(), null);
    g.hero.cards = { princess: 1 };
    assert.equal(g.courtDue(), null);
  }));

test('the armourer asks for the songbird once the Princess has fallen, and not before; asked once', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.cleared = 15;
    assert.equal(g.birdDue(), null, 'not before floor 16 is cleared');
    g.cleared = 16;
    assert.equal(g.birdDue(), 'birdAsk');
    // (his clapper's ask, the older, comes first)
    g.hero.clapper = 'given';
    campBeside(g, 'armourer');
    assert.ok(g.questGivers().includes('armourer'));
    assert.equal(g.handInNear(), 'birdAsk');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.bird, 'asked');
    assert.equal(g.birdDue(), null, 'asked once');
  }));

test("its parts: the Prince's key, the Queen's spring (each once), the bird before the throne once the King has fallen", () =>
  on(() => {
    for (const [depth, kind, thing, bit] of [[17, 'prince', 'key', BIRD_KEY], [18, 'gqueen', 'spring', BIRD_SPRING]] as const) {
      const g = at(depth);
      inner(g).kill(boss(g, kind));
      const d = questDrops(g, thing);
      assert.equal(d.length, 1, `the ${kind} drops the ${thing}`);
      const L = g.level;
      assert.equal(L.walk[Math.floor(d[0].y) * L.floor.w + Math.floor(d[0].x)], 1, 'on floor he can walk to');
      walkTo(g, d[0].x, d[0].y);
      assert.equal(g.hero.birdParts, bit, `the ${thing} taken`);
      assert.equal(questDrops(g, thing).length, 0);
      g.enterDungeon();
      inner(g).kill(boss(g, kind));
      assert.equal(questDrops(g, thing).length, 0, 'once');
    }
    const g = at(19);
    const bird = g.level.props.find((p) => p.name === BROKEN_BIRD)!;
    assert.ok(bird, 'the broken bird before the throne');
    walkTo(g, bird.x, bird.y + 0.5, 0.3);
    assert.equal(g.hero.birdParts ?? 0, 0, 'not while the King lives');
    inner(g).kill(boss(g, 'gking'));
    walkTo(g, bird.x, bird.y + 0.5, 0.3);
    assert.equal(g.hero.birdParts, BIRD_BODY, 'the bird taken, the King fallen');
    assert.ok(!g.perils.some((p) => p.a1 === 'gking:bird' && p.t < p.dur), 'its song at his death ends in his hands');
    // (come again, the bird is not there: his)
    g.enterDungeon();
    assert.ok(!g.level.props.some((p) => p.name === BROKEN_BIRD), 'taken, it is not there again');
  }));

test('mended: the three brought, the armourer gives one of the deepest words, and the waypoint takes him up to the tower', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.cleared = 19;
    g.wayDepth = 19;
    g.hero.bird = 'asked';
    g.hero.birdParts = BIRD_KEY | BIRD_SPRING;
    assert.equal(g.birdDue(), null, 'two of three: not yet');
    g.hero.birdParts = BIRD_ALL;
    assert.equal(g.turnInFor(), 'armourer', 'a marker over the waypoint home');
    campBeside(g, 'armourer');
    const before = LAST_WORD_IDS.reduce((n, w) => n + g.hero.words[w], 0);
    assert.equal(g.handInNear(), 'birdGive');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.bird, 'mended');
    assert.equal(LAST_WORD_IDS.reduce((n, w) => n + g.hero.words[w], 0), before + 1, 'one of the deepest words');
    assert.equal(g.wayDepth, 20, 'the waypoint on to the Quiet Tower');
    assert.equal(g.birdDue(), null, 'once');
  }));

test('the tower: from the Keep, not mended, the way on takes him home; mended, or up it before, on to floor 20', () =>
  on(() => {
    const g = at(19);
    g.wayDepth = 19;
    inner(g).takeWay('on');
    assert.ok(g.level.town, 'home to the camp');
    assert.equal(g.wayDepth, 19, 'the waypoint not on');
    assert.ok(said(g, /Quiet Tower stays shut/));
    const m = at(19);
    m.hero.bird = 'mended';
    inner(m).takeWay('on');
    assert.equal(m.depth, 20, 'mended: on up');
    assert.ok(!m.level.town);
    const u = at(19);
    u.wayDepth = 20;
    inner(u).takeWay('on');
    assert.equal(u.depth, 20, 'been up before: on up');
  }));

test("against the Moth: once each phase, the use button: the bird sings, its dust blown away, his words back, the Moth stunned", () =>
  on(() => {
    const g = at(20);
    const moth = boss(g, 'moth');
    g.monsters = [moth];
    g.hero.x = moth.x + 3;
    g.hero.y = moth.y;
    assert.equal(g.interactHint(), null, 'the bird not mended: no song');
    g.hero.bird = 'mended';
    assert.match(g.interactHint() ?? '', /Songbird/);
    // (a cloud of its dust on the floor, the Hush on him)
    g.perils.push({ ...(g.perils[0] ?? {}), a1: 'moth:dust', x: g.hero.x, y: g.hero.y, t: 0.5, dur: 9, hit: 0 } as never);
    inner(g).hushT = 5;
    use(g);
    assert.ok(!g.perils.some((p) => p.a1 === 'moth:dust' && p.t < p.dur), 'the dust blown away');
    assert.equal(inner(g).hushT, 0, 'his words back');
    assert.ok(moth.stunT > 0 && moth.stunT <= SONG.stun, 'the Moth stunned');
    assert.equal(g.interactHint(), null, 'once this phase');
    moth.stunT = 0;
    moth.life = moth.maxLife * 0.5;
    assert.match(g.interactHint() ?? '', /Songbird/, 'the next phase: again');
    use(g);
    moth.life = moth.maxLife * 0.5;
    assert.equal(g.interactHint(), null);
  }));

test('the whole court: a royal card held, the stranger asks; one of each brought, he takes them and gives a unique', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.cleared = 16;
    assert.equal(g.courtDue(), null, 'no cards: nothing');
    g.hero.cards = { prince: 2 };
    assert.equal(g.courtDue(), 'courtAsk');
    campBeside(g, 'stranger');
    assert.equal(g.handInNear(), 'courtAsk');
    assert.ok(inner(g).handIn());
    assert.equal(g.hero.court, 'asked');
    assert.equal(g.courtDue(), null, 'asked once');
    g.hero.cards = { princess: 1, prince: 2, queen: 1, king: 3 };
    assert.equal(g.courtDue(), 'courtGive');
    assert.equal(g.turnInFor(), 'stranger');
    const items = g.drops.filter((d) => d.kind === 'item').length;
    assert.ok(inner(g).handIn());
    assert.deepEqual(g.hero.cards, { princess: 0, prince: 1, queen: 0, king: 2 }, 'one of each taken');
    assert.equal(g.hero.court, 'given');
    const got = g.drops.filter((d) => d.kind === 'item');
    assert.equal(got.length, items + 1, 'his reward at his feet');
    assert.equal(g.courtDue(), null, 'once');
  }));

test("the captain's voice: the jar in the sewers' side chamber, walked up to; the knight-captain silent without it; with it, his knights stand down and he gives a weapon", () =>
  on(() => {
    const g = at(12);
    const jar = g.level.props.find((p) => p.name === CRIERS_JAR && p.variant === CAPTAIN_JAR_VARIANT)!;
    assert.ok(jar, "a second jar, the captain's");
    const L = g.level;
    assert.equal(L.walk[jar.ty * L.floor.w + jar.tx], 1, 'on floor he can walk to');
    const side = (L.land?.areas ?? []).filter((a) => a.role === 'side');
    assert.ok(side.some((a) => Math.hypot(a.blob.x - jar.x, a.blob.y - jar.y) < 6), 'in a side chamber');
    walkTo(g, jar.x, jar.y, 0.3);
    assert.equal(jar.state, 1);
    assert.equal(g.hero.captainJar, 'got');
    assert.ok(g.speakTo?.who === 'knight-captain' && g.speakTo.back, '"Return to the KNIGHT-CAPTAIN"');
    assert.match(questBanner(g)?.text ?? '', /Return to the KNIGHT-CAPTAIN/);
    assert.match(questBanner(g)?.sub ?? '', /floor 19/);
    // (taken: come again, none)
    g.enterDungeon();
    assert.ok(!g.level.props.some((p) => p.name === CRIERS_JAR && p.variant === CAPTAIN_JAR_VARIANT));

    const k = at(19);
    const c = k.level.captain!;
    assert.ok(c, 'the knight-captain in the barracks');
    const lair = k.level.land!.areas.find((a) => a.role === 'lair')!;
    assert.ok(Math.hypot(lair.blob.x - c.x, lair.blob.y - c.y) < 4, "in the knights' lair");
    assert.ok(k.monsters.some((m) => m.kind === 'kknight'), 'his knights');
    k.monsters = k.monsters.filter((m) => m.kind === 'kknight');
    k.hero.x = c.x + 1;
    k.hero.y = c.y;
    assert.match(k.interactHint() ?? '', /Knight-captain/);
    use(k);
    assert.ok(said(k, /silent/), 'without his voice, silent');
    assert.ok(k.monsters.some((m) => m.kind === 'kknight'));
    k.hero.captainJar = 'got';
    const items = k.drops.filter((d) => d.kind === 'item').length;
    use(k);
    assert.equal(k.hero.captainJar, 'given');
    assert.ok(!k.monsters.some((m) => m.kind === 'kknight' && !m.dead), 'his knights stand down');
    const got = k.drops.filter((d) => d.kind === 'item');
    assert.equal(got.length, items + 1, 'his gift at the hero\'s feet');
    assert.equal(got[got.length - 1].item?.slot, 'mainhand', 'a weapon');
    k.enterDungeon();
    assert.ok(!k.monsters.some((m) => m.kind === 'kknight'), 'and every time after');
  }));

test('what is gathered is kept: saved and loaded', () =>
  on(() => {
    const g = seasoned(new Game('warrior', 9), 30);
    g.hero.bird = 'asked';
    g.hero.birdParts = BIRD_KEY | BIRD_BODY;
    g.hero.court = 'given';
    g.hero.captainJar = 'got';
    const s = JSON.parse(JSON.stringify(g.save())) as RunSave;
    const t = Game.restore(s)!;
    assert.equal(t.hero.bird, 'asked');
    assert.equal(t.hero.birdParts, BIRD_KEY | BIRD_BODY);
    assert.equal(t.hero.court, 'given');
    assert.equal(t.hero.captainJar, 'got');
  }));
