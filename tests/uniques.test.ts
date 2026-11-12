// UNIQUE ITEMS (game/uniques.ts, behind UNIQUES, off until his yes): the list as his doc “Wordsmith: Unique Items” has it (62: one
// for each boss of floors 1 to 20, two for the endless final boss, ten for the pool, three for each of six weapons, two for each
// hero), his rules for them (orange, a fixed list of stats with only the numbers rolled, uncraftable), and where they drop.
//   run: tsx --test tests/uniques.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { TUNE } from '../src/game/defs';
import { bindProblem, imbueItem, imbueProblem, itemRoom, rollItem, splitProblem, statFits, statGroup, statRangeAt, stemSlot } from '../src/game/items';
import { ALL_CLASS_IDS } from '../src/game/types';
import type { ClassId, MonsterKind, WeaponKind } from '../src/game/types';
import { UNIQUES, UNIQUE_DEFS, UNIQUE_DROPS, UNIQUE_RULES, UNIQUE_TUNE, bossUnique, finalUniques, makeUnique, poolChance, poolFor, uniqueDef, uniqueLines, uniqueOf, uniqueSlot, uniqueWeapon, wearProblem, wornUniques } from '../src/game/uniques';
import { on } from './uniques_helpers';

/** Each floor's boss, as the game names their kinds (floor 13 is the pair). */
const BOSS_OF_FLOOR: readonly (readonly MonsterKind[])[] = [
  ['warden'], ['headsman'], ['chained'], ['amalgam'], ['fleshmancer'], ['unfinished'], ['queen'], ['cantor'], ['stag'], ['eye'],
  ['crier'], ['ratking'], ['scraper', 'quill'], ['physician'], ['censor'], ['princess'], ['prince'], ['gqueen'], ['gking'], ['moth'],
];
const WEAPON_HERO: Record<string, ClassId> = { greatsword: 'warrior', bow: 'ranger', staff: 'mage', tome: 'warlock', wrench: 'tinkerer', wraps: 'brawler' };

test('off until his yes: no unique is made, none is worn, the pool gives none', () => {
  assert.equal(UNIQUES.on, false);
  assert.equal(makeUnique('twofacedmask', 10, new RNG(1)), null);
  assert.equal(poolChance(2, 100, 20), 0);
  const it = on(() => makeUnique('twofacedmask', 10, new RNG(1)))!;
  const gear = { mainhand: null, offhand: null, helm: it, chest: null, gloves: null, belt: null, boots: null, amulet: null, ring1: null, ring2: null };
  assert.deepEqual(wornUniques(gear, 'warrior'), []);
  assert.deepEqual(on(() => wornUniques(gear, 'warrior')), ['twofacedmask']);
});

test('the 62 of his doc: a boss of every floor, two for the final boss, ten for the pool, three a weapon, two a hero', () => {
  assert.equal(UNIQUE_DEFS.length, 62);
  assert.equal(new Set(UNIQUE_DEFS.map((d) => d.id)).size, 62, 'no id twice');
  assert.equal(new Set(UNIQUE_DEFS.map((d) => d.name)).size, 62, 'no name twice');
  // one for each boss of floors 1 to 20
  const bosses = UNIQUE_DEFS.filter((d) => d.from === 'boss');
  assert.equal(bosses.length, 20);
  BOSS_OF_FLOOR.forEach((kinds, k) => {
    const mine = bosses.filter((d) => d.floor === k + 1);
    assert.equal(mine.length, 1, `floor ${k + 1}`);
    assert.deepEqual([...(mine[0].boss ?? [])], [...kinds], `floor ${k + 1}'s boss`);
    for (const kind of kinds) assert.equal(bossUnique(kind)?.id, mine[0].id);
  });
  // two from the endless final boss only
  assert.deepEqual(finalUniques().map((d) => d.name).sort(), ['The Ghostwriter', 'The Third Word']);
  // ten for the regular pool, anyone's
  const pool = UNIQUE_DEFS.filter((d) => d.from === 'pool');
  assert.equal(pool.filter((d) => !d.cls).length, 10);
  // three for each of the six weapons, each its hero's
  for (const [weapon, hero] of Object.entries(WEAPON_HERO)) {
    const three = pool.filter((d) => uniqueWeapon(d) === (weapon as WeaponKind));
    assert.equal(three.length, 3, weapon);
    for (const d of three) {
      assert.equal(d.cls, hero, `${d.name} is the ${hero}'s`);
      assert.equal(d.only, undefined);
    }
  }
  // two for each hero that name him and only work for him
  for (const cls of ALL_CLASS_IDS) {
    const two = pool.filter((d) => d.only && d.cls === cls);
    assert.equal(two.length, 2, cls);
    for (const d of two) assert.equal(uniqueWeapon(d), null, `${d.name} is not a weapon`);
  }
  assert.equal(10 + 20 + 2 + 18 + 12, 62);
  // his “Half and half”: the doc's own count, about a third wordsmithing after the weapon and hero ones
  const words = UNIQUE_DEFS.filter((d) => d.bends === 'words').length;
  assert.equal(words, 19);
});

