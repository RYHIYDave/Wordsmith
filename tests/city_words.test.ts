// THE CITY'S WORDS AT WORK (Version 23.8): Pulling, Splitting, Hexing and Stilling, found from floor 11 down. His words to the
// main chat, 21 Oct 2026, 18:25 Pacific: “And let’s add some words to levels 11-15”; asked which, his picks: “Pulling
// (Recommended),Splitting (Recommended),Hexing (Recommended),Stilling (Recommended)”. How each plays is his doc "Wordsmith: The
// New Words" (his yes of 8 Oct 2026, 16:53: "Yes, as it is (Recommended)"), its numbers the starting points (src/game/defs.ts:
// PULL, SPLIT, HEX, STILL); their looks are the art chat's of 8 Oct (src/render/words3.ts), called up by the rules' events.
// These tests hold:
//   1. the four as words: shaping words, their attributes and names, in every list of words; found only from floor 11 down;
//   2. on a floor before 11 no monster carries one and none drops; from 11 they do;
//   3. Pulling in front drags in what is round where it struck (an elite half as far, a boss not at all); behind, its vortex;
//   4. Splitting in front: the first hit's copies fly on to the nearest others; behind, the shards;
//   5. Hexing in front: the curse, more damage from everything; behind, the circle, enemies in it weaker;
//   6. Stilling in front: slowed in time (a boss half as much); behind, the bubble, monsters and their shots crawling;
//   7. the four on monsters: dragged toward it, cursed, his cooldowns slowed, and the split in two at half life;
//   8. on gear: Pulling's reach for gold and orbs, the others' damage, attributes and cooldowns;
//   9. their looks, called up by the rules' events.
//   run: tsx --test tests/city_words.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { DEEP_WORDS, DEEP_WORDS_FROM, HEX, PULL, SPLIT, STILL, TUNE, WORDS, wordsAt } from '../src/game/defs';
import { Game } from '../src/game/game';
import { imbueItem, rollItem } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster, Zone } from '../src/game/state';
import { WORD_IDS } from '../src/game/types';
import type { ClassId, Element, MonsterKind, WordId } from '../src/game/types';
import { RNG as Dice } from '../src/engine/rng';
import { Fx } from '../src/render/fx';
import { W3, clear3, events3 } from '../src/render/words3';
import { land, seasoned } from './helpers';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  zones: Zone[];
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  hitMonster(m: Monster, i: number, frac: number, quiet: boolean): void;
  damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number): void;
  addPatch(i: number, kind: 'cracks' | 'ward' | 'vortex' | 'hex' | 'bubble', x: number, y: number, rad: number, dur: number, share: number): void;
  timeOf(m: Monster): number;
}

/** The practice room, emptied, with the hero at (14.5, 15.5) facing +x and these words set. */
function room(cls: ClassId, words: readonly [number, 'front' | 'behind', WordId][] = [], seed = 5): { g: Game; a: Inside; seen: GameEvent[] } {
  const g = Game.forPractice(cls, seed);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const [i, side, w] of words) {
    h.words[w] = (h.words[w] ?? 0) + 1;
    assert.equal(g.socket(i, side, w), null, `${w} goes ${side} of ability ${i}`);
  }
  g.events.length = 0;
  return { g, a, seen: [] };
}

/** A monster (dx, dy) from the hero, awake, standing still and holding its blows, with life enough. */
function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, rank: 0 | 1 | 2 = 0, boss = false): Monster {
  const h = g.hero;
  const m = a.spawn(kind, h.x + dx, h.y + dy, 1, rank, boss, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e6;
  return m;
}

function run(g: Game, seen: GameEvent[], secs: number, c: Controls = emptyControls()): void {
  for (let t = 0; t < secs - 1e-9; t += DT) {
    g.update(DT, c);
    seen.push(...g.events);
    g.events.length = 0;
  }
}

/** The hero's quick attack at monster `m`, by the rules, to where it lands. */
function swing(g: Game, seen: GameEvent[], m: Monster): void {
  const h = g.hero;
  h.swingT = 0;
  const c = emptyControls();
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  g.update(DT, c);
  seen.push(...g.events);
  g.events.length = 0;
  c.fire = false;
  land(g, c, DT, () => {
    seen.push(...g.events);
    g.events.length = 0;
  });
}

const of = <T extends GameEvent['t']>(seen: readonly GameEvent[], t: T): Extract<GameEvent, { t: T }>[] => seen.filter((e) => e.t === t) as Extract<GameEvent, { t: T }>[];
const gap = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);

