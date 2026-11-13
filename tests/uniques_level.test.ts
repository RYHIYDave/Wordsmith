// THE LEVELING UNIQUES (src/game/uniques.ts LEVEL_DEFS, behind LEVEL_UNIQUES, off) and POISON DAMAGE (src/game/items.ts
// POISON_DMG, off). His idea and his picks, 12 Nov 2026: docs/uniques/LEVELING.md.
//   run: node tools/unit.mjs --only uniques_level

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { POISON_DMG, modLines, rollItem } from '../src/game/items';
import { LEVEL_DEFS, LEVEL_UNIQUES, UNIQUE_DEFS, bendWords, levelChance, levelPoolFor, makeUnique, uniqueDef, uniqueLines, uniqueSlot, uniqueWeapon, urollOf } from '../src/game/uniques';
import type { ClassId, Item, StatKey } from '../src/game/types';
import { DT, dummy, hurt, on, ready, room, steady, strike, tap, wait, wear, words } from './uniques_helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

/** The uniques, the leveling ones and poison damage all on for the length of `f`, and back as they were. */
function both<T>(f: () => T): T {
  const was = [LEVEL_UNIQUES.on, POISON_DMG.on];
  LEVEL_UNIQUES.on = true;
  POISON_DMG.on = true;
  try {
    return on(f);
  } finally {
    [LEVEL_UNIQUES.on, POISON_DMG.on] = was;
  }
}
const CLASSES: ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
const near = (a: number, b: number, eps: number): boolean => Math.abs(a - b) <= eps;
const statsOf = (it: Item): Map<StatKey, number> => new Map(it.affixes.flatMap((a) => a.mods).map((m) => [m.stat, m.value]));

test('1. both on at his yes (“Switch them on now”); off, nothing of them is made or dropped, and no poison is rolled on gear', () => {
  assert.equal(LEVEL_UNIQUES.on, true);
  assert.equal(POISON_DMG.on, true);
  const was = [LEVEL_UNIQUES.on, POISON_DMG.on];
  LEVEL_UNIQUES.on = false;
  POISON_DMG.on = false;
  try {
    on(() => {
      assert.equal(makeUnique('errandboots', 1, new RNG(1)), null);
      assert.deepEqual(levelPoolFor('warrior', 40), []);
      assert.equal(levelChance(2, 100), 0);
    });
    const rng = new RNG(5);
    for (let k = 0; k < 3000; k++) {
      const it = rollItem(1 + (k % 30), rng);
      for (const a of it.affixes) for (const m of a.mods) assert.ok(m.stat !== 'poisonPct' && m.stat !== 'poisonRes', `${it.name}: poison rolled with the switch off`);
    }
  } finally {
    [LEVEL_UNIQUES.on, POISON_DMG.on] = was;
  }
});

test('2. the twenty, as he passed them: fifteen to level 18, five from 21 to 30; their own ids and names; each on a base there is', () => {
  assert.equal(LEVEL_DEFS.length, 20);
  assert.equal(LEVEL_DEFS.filter((d) => (d.level ?? 0) <= 20).length, 15);
  assert.deepEqual(LEVEL_DEFS.filter((d) => (d.level ?? 0) > 20).map((d) => d.level), [21, 23, 25, 27, 30]);
  const ids = new Set([...UNIQUE_DEFS, ...LEVEL_DEFS].map((d) => d.id));
  assert.equal(ids.size, 82, 'no id twice, among the 62 too');
  assert.equal(new Set([...UNIQUE_DEFS, ...LEVEL_DEFS].map((d) => d.name)).size, 82, 'no name twice');
  for (const d of LEVEL_DEFS) {
    assert.equal(d.from, 'level');
    assert.ok(uniqueSlot(d), `${d.id}: a slot`);
    assert.equal(uniqueDef(d.id), d);
    // (anyone's, unless it is a hero's weapon: his pick)
    assert.equal(!!d.cls, uniqueWeapon(d) !== null, `${d.id}: a hero's only if a weapon`);
  }
  assert.deepEqual(LEVEL_DEFS.filter((d) => d.cls).map((d) => [d.id, d.cls]), [['fledgling', 'ranger'], ['tapedknuckles', 'brawler'], ['kindlingrod', 'mage'], ['rotaxe', 'warrior'], ['hornbook', 'warlock'], ['borrowedspanner', 'tinkerer']]);
});