test('each is on a kind of base there is, and its ordinary stats are ones a found affix may put on that slot: two at the most', () => {
  for (const d of UNIQUE_DEFS) {
    const slot = stemSlot(d.stem);
    assert.ok(slot, `${d.name}: no base '${d.stem}'`);
    assert.equal(uniqueSlot(d), slot);
    assert.ok(d.stats.length <= 2, `${d.name}: a little short of a well-crafted yellow (three or four properties)`);
    assert.equal(new Set(d.stats).size, d.stats.length);
    for (const s of d.stats) assert.ok(statFits(s, slot!), `${d.name}: ${s} on ${slot}`);
  }
  // (never the same stat twice on a card, his “I really hate seeing the same mod twice”: none of its ordinary stats is one its
  // base has built in, or reads as one)
  on(() => {
    for (const d of UNIQUE_DEFS) {
      const built = makeUnique(d.id, 12, new RNG(1))!.implicit.map((m) => statGroup(m.stat));
      const mine = d.stats.map((s) => statGroup(s));
      assert.equal(new Set(mine).size, mine.length, `${d.name}: two that read as one`);
      for (const g of mine) assert.ok(!built.includes(g), `${d.name}: ${g} is on its base already`);
    }
  });
  // “Nothing else on it”, as his doc has it
  for (const id of ['twofacedmask', 'polyglotsmantle', 'thirdword', 'headsmanshood', 'dogearedpage']) assert.deepEqual([...uniqueDef(id)!.stats], [], id);
  // “Also on them: movement speed”
  assert.deepEqual([...uniqueDef('brokenshackles')!.stats], ['moveSpeed']);
});

test('one made: orange, its own name, always the same list of stats, only the numbers rolled, each as a found affix of its level', () =>
  on(() => {
    for (const d of UNIQUE_DEFS) {
      const a = makeUnique(d.id, 12, new RNG(3))!;
      const b = makeUnique(d.id, 12, new RNG(99))!;
      assert.equal(a.rarity, 3);
      assert.equal(a.unique, d.id);
      assert.equal(a.name, d.name);
      assert.equal(a.slot, uniqueSlot(d));
      assert.equal(a.weapon, uniqueWeapon(d));
      assert.equal(a.imbues.length, 0);
      assert.equal(uniqueOf(a), d);
      for (const it of [a, b]) {
        assert.deepEqual(it.affixes.map((x) => x.mods[0].stat), [...d.stats], `${d.name}: the same list`);
        it.affixes.forEach((x, k) => {
          if (d.stats[k] === 'dmgMin') return;
          const [lo, hi] = statRangeAt(d.stats[k], 12);
          assert.ok(x.mods[0].value >= lo && x.mods[0].value <= hi, `${d.name}: ${d.stats[k]} ${x.mods[0].value} in ${lo}..${hi}`);
        });
      }
      assert.equal(a.reqLevel, d.reqLevel ?? 12);
    }
    // (the numbers do roll)
    const rolls = new Set<number>();
    for (let s = 1; s <= 30; s++) rolls.add(makeUnique('censorsseal', 15, new RNG(s))!.affixes[0].mods[0].value);
    assert.ok(rolls.size > 1);
    // (The Dog-Eared Page is made to hand down: any hero may put it on)
    assert.equal(makeUnique('dogearedpage', 20, new RNG(1))!.reqLevel, 1);
    // (the best name of its kind unlocked at the level)
    assert.equal(makeUnique('longodds', 1, new RNG(1))!.baseName, 'Iron Cap');
    assert.equal(makeUnique('longodds', 12, new RNG(1))!.baseName, 'War Helm');
  }));

test('uncraftable: no word is burned into one, and one will not split or bind', () =>
  on(() => {
    const rng = new RNG(5);
    const u = makeUnique('longodds', 12, rng)!;
    assert.equal(itemRoom(u), 0);
    assert.equal(imbueProblem(u, 'fire'), 'A unique piece takes no word');
    assert.equal(imbueItem(u, 'fire', rng), null);
    assert.equal(u.imbues.length, 0);
    assert.equal(splitProblem(u), 'A unique piece will not split');
    const other = rollItem(12, rng, { slot: 'helm', rarity: 1 });
    assert.equal(bindProblem(other, u), 'A unique piece will not bind');
    assert.equal(bindProblem(u, other), 'A unique piece will not bind');
    // (a piece with no stats of its own, “Nothing else on it”, still takes none)
    assert.equal(itemRoom(makeUnique('twofacedmask', 12, rng)!), 0);
  }));

