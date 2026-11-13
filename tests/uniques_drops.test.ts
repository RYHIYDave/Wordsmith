// UNIQUE ITEMS, WHERE THEY DROP AND HOW THEY ARE KEPT (game/uniques.ts UNIQUE_DROPS, game/game.ts; behind UNIQUES): his “designated
// boss drops but also a regular pool of uniques that can drop from anywhere”, the stranger's “very low chance to give a unique”;
// a unique kept through a save; its card.
//   run: tsx --test tests/uniques_drops.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { TUNE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { itemValue, rollItem } from '../src/game/items';
import type { Monster } from '../src/game/state';
import type { Item } from '../src/game/types';
import { LEVEL_UNIQUES, UNIQUES, UNIQUE_DROPS, UNIQUE_RULES, bossUnique, makeUnique, poolFor, uniqueOf } from '../src/game/uniques';

// (THE 62 ALONE: the leveling uniques, on since his yes of 12 Nov 2026, have a roll and a hand-out of their own, and their own test,
// tests/uniques_level.test.ts; here they are set aside)
LEVEL_UNIQUES.on = false;
import { itemCard } from '../src/ui/panels';
import { inner, off as off_, on, wear } from './uniques_helpers';

type Loot = { rollGear: (q?: number) => Item; dropLoot: (m: Monster) => void; power: number; depth: number; rng: RNG };
const loot = (g: Game): Loot => g as unknown as Loot;
/** A game in a dungeon of this depth, as far as loot cares. */
function deep(cls: 'warrior' | 'mage' | 'ranger' = 'warrior', depth = 8, seed = 4): Game {
  const g = new Game(cls, seed);
  g.depth = depth;
  g.hero.level = 20;
  g.hero.gold = 1e9;
  return g;
}
const with_ = <T>(set: () => void, back: () => void, f: () => T): T => {
  set();
  try {
    return f();
  } finally {
    back();
  }
};

test('off: nothing that drops is ever a unique, and the dice are thrown as they always were', () => {
  const a = deep();
  const b = deep();
  const off: Item[] = [];
  off_(() => {
    for (let k = 0; k < 400; k++) off.push(loot(a).rollGear(k % 5));
  });
  assert.equal(off.some((it) => it.rarity === 3), false);
  // (on, with no chance of one: the same pieces as with it off, to the last number: the switch itself changes no roll)
  const P = UNIQUE_DROPS.pool;
  const was = { ...P };
  const same = on(() =>
    with_(
      () => Object.assign(P, { plain: 0, elite: 0, hoard: 0 }),
      () => Object.assign(P, was),
      () => {
        const out: Item[] = [];
        for (let k = 0; k < 400; k++) out.push(loot(b).rollGear(k % 5));
        return out;
      },
    ),
  );
  assert.deepEqual(same.map((it) => [it.baseId, it.rarity, it.affixes.map((x) => x.id)]), off.map((it) => [it.baseId, it.rarity, it.affixes.map((x) => x.id)]));
});

test('the pool: now and then a piece that drops is one of the pool\'s for this hero, made for the floor; none before its floor', () =>
  on(() => {
    const P = UNIQUE_DROPS.pool;
    const was = { ...P };
    with_(
      () => Object.assign(P, { plain: 1, elite: 1, hoard: 1 }),
      () => Object.assign(P, was),
      () => {
        for (const cls of ['warrior', 'mage', 'ranger'] as const) {
          const g = deep(cls, 9);
          const ids = new Set<string>();
          for (let k = 0; k < 300; k++) {
            const it = loot(g).rollGear(0);
            assert.equal(it.rarity, 3);
            assert.equal(it.ilvl, loot(g).power, 'made for the floor');
            ids.add(it.unique!);
          }
          const mine = poolFor(cls).map((d) => d.id);
          assert.ok([...ids].every((id) => mine.includes(id)), 'only the ten for everyone and his own five');
          assert.equal(ids.size, 15, 'and every one of them');
        }
        const young = deep('warrior', P.from - 1);
        assert.notEqual(loot(young).rollGear(4).rarity, 3, 'none before its floor');
      },
    );
    // at its own numbers: rare, and rarer from an ordinary monster than from a hoard
    const g = deep('warrior', 12);
    g.hero.d.stats.magicFind = 0;
    let plain = 0;
    let hoard = 0;
    const N = 20000;
    for (let k = 0; k < N; k++) {
      if (loot(g).rollGear(0).rarity === 3) plain++;
      if (loot(g).rollGear(2).rarity === 3) hoard++;
    }
    assert.ok(Math.abs(plain / N - P.plain) < 0.003, `an ordinary monster's piece: ${plain} in ${N}`);
    assert.ok(Math.abs(hoard / N - P.hoard) < 0.005, `a hoard's: ${hoard} in ${N}`);
    assert.ok(hoard > plain);
  }));