test('3. one made: its own level, asking for it, its numbers rolled in their ranges; nothing of its base but a weapon\'s damage', () =>
  both(() => {
    for (const d of LEVEL_DEFS) {
      for (let s = 1; s <= 30; s++) {
        const it = makeUnique(d.id, 99, new RNG(s))!;
        assert.ok(it, d.id);
        assert.equal(it.rarity, 3);
        assert.equal(it.unique, d.id);
        assert.equal(it.ilvl, d.level, `${d.id}: its level, not the floor's`);
        assert.equal(it.reqLevel, d.level);
        if (it.slot === 'mainhand') assert.ok(it.implicit.every((m) => m.stat === 'dmgMin' || m.stat === 'dmgMax') && it.implicit.length === 2, `${d.id}: its base's damage alone`);
        else assert.equal(it.implicit.length, 0, `${d.id}: nothing of its base`);
        assert.equal(it.affixes.length, (d.rolls ?? []).length);
        const got = statsOf(it);
        for (const r of d.rolls ?? []) {
          const v = got.get(r.stats[0])!;
          assert.ok(v >= Math.min(r.lo, r.hi) - 0.51 && v <= Math.max(r.lo, r.hi) + 0.51, `${d.id} ${r.stats[0]} ${v} in ${r.lo}..${r.hi}`);
          if (r.hi2 !== undefined) assert.ok(got.get(r.stats[1])! > v && got.get(r.stats[1])! <= r.hi2 + 0.51, `${d.id}: its most over its least`);
          for (const s2 of r.stats) if (r.hi2 === undefined) assert.equal(got.get(s2), v, `${d.id}: one roll for ${r.stats.join(', ')}`);
        }
        for (const [k, [lo, hi]] of Object.entries(d.specials ?? {})) assert.ok(it.uroll![k] >= lo && it.uroll![k] <= hi, `${d.id} ${k} ${it.uroll![k]}`);
      }
    }
    // (not the same every time: “we want rolls”)
    const seen = new Set(Array.from({ length: 20 }, (_, s) => statsOf(makeUnique('errandboots', 1, new RNG(s))!).get('moveSpeed')));
    assert.ok(seen.size >= 5, `the Errand Boots roll: ${[...seen].join(', ')}`);
  }));

test('4. what its card says: the four resistances as one line, a price in its stats as a minus, its rule with the number it rolled', () =>
  both(() => {
    const cap = makeUnique('lanterncap', 1, new RNG(3))!;
    const lines = cap.affixes.flatMap((a) => modLines(a.mods, 'cooldown'));
    assert.ok(lines.some((l) => /^\+\d+% All Resistances$/.test(l)), lines.join(' | '));
    assert.ok(lines.some((l) => /^-\d+% Max Life$/.test(l)), lines.join(' | '));
    const axe = makeUnique('rotaxe', 1, new RNG(3))!;
    const said = uniqueLines(uniqueDef('rotaxe')!, 'warrior', axe).map((l) => l.text).join(' | ');
    assert.ok(said.includes(`${Math.round(axe.uroll!.rot)}% of their damage`), said);
    assert.ok(axe.affixes.flatMap((a) => modLines(a.mods, 'cooldown')).some((l) => /^Adds \d+-\d+ Poison Damage to Poison Hits$/.test(l)));
    const word = makeUnique('lastword', 1, new RNG(4))!;
    const w = uniqueLines(uniqueDef('lastword')!, 'mage', word);
    assert.ok(w.some((l) => l.kind === 'price' && l.text.includes(`${Math.round(word.uroll!.cool)}% longer`)), w.map((l) => l.text).join(' | '));
  }));