test('a weapon unique and a hero-only piece work for their hero alone; another may wear one, for its stats (his to say)', () =>
  on(() => {
    const rng = new RNG(7);
    const bare = { mainhand: null, offhand: null, helm: null, chest: null, gloves: null, belt: null, boots: null, amulet: null, ring1: null, ring2: null };
    const pivot = makeUnique('pivot', 10, rng)!;
    assert.deepEqual(wornUniques({ ...bare, boots: pivot }, 'warrior'), ['pivot']);
    assert.deepEqual(wornUniques({ ...bare, boots: pivot }, 'mage'), []);
    const mill = makeUnique('millstone', 10, rng)!;
    assert.deepEqual(wornUniques({ ...bare, mainhand: mill }, 'warrior'), ['millstone']);
    assert.deepEqual(wornUniques({ ...bare, mainhand: mill }, 'ranger'), []);
    assert.equal(UNIQUE_RULES.othersWear, true);
    assert.equal(wearProblem(pivot, 'mage'), null);
    UNIQUE_RULES.othersWear = false;
    try {
      assert.equal(wearProblem(pivot, 'mage'), 'Warrior only');
      assert.equal(wearProblem(pivot, 'warrior'), null);
      assert.equal(wearProblem(mill, 'mage'), null, 'a weapon is not refused: any hero may hold any weapon');
    } finally {
      UNIQUE_RULES.othersWear = true;
    }
  }));

test('the pool: the ten for everyone and the hero\'s own five, never another hero\'s; its chance by what dropped, by magic find, from its floor', () =>
  on(() => {
    for (const cls of ALL_CLASS_IDS) {
      const pool = poolFor(cls);
      assert.equal(pool.length, 15, cls);
      assert.ok(pool.every((d) => !d.cls || d.cls === cls));
      assert.ok(pool.every((d) => d.from === 'pool'));
    }
    const P = UNIQUE_DROPS.pool;
    assert.equal(poolChance(0, 0, P.from), P.plain);
    assert.equal(poolChance(1, 0, 10), P.elite);
    for (const q of [2, 3, 4]) assert.equal(poolChance(q, 0, 10), P.hoard);
    assert.equal(poolChance(0, 100, 10), P.plain * 2, 'magic find multiplies it');
    assert.equal(poolChance(4, 0, P.from - 1), 0, 'none before its floor');
    assert.ok(P.plain < P.elite && P.elite < P.hoard);
    // (rarer than a rare: a rare's chance is at the least 1 in 100)
    assert.ok(P.hoard < 0.05);
    // (the stranger's: his “very low chance”, the number that was waiting for this since Version 14.5)
    assert.equal(TUNE.gambleOdds.unique, 0.005);
  }));

test('what a card says: what it does, its price, whose it is, that it cannot be crafted; “cooldown”, never “wait”', () => {
  for (const d of UNIQUE_DEFS) {
    const lines = uniqueLines(d, d.cls ?? 'warrior');
    assert.ok(lines.some((l) => l.kind === 'does' && l.text.length > 10), d.name);
    assert.equal(lines.filter((l) => l.text === 'Cannot be crafted').length, 1);
    assert.equal(lines.some((l) => l.kind === 'price'), !!d.price, d.name);
    for (const l of lines) assert.ok(!/\bwaits?\b/i.test(l.text), `${d.name}: “${l.text}”`);
  }
  assert.ok(uniqueLines(uniqueDef('brokenshackles')!, 'warrior').some((l) => l.text === 'Your swipe move has no cooldown.'));
  // (whose it is: his own reads plainly, another's as a warning)
  const pivot = uniqueDef('pivot')!;
  assert.deepEqual(uniqueLines(pivot, 'warrior').find((l) => l.text === 'Warrior only')?.kind, 'note');
  assert.deepEqual(uniqueLines(pivot, 'mage').find((l) => l.text === 'Warrior only')?.kind, 'bad');
  assert.ok(uniqueLines(uniqueDef('millstone')!, 'warrior').some((l) => l.text === "The Warrior's"));
  // (the numbers on the cards are the numbers of the rules)
  assert.ok(uniqueDef('bloodprice')!.does()[0].includes(`${Math.round(UNIQUE_TUNE.bloodprice.more * 100)}%`));
  assert.ok(uniqueDef('mothswing')!.price!().includes(`${UNIQUE_TUNE.moth.dark} seconds`));
});