/** Dungeon `depth` of a character who has been down before (the ring lit: words are carried and fall). */
function dungeon(seed: number, depth: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = depth;
  g.cleared = depth;
  g.enterDungeon();
  return g;
}

// ---------------------------------------------------------------------------------------------

test('1. the four are shaping words, in every list of words, and found only from floor 11 down', () => {
  for (const w of ['pulling', 'splitting', 'hexing', 'stilling'] as const) {
    assert.ok(WORD_IDS.includes(w), `${w} is a word`);
    assert.equal(WORDS[w].kind, 'shape');
    assert.ok(DEEP_WORDS.includes(w));
  }
  assert.deepEqual(['pulling', 'splitting', 'hexing', 'stilling'].map((w) => WORDS[w as WordId].attr), ['int', 'dex', 'int', 'int'], 'Pulling, Hexing and Stilling by Intelligence, Splitting by Dexterity, as his doc has them');
  assert.deepEqual(['pulling', 'splitting', 'hexing', 'stilling'].map((w) => WORDS[w as WordId].behind), ['of the Vortex', 'of Shards', 'of Hexes', 'of Stillness']);
  assert.equal(DEEP_WORDS_FROM, 11);
  for (const p of [1, 5, 10]) assert.ok(!wordsAt(p).some((w) => DEEP_WORDS.includes(w)), `none on floor ${p}`);
  for (const p of [11, 15, 21]) assert.deepEqual(wordsAt(p), WORD_IDS, `all of them at level ${p}`);
  // (before 11, the same thirteen in the same order: what was drawn before is drawn now)
  assert.deepEqual(wordsAt(10), WORD_IDS.slice(0, 13));
});

test('2. before floor 11 no monster carries one of the four and none drops; from floor 11 they do', () => {
  let deep = 0;
  for (let seed = 1; seed <= 6; seed++) {
    const shallow = dungeon(seed, 8);
    for (const m of shallow.monsters) {
      assert.ok(!m.words.some((w) => DEEP_WORDS.includes(w)), `floor 8, seed ${seed}: ${m.name} has ${m.words.join(', ')}`);
      assert.ok(!m.carries.some((w) => DEEP_WORDS.includes(w)), `floor 8, seed ${seed}: ${m.name} carries ${m.carries.join(', ')}`);
    }
    const g = dungeon(seed, 12);
    deep += g.monsters.filter((m) => m.words.some((w) => DEEP_WORDS.includes(w))).length;
  }
  assert.ok(deep > 0, `on floor 12 some monsters have one of the four (${deep})`);
});

test('3a. Pulling in front drags what is round the one it strikes toward it: an elite half as far, a boss not at all', () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'pulling']]);
  const r = g.hero.skills[0].r;
  assert.ok(r.pull >= PULL.far && r.pull <= PULL.most, `its pull ${r.pull}`);
  const m = put(g, a, 'skeleton', 1.1, 0);
  const o = put(g, a, 'skeleton', 1.1, 2.0);
  const e = put(g, a, 'skeleton', 1.1, -2.0, 1);
  const b = put(g, a, 'skeleton', 3.1, 0, 0, true);
  const before = [gap(o, m), gap(e, m), gap(b, m)];
  swing(g, seen, m);
  run(g, seen, 0.5);
  assert.ok(of(seen, 'pull').length >= 1, 'its look was called');
  const pulled = before[0] - gap(o, m);
  assert.ok(pulled > 1.0 && gap(o, m) >= PULL.stop - 0.05, `an ordinary one dragged ${pulled.toFixed(2)} tiles, to ${gap(o, m).toFixed(2)}`);
  const half = before[1] - gap(e, m);
  assert.ok(half > 0.4 && half < pulled, `an elite dragged less: ${half.toFixed(2)}`);
  assert.ok(Math.abs(before[2] - gap(b, m)) < 0.01, 'a boss stands firm');
});

test('3b. Pulling behind leaves a vortex that keeps drawing what is in it in to its middle', () => {
  const { g, a, seen } = room('warrior', [[0, 'behind', 'pulling']]);
  assert.equal(g.hero.skills[0].r.vortex, PULL.vortex);
  a.addPatch(0, 'vortex', 20, 15.5, 2, PULL.vortex, 0);
  const o = put(g, a, 'skeleton', 20 - g.hero.x + 1.6, 0);
  const d0 = Math.hypot(o.x - 20, o.y - 15.5);
  run(g, seen, 1.0);
  const d1 = Math.hypot(o.x - 20, o.y - 15.5);
  assert.ok(d1 < d0 - 0.6 && d1 >= PULL.middle - 0.05, `drawn in from ${d0.toFixed(2)} to ${d1.toFixed(2)}`);
  run(g, seen, PULL.vortex);
  assert.ok(!a.zones.some((z) => z.kind === 'vortex'), 'and it is gone in its time');
});