test('5. where they drop: his level or below, any of them deep down (endless too); never another hero\'s weapon', () =>
  both(() => {
    for (const cls of CLASSES) {
      for (const power of [1, 5, 10, 20, 21, 30, 45]) {
        const pool = levelPoolFor(cls, power);
        assert.ok(pool.every((d) => (d.level ?? 1) <= power && (!d.cls || d.cls === cls)), `${cls} at ${power}`);
        assert.equal(pool.length, LEVEL_DEFS.filter((d) => (d.level ?? 1) <= power && (!d.cls || d.cls === cls)).length);
      }
      assert.ok(levelPoolFor(cls, 45).some((d) => d.id === 'errandboots'), 'a level 1 piece in endless');
      assert.ok(!levelPoolFor(cls, 20).some((d) => d.id === 'lastword'), 'no endgame piece on floor 20');
    }
    assert.ok(levelChance(0, 0) > 0 && near(levelChance(0, 100), levelChance(0, 0) * 2, 1e-12), 'magic find raises it');
  }));

test('6. THE SURE THING: every hit a critical one, and no harder for it', () =>
  both(() => {
    const plain = room('warrior');
    steady(plain, 100);
    const m0 = dummy(plain, 1, 0);
    tap(plain);
    const g = wear(room('warrior'), 'surething');
    steady(g, 100);
    const m = dummy(g, 1, 0);
    const ev = tap(g);
    assert.ok(hurt(m0) > 0);
    assert.equal(hurt(m), hurt(m0), 'no harder');
    assert.ok(ev.some((e) => e.t === 'hit' && !e.onHero && e.crit), 'a critical hit');
  }));

test('7. THE ROT AXE: a physical hit does no harm of its own; it poisons for its share of the hit, and its flat poison', () =>
  both(() => {
    const g = wear(room('warrior'), 'rotaxe');
    const axe = g.hero.gear.mainhand!;
    steady(g, 100);
    // (the practice room's rolled gear may carry Poison Damage, which would add to the poison: set aside, as the blow is measured)
    g.hero.d.stats.poisonPct = 0;
    const m = dummy(g, 1, 0);
    const ev = tap(g);
    assert.ok(!ev.some((e) => e.t === 'hit' && !e.onHero && !e.poison && e.amount > 0), 'no hit of its own');
    assert.ok(m.poisonT > 0 && m.poisonDps > 0, 'poisoned');
    // (what the same hit is without the axe's rule: its share, a second, over the poison's time)
    const plain = wear(room('warrior'), 'rotaxe');
    plain.worn = [];
    steady(plain, 100);
    const m2 = dummy(plain, 1, 0);
    const hit = (tap(plain).find((e) => e.t === 'hit' && !e.onHero) as { amount: number }).amount;
    const st = statsOf(axe);
    const lo = (hit * axe.uroll!.rot) / 100 / 4 + st.get('poisonMin')! / 4;
    const hi = (hit * axe.uroll!.rot) / 100 / 4 + st.get('poisonMax')! / 4;
    assert.ok(m.poisonDps >= lo - 1 && m.poisonDps <= hi + 1, `${m.poisonDps} in ${lo}..${hi}`);
    assert.ok(hurt(m2) > 0);
  }));

test('8. THE KINDLING ROD: every hit fire, no poison of a word', () =>
  both(() => {
    const g = wear(room('mage'), 'kindlingrod');
    words(g, 0, ['poison']);
    words(g, 1, ['frost']);
    assert.equal(g.hero.skills[0].r.element, 'fire');
    assert.equal(g.hero.skills[1].r.element, 'fire');
    assert.equal(g.hero.skills[0].r.poison, 0);
  }));