test('a boss drops his own, now and then: every boss of floors 1 to 20; floor 13\'s pair as the last of them falls', () =>
  on(() => {
    const drop = (g: Game, kind: string, chance: number): Item[] => {
      const was = UNIQUE_DROPS.boss;
      UNIQUE_DROPS.boss = chance;
      try {
        const a = inner(g);
        const m = a.spawn(kind, g.hero.x, g.hero.y, 1, 0, true, a.rng);
        m.boss = true;
        g.drops.length = 0;
        loot(g).dropLoot(m);
        return g.drops.filter((d) => d.kind === 'item' && d.item && d.item.rarity === 3).map((d) => d.item!);
      } finally {
        UNIQUE_DROPS.boss = was;
      }
    };
    const g = deep('warrior', 5);
    for (const kind of ['warden', 'headsman', 'chained', 'amalgam', 'fleshmancer', 'unfinished', 'queen', 'cantor', 'stag', 'eye', 'crier', 'ratking', 'physician', 'censor', 'princess', 'prince', 'gqueen', 'gking', 'moth']) {
      const got = drop(g, kind, 1);
      assert.equal(got.length, 1, kind);
      assert.equal(got[0].unique, bossUnique(kind as never)!.id);
      assert.equal(uniqueOf(got[0])!.boss!.includes(kind as never), true);
    }
    assert.deepEqual(drop(g, 'quill', 1).map((it) => it.unique), ['quillsband']);
    assert.deepEqual(drop(g, 'headsman', 0), [], 'not every time');
    // (an ordinary monster, an elite, a guardian: never a boss's)
    const a = inner(g);
    const e = a.spawn('skeleton', g.hero.x, g.hero.y, 1, 0, false, a.rng);
    e.elite = true;
    const was = UNIQUE_DROPS.boss;
    UNIQUE_DROPS.boss = 1;
    g.drops.length = 0;
    loot(g).dropLoot(e);
    UNIQUE_DROPS.boss = was;
    assert.equal(g.drops.some((d) => d.item && d.item.rarity === 3), false);
    // at its own number, about one kill in ten (his own; a piece of his hoard may be one of the pool's besides, as any hoard's may)
    let n = 0;
    for (let k = 0; k < 3000; k++) n += drop(g, 'warden', UNIQUE_DROPS.boss).filter((it) => it.unique === 'wardenskeys').length;
    assert.ok(Math.abs(n / 3000 - UNIQUE_DROPS.boss) < 0.03, `${n} in 3000`);
  }));