test("4a. Splitting in front: the first hit's copies fly on to the nearest three others, weaker, and the fourth is left", () => {
  const { g, a, seen } = room('warrior', [[0, 'front', 'splitting']]);
  const r = g.hero.skills[0].r;
  assert.ok(r.split >= SPLIT.share && r.split <= SPLIT.most);
  const m = put(g, a, 'skeleton', 1.1, 0);
  const others = [put(g, a, 'skeleton', 2.2, 1.2), put(g, a, 'skeleton', 2.6, -1.0), put(g, a, 'skeleton', 3.2, 0.2), put(g, a, 'skeleton', 4.2, 1.8)];
  swing(g, seen, m);
  run(g, seen, 0.6);
  const split = of(seen, 'split');
  assert.equal(split.length, 1, 'one split for one use');
  assert.equal(split[0].to.length, 3);
  const hurt = others.filter((o) => o.life < o.maxLife);
  assert.equal(hurt.length, 3, 'three copies, three struck');
  assert.ok(!hurt.includes(others[3]), 'the farthest is left');
  const took = m.maxLife - m.life;
  for (const o of hurt) assert.ok(o.maxLife - o.life < took, `a copy is weaker than the hit: ${o.maxLife - o.life} against ${took}`);
});

test('4b. Splitting behind: where it ends, shards fly out every way, each striking the first on its line', () => {
  const { g, a, seen } = room('warrior', [[0, 'behind', 'splitting']]);
  assert.ok(g.hero.skills[0].r.shards >= SPLIT.shardShare);
  const m = put(g, a, 'skeleton', 1.1, 0);
  const ring: Monster[] = [];
  for (let k = 0; k < 12; k++) {
    const ang = (k / 12) * Math.PI * 2;
    ring.push(put(g, a, 'skeleton', 1.1 + Math.cos(ang) * 2.2, Math.sin(ang) * 2.2));
  }
  swing(g, seen, m);
  run(g, seen, 0.6);
  assert.ok(of(seen, 'shards').length >= 1, 'its look was called');
  const hurt = ring.filter((o) => o.life < o.maxLife).length;
  assert.ok(hurt >= 3 && hurt <= SPLIT.shards, `${hurt} of the ring struck by six shards`);
});

test('5a. Hexing in front curses what it hits: it takes 20% more from everything, for 4 s', () => {
  const { g, a, seen } = room('mage', [[0, 'front', 'hexing']]);
  const r = g.hero.skills[0].r;
  assert.ok(r.hex >= HEX.more && r.hex <= HEX.most);
  const m = put(g, a, 'skeleton', 2.0, 0);
  a.damageMonster(m, 100, 'phys', false, -1);
  const plain = m.maxLife - m.life;
  a.hitMonster(m, 0, 1, false);
  assert.ok((m.hexT ?? 0) > 3.9 && Math.abs((m.hexMore ?? 0) - r.hex) < 1e-9, 'cursed');
  const before = m.life;
  a.damageMonster(m, 100, 'phys', false, -1);
  assert.equal(before - m.life, Math.round(plain * (1 + r.hex)), 'more from everything');
  run(g, seen, HEX.secs + 0.1);
  assert.equal(m.hexT, 0, 'and it runs out');
});

test('5b. Hexing behind: a blow from one standing in the hex circle is a quarter weaker', () => {
  const { g, a } = room('warrior', [[0, 'behind', 'hexing']]);
  const share = g.hero.skills[0].r.hexCircle;
  assert.ok(share >= HEX.weaker);
  const h = g.hero;
  const m = put(g, a, 'skeleton', 1.0, 0);
  const blow = (): number => {
    h.life = h.d.maxLife;
    h.invuln = 0;
    g.hurtHero(200, 'fire', [], m);
    return h.d.maxLife - h.life;
  };
  const outside = blow();
  a.addPatch(0, 'hex', m.x, m.y, 1.5, HEX.circle, share);
  const inside = blow();
  assert.ok(Math.abs(inside - outside * (1 - share)) <= 1, `inside ${inside}, outside ${outside}`);
});