test('9. THE PACKSTRAP: Guarding\'s shield always on him; broken, back after its time without a blow', () =>
  both(() => {
    const g = wear(room('warrior'), 'packstrap');
    const it = g.hero.gear.belt!;
    wait(g, DT * 2);
    const size = Math.round((g.hero.d.maxLife * it.uroll!.size) / 100);
    assert.equal(g.hero.shield, size, 'his shield');
    strike(g, size * 3);
    assert.equal(g.hero.shield, 0, 'broken');
    wait(g, it.uroll!.back - 0.3);
    assert.equal(g.hero.shield, 0, 'not back yet');
    strike(g, 1);
    wait(g, it.uroll!.back - 0.3);
    assert.equal(g.hero.shield, 0, 'a blow starts its time over');
    wait(g, 0.6);
    assert.equal(g.hero.shield, size, 'back');
  }));

test('10. THE LAST WORD: every word of the tap and hold attacks stronger, every cooldown longer, as it rolled', () =>
  both(() => {
    const plain = room('mage');
    const cd = plain.hero.skills.map((s) => s.r.cooldown);
    const g = wear(room('mage'), 'lastword');
    const it = g.hero.gear.ring1!;
    g.hero.skills.forEach((s, i) => assert.ok(near(s.r.cooldown, cd[i] * (1 + it.uroll!.cool / 100), 1e-9), `ability ${i}`));
    const ctx = { worn: ['lastword'], full: false, vow: 0, dark: null, borrowed: null, lastWord: 0.5 };
    const sk = [{ front: ['fire'], behind: [] }, { front: ['frost'], behind: [] }, { front: [], behind: [] }] as never;
    assert.equal(bendWords(0, sk, ctx).boost, 1.5);
    assert.equal(bendWords(1, sk, ctx).boost, 1.5);
    assert.equal(bendWords(2, sk, ctx).boost, 1, 'not the swipe');
    assert.ok(near(urollOf(it, uniqueDef('lastword')!, 'words'), it.uroll!.words, 0));
  }));

test('11. THE LANTERN CAP: the four resistances at one roll, and its price off his life', () =>
  both(() => {
    // (the practice room's hero, his helm taken off: what he is without one)
    const plain = room('warrior');
    plain.hero.gear.helm = null;
    plain.refresh();
    const p = plain.hero.d;
    const g = wear(room('warrior'), 'lanterncap');
    const st = statsOf(g.hero.gear.helm!);
    const d = g.hero.d;
    const v = st.get('fireRes')!;
    assert.deepEqual([d.resFire - p.resFire, d.resFrost - p.resFrost, d.resLight - p.resLight, d.resPoison - p.resPoison], [v, v, v, v]);
    const life = p.maxLife;
    assert.equal(d.maxLife, Math.round(life * (1 + st.get('maxLifePct')! / 100)));
    assert.ok(d.maxLife < life);
  }));

test('12. POISON DAMAGE: on, gear rolls it; Poison Damage makes all his poison more; Poison Resistance takes off what poisons him', () =>
  both(() => {
    const rng = new RNG(9);
    let pct = 0;
    let res = 0;
    for (let k = 0; k < 3000; k++) {
      const it = rollItem(10, rng);
      for (const a of it.affixes) for (const m of a.mods) {
        if (m.stat === 'poisonPct') pct++;
        if (m.stat === 'poisonRes') res++;
      }
    }
    assert.ok(pct > 10 && res > 10, `rolled: ${pct} Poison Damage, ${res} Poison Resistance`);
    const dose = (more: number): number => {
      const g = room('ranger');
      words(g, 0, ['poison']);
      steady(g, 100);
      g.hero.d.stats.poisonPct = more;
      const m = dummy(g, 1, 0);
      ready(g);
      tap(g, 1, 0);
      return m.poisonDps;
    };
    const plain = dose(0);
    assert.ok(plain > 0);
    assert.ok(near(dose(100), plain * 2, 1e-6), 'twice as much');
    const taken = (resist: number): number => {
      const g = room('warrior');
      g.hero.d.resPoison = resist;
      g.hurtHero(100, 'phys', ['poison'], null, 'a test');
      return g.hero.poisonDps;
    };
    assert.ok(taken(0) > 0);
    assert.ok(near(taken(50), taken(0) / 2, 1e-9), 'half with half resisted');
  }));