test('the stranger\'s gamble: a very low chance of a unique of the kind thrown for, one of the pool\'s for this hero', () =>
  on(() => {
    const g = deep('warrior', 9);
    const kinds = g.gambleKinds();
    const throwFor = (name: string, chance: number): Item => {
      const was = TUNE.gambleOdds.unique;
      TUNE.gambleOdds.unique = chance;
      try {
        g.hero.bag.fill(null);
        assert.equal(g.gamble(kinds.findIndex((k) => k.name === name)), null);
        return g.hero.bag[g.won]!;
      } finally {
        TUNE.gambleOdds.unique = was;
      }
    };
    const helm = throwFor('Helmet', 1);
    assert.equal(helm.rarity, 3);
    assert.ok(['twofacedmask', 'longodds'].includes(helm.unique!), 'a helmet of the pool: never a boss\'s');
    const gs = throwFor('Greatsword', 1);
    assert.ok(['millstone', 'windcutter', 'undertow'].includes(gs.unique!), 'his own weapon\'s');
    assert.notEqual(throwFor('Bow', 1).rarity, 3, 'a bow\'s are the Ranger\'s: none for him, a plain throw');
    assert.notEqual(throwFor('Shield', 1).rarity, 3, 'no unique of that kind: a plain throw');
    assert.notEqual(throwFor('Helmet', 0).rarity, 3);
    // at its own odds, about one throw in two hundred
    let n = 0;
    const k = kinds.findIndex((q) => q.name === 'Belt');
    for (let i = 0; i < 6000; i++) {
      g.hero.bag.fill(null);
      g.gamble(k);
      if (g.hero.bag[g.won]!.rarity === 3) n++;
    }
    assert.ok(n >= 10 && n <= 60, `${n} in 6000 (about ${Math.round(6000 * TUNE.gambleOdds.unique)})`);
  }));

test('kept through a save: the unique itself, and what it does, the moment the hero is back', () =>
  on(() => {
    const g = deep('warrior', 9);
    wear(g, 'longodds', 'censorsseal');
    g.giveUnique('twofacedmask');
    const s = JSON.parse(JSON.stringify(g.save()));
    const back = Game.restore(s);
    assert.equal(back.hero.gear.helm!.unique, 'longodds');
    assert.equal(back.hero.gear.helm!.rarity, 3);
    assert.deepEqual(back.hero.gear.helm!.affixes, g.hero.gear.helm!.affixes);
    assert.equal(back.hero.bag.find((it) => it && it.unique === 'twofacedmask')!.name, 'Two-Faced Mask');
    assert.deepEqual(back.worn.sort(), ['censorsseal', 'longodds']);
    // (read back with the switch off: the piece is kept, orange and whole, and does nothing)
    const off = with_(
      () => (UNIQUES.on = false),
      () => (UNIQUES.on = true),
      () => Game.restore(JSON.parse(JSON.stringify(s))),
    );
    assert.equal(off.hero.gear.helm!.unique, 'longodds');
    assert.deepEqual(off.worn, []);
  }));

test('a hero-only piece on another hero: worn for its stats by this build\'s rule; refused where the rule says so', () =>
  on(() => {
    const g = deep('mage', 9);
    const pivot = makeUnique('pivot', 5, new RNG(1))!;
    g.hero.bag[0] = pivot;
    assert.equal(g.equipFromBag(0), null);
    assert.equal(g.hero.gear.boots, pivot);
    assert.equal(g.wears('pivot'), false, 'its rule does nothing for her');
    UNIQUE_RULES.othersWear = false;
    try {
      g.hero.gear.boots = null;
      g.hero.bag[0] = pivot;
      assert.equal(g.equipFromBag(0), 'Warrior only');
    } finally {
      UNIQUE_RULES.othersWear = true;
    }
  }));

test('its worth and its card: dearer than a rare; its name in orange, what it does, its price, no room for words', () =>
  on(() => {
    const g = deep('warrior', 9);
    const u = makeUnique('mothswing', 12, new RNG(2))!;
    let rare = rollItem(12, new RNG(3), { slot: 'chest', rarity: 2 });
    for (let s = 4; rare.baseId !== u.baseId; s++) rare = rollItem(12, new RNG(s), { slot: 'chest', rarity: 2 });
    assert.ok(itemValue(u) > itemValue(rare));
    const card = itemCard(g, u).map((l) => l.text);
    assert.equal(card[0], "The Moth's Wing");
    assert.ok(card[1].startsWith('Unique Chest'));
    assert.ok(card.some((t) => /less damage from every hit/.test(t)));
    assert.ok(card.some((t) => /darkens one of your words/.test(t)));
    assert.ok(card.includes('Cannot be crafted'));
    assert.equal(card.some((t) => /Room for|No room for words/.test(t)), false);
    // (an ordinary piece's card as it was)
    assert.ok(itemCard(g, rare).some((l) => /Room for|No room for words/.test(l.text)));
  }));