test('6. Stilling: in front, what it hits slowed in time (a boss half as much); behind, a bubble where monsters and their shots crawl', () => {
  const { g, a } = room('mage', [[0, 'front', 'stilling']]);
  const r = g.hero.skills[0].r;
  assert.ok(r.still >= STILL.slower && r.still <= STILL.most);
  const m = put(g, a, 'skeleton', 2.0, 0);
  const b = put(g, a, 'skeleton', 2.0, 2.0, 0, true);
  a.hitMonster(m, 0, 1, false);
  a.hitMonster(b, 0, 1, false);
  assert.ok(Math.abs(a.timeOf(m) - (1 - r.still)) < 1e-9, `its time ${a.timeOf(m)}`);
  assert.ok(Math.abs(a.timeOf(b) - (1 - r.still * STILL.boss)) < 1e-9, `a boss's ${a.timeOf(b)}`);
  // its blow's wind-up runs slower too: a walker walks less far
  const { g: g2, a: a2, seen } = room('warrior', []);
  const w1 = put(g2, a2, 'skeleton', 6, 0);
  const w2 = put(g2, a2, 'skeleton', 6, 3);
  w1.speed = w2.speed = 2;
  w1.stillT = 5;
  w1.stillK = 0.4;
  const x1 = w1.x;
  const x2 = w2.x;
  run(g2, seen, 0.5);
  const r1 = Math.abs(w1.x - x1);
  const r2 = Math.hypot(w2.x - x2, 0);
  assert.ok(r1 < r2 * 0.75 && r1 > r2 * 0.4, `stilled walked ${r1.toFixed(2)}, the other ${r2.toFixed(2)}`);
  // behind: the bubble
  const { g: g3, a: a3, seen: s3 } = room('warrior', [[0, 'behind', 'stilling']]);
  const crawl = g3.hero.skills[0].r.bubble;
  assert.ok(crawl >= STILL.crawl);
  const q = put(g3, a3, 'skeleton', 3, 0);
  a3.addPatch(0, 'bubble', q.x, q.y, 1.5, STILL.bubble, crawl);
  assert.ok(Math.abs(a3.timeOf(q) - (1 - crawl)) < 1e-9);
  // a monster's shot in it crawls
  g3.projectiles.push({ x: q.x, y: q.y, vx: -4, vy: 0, r: 0.2, dist: 10, hostile: true, dmg: 1, element: 'phys', look: 'bolt', pierce: false, hit: [], volley: false, skill: -1, trail: 0, words: [], runed: false, clouded: false, age: 0, from: 'x', n: 0 } as never);
  const shot = g3.projectiles[g3.projectiles.length - 1];
  const sx = shot.x;
  run(g3, s3, 0.2);
  assert.ok(Math.abs(shot.x - sx) < 4 * 0.2 * (1 - crawl) + 0.05, `the shot crawled ${Math.abs(shot.x - sx).toFixed(2)}`);
});

test('7. on monsters: dragged toward it, cursed, cooldowns slowed; and one carrying Splitting splits in two at half its life', () => {
  const { g, a, seen } = room('warrior', []);
  const h = g.hero;
  const m = put(g, a, 'skeleton', 2.5, 0);
  // Pulling: a step toward it
  h.invuln = 0;
  g.hurtHero(10, 'phys', ['pulling'], m);
  assert.ok(h.step && h.step.dx > 0, 'dragged toward it');
  assert.ok(of(g.events, 'heroPulled').length === 1);
  // Hexing: he takes more for a while
  const blow = (): number => {
    h.life = h.d.maxLife;
    h.invuln = 0;
    h.step = null as never;
    g.hurtHero(200, 'fire', [], m);
    return h.d.maxLife - h.life;
  };
  const plain = blow();
  h.invuln = 0;
  g.hurtHero(1, 'fire', ['hexing'], m);
  assert.ok((h.hexT ?? 0) > 0, 'cursed');
  const cursed = blow();
  assert.ok(Math.abs(cursed - plain * (1 + HEX.monster)) <= 1, `cursed ${cursed}, plain ${plain}`);
  // Stilling: his cooldowns run slower
  h.invuln = 0;
  g.hurtHero(1, 'fire', ['stilling'], m);
  assert.ok((h.stillT ?? 0) > 0 && Math.abs((h.stillK ?? 0) - STILL.cooldowns) < 1e-9);
  const s = h.skills[1];
  s.charges = 0;
  s.cd = 5;
  run(g, seen, 1);
  assert.ok(Math.abs(5 - s.cd - (1 - STILL.cooldowns)) < 0.05, `a second's cooldown recovered ${(5 - s.cd).toFixed(2)}`);
  // Splitting: two of its kind at half its life, ordinary and wordless, and they split no more
  const sp = put(g, a, 'skeleton', 4, 2);
  sp.maxLife = sp.life = 300;
  sp.words = ['splitting'];
  const n0 = g.monsters.filter((o) => !o.dead).length;
  g.kill(sp);
  const fresh = g.monsters.filter((o) => !o.dead && o.split);
  assert.equal(fresh.length, 2);
  assert.equal(g.monsters.filter((o) => !o.dead).length, n0 + 1);
  for (const o of fresh) {
    assert.equal(o.kind, 'skeleton');
    assert.equal(o.maxLife, 150);
    assert.deepEqual(o.words, []);
    o.words = ['splitting'];
    g.kill(o);
  }
  assert.equal(g.monsters.filter((o) => !o.dead && o.split).length, 0, 'a split one splits no more');
});

test("8. on gear: Pulling's reach for gold and orbs, the others' damage, attributes and cooldowns", () => {
  const dice = new Dice(7);
  const seen = new Set<string>();
  for (const w of ['pulling', 'splitting', 'hexing', 'stilling'] as const) {
    for (let k = 0; k < 30; k++) {
      const it = rollItem(10, dice, { slot: k % 2 ? 'ring' : 'helm' });
      const got = imbueItem(it, w, dice);
      if (!got) continue;
      for (const mod of got.mods) seen.add(`${w}:${mod.stat}`);
    }
  }
  assert.ok(seen.has('pulling:pickupPct'), [...seen].join(' '));
  assert.ok(['splitting:dmgPct', 'splitting:dex', 'hexing:dmgPct', 'hexing:int', 'stilling:cdr', 'stilling:int'].every((k) => seen.has(k)), [...seen].join(' '));
  // a gold coin beyond the usual reach comes to him with Pulling's reach on him
  const { g } = room('warrior', []);
  const h = g.hero;
  g.drops.push({ kind: 'gold', x: h.x + TUNE.dropPull * 1.3, y: h.y, gold: 5, age: 9, item: null, word: null } as never);
  const coin = g.drops[g.drops.length - 1];
  const x0 = coin.x;
  g.update(DT, emptyControls());
  assert.equal(coin.x, x0, 'out of the usual reach, it lies');
  h.d.stats.pickupPct = 40;
  g.update(DT, emptyControls());
  assert.ok(coin.x < x0, 'with Pulling on his gear, it comes');
});

test('9. their looks are called up by the rules: the pull, the copies, the shards, the curse, the stilling and the patches', () => {
  clear3();
  const fx = new Fx();
  const { g, a, seen } = room('warrior', [[0, 'front', 'pulling'], [0, 'behind', 'hexing']]);
  const m = put(g, a, 'skeleton', 1.1, 0);
  put(g, a, 'skeleton', 1.1, 1.8);
  swing(g, seen, m);
  events3(seen, g, fx);
  assert.ok(W3.patches.some((p) => p.kind === 'hex'), 'the hex circle');
  assert.ok(W3.patches.some((p) => p.kind === 'vortex'), "the pull's dark middle");
  const m2 = put(g, a, 'skeleton', 2, 2);
  events3([{ t: 'hexOn', id: m2.id, x: m2.x, y: m2.y, secs: 4 }, { t: 'stillOn', id: m2.id, x: m2.x, y: m2.y, secs: 2 }], g, fx);
  const k = W3.marks.get(m2.id);
  assert.ok(k && k.hex > 0 && k.still > 0, 'the sigil and the slowed clock on it');
  events3([{ t: 'split', x: 15, y: 15, dx: 1, dy: 0, to: [{ x: 17, y: 15, secs: 0.2 }] }, { t: 'shards', x: 15, y: 15, r: 1.5 }], g, fx);
  assert.ok(W3.copies.length >= 1 && W3.patches.some((p) => p.kind === 'shards'), 'the copy flying and the shards lying');
  events3([{ t: 'zone', kind: 'bubble', x: 15, y: 15, r: 1.5, el: 'phys', dur: 4 }], g, fx);
  assert.ok(W3.patches.some((p) => p.kind === 'bubble'), 'the bubble');
  clear3();
});
