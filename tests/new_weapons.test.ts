// THE NEW CLASSES' WEAPONS (game/defs.ts NEW_WEAPONS, off): the Veteran's brawler's wraps, the Warlock's demonic tome, the
// Tinkerer's wrench. The owner, 3 Nov 2026, 09:43: “Get the new items and item sprites into the game as well.  New weapon
// items for the 3 new classes”; his pick at 09:46, “Grimoire and wrench (Recommended)”; of the Veteran's, in the art chat:
// “Oh and we need sprites for his weapon, hand wraps, or brawler’s wraps.  2 handed obv.” And to the art chat, 09:39: “I need
// fighters wraps, a demonic tome, and something for the tinkerer’s weapon as items”: so the Warlock's is the kind 'tome' (the
// art's key), the plainest called a Demonic Tome; it was the 'grimoire' until the art came.
//   run: tsx --test tests/new_weapons.test.ts
//
// Off: nothing changes; no hero ever finds, is sold or wins one. On: each is its own class's only: he starts with it, it
// drops for him alone (as often as each other kind of weapon), his vendor stocks it for him alone, the stranger offers it
// to him alone; the wraps take two hands and nothing in the other, the tome a focus, the wrench a shield; a piece of
// any of them is saved and loads back as itself; a saved piece of the old 'grimoire' loads as the tome.

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { CLASSES, CLASS_WEAPON, GAMBLE_KINDS, NEW_WEAPONS, OWN_MOVES, TUNE, VENDORS, VENDOR_IDS, WEAPON_ATTR, WEAPON_SKILLS, classWeapon, gambleKinds, vendorStock } from '../src/game/defs';
import { Game } from '../src/game/game';
import { CLASS_BASES, ITEM_BASES, canPair, imbueItem, kindName, migrateItem, plainWeapon, rollItem, starterWeapon } from '../src/game/items';
import type { RollOpts } from '../src/game/items';
import { makeIconArt } from '../src/art/icons';
import { P } from '../src/art/palette';
import { paintWithoutCanvas, paintingOf } from './helpers';
import { ALL_CLASS_IDS, ALL_WEAPONS, CLASS_IDS, CLASS_WEAPONS, ICON_KEYS, SLOTS, WEAPONS, WARRIOR_WEAPONS } from '../src/game/types';
import type { ClassId, ClassWeaponKind, Item, Slot, WeaponKind } from '../src/game/types';
import { warriorAsBefore } from './warrior_as_before';

// (the Warrior's old moves, as this file was written for them: tests/warrior_as_before.ts)
warriorAsBefore();

paintWithoutCanvas();

/** The brief: each new class's own, and what its numbers are. */
const OWN: Record<ClassWeaponKind, { cls: ClassId; like: WeaponKind; hands: 1 | 2; attr: 'str' | 'dex' | 'int'; name: string; vendor: 'armourer' | 'mystic' }> = {
  wraps: { cls: 'brawler', like: 'greatsword', hands: 2, attr: 'str', name: "Brawler's Wraps", vendor: 'armourer' },
  tome: { cls: 'warlock', like: 'wand', hands: 1, attr: 'int', name: 'Demonic Tome', vendor: 'mystic' },
  wrench: { cls: 'tinkerer', like: 'sword', hands: 1, attr: 'dex', name: 'Wrench', vendor: 'armourer' },
};
/** What each class started with before the new weapons, and still does with the switch off. */
const STARTS: Record<ClassId, WeaponKind> = { warrior: 'greatsword', ranger: 'bow', mage: 'staff', warlock: 'wand', tinkerer: 'wand', brawler: 'sword' };
const isNew = (k: WeaponKind | null | undefined): boolean => !!k && (CLASS_WEAPONS as readonly WeaponKind[]).includes(k);

function withNew<T>(on: boolean, run: () => T): T {
  const was = NEW_WEAPONS.on;
  NEW_WEAPONS.on = on;
  try {
    return run();
  } finally {
    NEW_WEAPONS.on = was;
  }
}

function bare(it: Item | null | undefined): unknown {
  if (!it) return it;
  const { uid: _uid, ...rest } = it;
  return rest;
}

/** Every option a roll is made with somewhere in the game (drops, shops, the gamble, the test heroes). */
function rollCases(): RollOpts[] {
  const out: RollOpts[] = [{}];
  for (const slot of [...SLOTS, undefined] as (Slot | undefined)[]) {
    for (const forWeapon of [...WEAPONS, null]) out.push({ slot, forWeapon, magicFind: 40 });
  }
  for (const id of VENDOR_IDS) for (const slot of VENDORS[id].slots) out.push({ slot, weapons: VENDORS[id].weapons, luck: TUNE.shopLuck, forWeapon: 'sword' });
  for (const k of GAMBLE_KINDS) out.push({ slot: k.slot, rarity: 1, weapons: k.weapon ? [k.weapon] : undefined });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Off

test('the switch is off, and off nothing is anyone\'s own', () => {
  assert.equal(NEW_WEAPONS.on, true, 'ON at his yes of 3 Nov 2026; off for this test');
  NEW_WEAPONS.on = false;
  try {
  for (const cls of ALL_CLASS_IDS) {
    assert.equal(classWeapon(cls), null, cls);
    assert.equal(CLASSES[cls].starts, STARTS[cls], `${cls} starts with what he always has`);
    assert.equal(starterWeapon(cls).weapon, STARTS[cls], cls);
    assert.equal(new Game(cls, 7).hero.gear.mainhand!.weapon, STARTS[cls], cls);
    assert.equal(gambleKinds(cls), GAMBLE_KINDS, `${cls}: the stranger's offer is GAMBLE_KINDS itself`);
    for (const id of VENDOR_IDS) assert.equal(vendorStock(id, cls), VENDORS[id], `${cls}: the ${id}'s stock is VENDORS's itself`);
  }
  // what any hero may find is the five weapons' bases and the rest, as before; the new ones are apart
  assert.ok(ITEM_BASES.every((b) => !isNew(b.weapon)), 'ITEM_BASES holds none of them');
  // (and the Warrior's battle axe and warhammer, his own by his tree, WARRIOR_TREE2: found by none, his greatswords made them)
  assert.deepEqual([...new Set(CLASS_BASES.map((b) => b.weapon))], [...CLASS_WEAPONS, ...WARRIOR_WEAPONS]);
  assert.deepEqual([...WEAPONS], ['sword', 'greatsword', 'bow', 'wand', 'staff'], 'the five any hero may find');
  } finally {
    NEW_WEAPONS.on = true;
  }
});

test('off: a roll for a hero of any class is the very roll it was, and never one of the new kinds', () => {
  NEW_WEAPONS.on = false;
  try {
  for (const cls of ALL_CLASS_IDS) {
    for (const opts of rollCases()) {
      for (let seed = 1; seed <= 12; seed++) {
        for (const ilvl of [1, 6, 14]) {
          const was = rollItem(ilvl, new RNG(seed * 7919 + ilvl), opts);
          const now = rollItem(ilvl, new RNG(seed * 7919 + ilvl), { ...opts, cls });
          assert.deepEqual(bare(now), bare(was), `${cls}, ${JSON.stringify(opts)}, seed ${seed}, ilvl ${ilvl}`);
          assert.ok(!isNew(now.weapon), `${cls}: ${now.name}`);
        }
      }
    }
  }
  } finally {
    NEW_WEAPONS.on = true;
  }
});

test('off: no new kind ever drops, is stocked, or is won at the stranger\'s', () => {
  NEW_WEAPONS.on = false;
  try {
  for (const cls of ALL_CLASS_IDS) {
    const g = new Game(cls, 11);
    const drop = (g as unknown as { rollGear(q: number): Item }).rollGear.bind(g);
    for (let k = 0; k < 600; k++) assert.ok(!isNew(drop(k % 5).weapon), `${cls}: a drop`);
    for (const depth of [1, 5, 9]) {
      g.depth = depth;
      g.cleared = depth - 1;
      g.rollShop();
      for (const id of VENDOR_IDS) {
        assert.equal(g.shops[id].length, TUNE.shopSize);
        for (const it of g.shops[id]) assert.ok(!isNew(it?.weapon), `${cls}, the ${id}: ${it?.name}`);
      }
    }
    assert.equal(g.gambleKinds(), GAMBLE_KINDS);
    for (let k = 0; k < GAMBLE_KINDS.length; k++) {
      g.hero.gold = 1e6;
      g.hero.bag = g.hero.bag.map(() => null);
      assert.equal(g.gamble(k), null);
      assert.ok(!isNew(g.hero.bag[g.won]!.weapon), `${cls}: a throw for ${GAMBLE_KINDS[k].name}`);
    }
  }
  } finally {
    NEW_WEAPONS.on = true;
  }
});

// ---------------------------------------------------------------------------------------------
// On

test('on: each new class has its own weapon, and starts with it; the first three as ever', () => {
  withNew(true, () => {
    for (const [kind, o] of Object.entries(OWN) as [ClassWeaponKind, (typeof OWN)[ClassWeaponKind]][]) {
      assert.equal(CLASS_WEAPON[o.cls], kind);
      assert.equal(classWeapon(o.cls), kind);
      assert.equal(CLASSES[o.cls].starts, kind, `${o.cls} starts with his ${kind}`);
      const g = new Game(o.cls, 5);
      const it = g.hero.gear.mainhand!;
      assert.equal(it.weapon, kind);
      assert.equal(it.icon, kind);
      assert.equal(it.rarity, 0);
      assert.equal(kindName(it), o.name);
      assert.equal(g.hero.gear.offhand, null);
      // and his practice room and his test hero hold it too
      assert.equal(Game.forPractice(o.cls, 3).hero.gear.mainhand!.weapon, kind, `${o.cls}: practice`);
      assert.equal(Game.forTrial(o.cls, 1003, 3).hero.gear.mainhand!.weapon, kind, `${o.cls}: a test hero on floor 3`);
    }
    for (const cls of CLASS_IDS) {
      assert.equal(classWeapon(cls), null, cls);
      assert.equal(CLASSES[cls].starts, STARTS[cls], cls);
    }
    // the Veteran's first one is called as he called it, and so is the Warlock's
    assert.equal(plainWeapon('wraps').name, "Brawler's Wraps");
    assert.equal(plainWeapon('tome').name, 'Demonic Tome');
  });
});

test('the Warlock\'s is the demonic tome: its kind the art\'s key, its names in the vein of the others, no grimoire left', () => {
  assert.deepEqual([...CLASS_WEAPONS], ['wraps', 'tome', 'wrench']);
  assert.ok(!(CLASS_WEAPONS as readonly string[]).includes('grimoire'));
  assert.ok(!(ICON_KEYS as readonly string[]).includes('grimoire'), 'no picture key for the grimoire');
  assert.ok(ICON_KEYS.includes('tome'));
  assert.equal(CLASS_WEAPON.warlock, 'tome');
  assert.deepEqual(CLASS_BASES.filter((b) => b.weapon === 'tome').map((b) => [b.id, b.name, b.icon]), [
    ['tome1', 'Demonic Tome', 'tome'],
    ['tome2', 'Chained Tome', 'tome'],
    ['tome3', 'Pact Tome', 'tome'],
  ]);
  assert.ok([...ITEM_BASES, ...CLASS_BASES].every((b) => !/grimoire/i.test(b.name) && !/grimoire/i.test(b.id)), 'no base of the old name');
  assert.equal(kindName(plainWeapon('tome')), 'Demonic Tome', 'over a tome on the floor, and at the stranger\'s');
  // what a Warlock with a sword in hand is told of a focus
  withNew(true, () => {
    const w = new Game('warlock', 3);
    w.hero.bag = w.hero.bag.map(() => null);
    w.hero.gear.mainhand = plainWeapon('sword');
    w.hero.gear.offhand = null;
    let focus: Item | null = null;
    const rng = new RNG(5);
    while (!focus) {
      const it = rollItem(1, rng, { slot: 'offhand', weapons: ['wand'] });
      if (it.offhand === 'focus') focus = it;
    }
    w.hero.bag[0] = focus;
    assert.equal(w.equipFromBag(0), 'Needs a wand or a demonic tome');
  });
});

test('a saved piece of the old grimoire loads as the demonic tome of the same name tier, keeping all the rest', () => {
  /** A tome made to look as a grimoire of that tier was saved. */
  const asGrimoire = (it: Item, tier: number): Item => {
    const was = ['Chained Grimoire', 'Black Grimoire', 'Pact Grimoire'][tier];
    const out = JSON.parse(JSON.stringify(it)) as Record<string, unknown>;
    out.name = it.name.replace(it.baseName, was);
    out.baseName = was;
    out.baseId = `grimoire${tier + 1}`;
    out.weapon = 'grimoire';
    out.icon = 'grimoire';
    return out as unknown as Item;
  };
  const rng = new RNG(77);
  for (let tier = 0; tier < 3; tier++) {
    const base = CLASS_BASES.find((b) => b.id === `tome${tier + 1}`)!;
    // a magic one with a word burned in, of this tier
    let it: Item | null = null;
    for (let k = 0; k < 4000 && !it; k++) {
      const r = withNew(true, () => rollItem([3, 8, 14][tier], rng, { slot: 'mainhand', rarity: 1, cls: 'warlock' }));
      if (r.baseId === base.id && r.name.includes(r.baseName)) it = r;
    }
    assert.ok(it, `a ${base.name} to save`);
    assert.ok(imbueItem(it!, 'fire', rng));
    const old = asGrimoire(it!, tier);
    assert.ok(old.name.includes('Grimoire'), old.name);
    const back = migrateItem(JSON.parse(JSON.stringify(old)) as Item);
    assert.deepEqual(bare(back), bare(it), `${old.name} loads as ${it!.name}`);
    assert.equal(back.weapon, 'tome');
    assert.equal(back.icon, 'tome');
    assert.equal(back.baseId, base.id);
    // and through a save, the switch off as it would be
    const g = new Game('warlock', 13);
    g.hero.bag[0] = old;
    const run = JSON.parse(JSON.stringify(g.save()));
    const loaded = Game.restore(run).hero.bag[0]!;
    assert.deepEqual(bare(loaded), bare(it), `${old.name}, saved and loaded`);
  }
  // one already up to date comes back as it was
  const tome = plainWeapon('tome', 3);
  assert.deepEqual(bare(migrateItem(JSON.parse(JSON.stringify(tome)) as Item)), bare(tome));
});

test('on: its numbers are another weapon\'s, all of them; and nothing breaks with OWN_MOVES off', () => {
  for (const [kind, o] of Object.entries(OWN) as [ClassWeaponKind, (typeof OWN)[ClassWeaponKind]][]) {
    const mine = CLASS_BASES.filter((b) => b.weapon === kind);
    const like = ITEM_BASES.filter((b) => b.weapon === o.like);
    assert.equal(mine.length, 3, `${kind}: three names`);
    mine.forEach((b, t) => {
      assert.equal(b.id, `${kind}${t + 1}`);
      assert.equal(b.icon, kind);
      assert.equal(b.slot, 'mainhand');
      assert.equal(b.hands, o.hands, kind);
      assert.equal(b.hands, like[t].hands);
      assert.equal(b.aps, like[t].aps);
      assert.equal(b.minIlvl, like[t].minIlvl);
      for (const ilvl of [1, 5, 10, 20]) assert.deepEqual(b.implicit(ilvl), like[t].implicit(ilvl), `${b.name} as ${like[t].name} at ilvl ${ilvl}`);
    });
    assert.deepEqual(WEAPON_SKILLS[kind], WEAPON_SKILLS[o.like], kind);
    assert.equal(WEAPON_ATTR[kind], o.attr, kind);
  }
  // no name of a base is another's
  const names = [...ITEM_BASES, ...CLASS_BASES].map((b) => b.name);
  assert.equal(new Set(names).size, names.length);
  // with OWN_MOVES off, a hero holding one has the attacks of the weapon it is like
  const was = OWN_MOVES.on;
  OWN_MOVES.on = false;
  try {
    withNew(true, () => {
      for (const [kind, o] of Object.entries(OWN) as [ClassWeaponKind, (typeof OWN)[ClassWeaponKind]][]) {
        const g = new Game('warrior', 4);
        g.hero.bag[0] = plainWeapon(kind);
        assert.equal(g.equipFromBag(0), null);
        assert.deepEqual(g.hero.skills.slice(0, 2).map((s) => s.id), [...WEAPON_SKILLS[o.like]], kind);
        assert.ok(g.hero.skills.every((s) => s.r && Number.isFinite(s.r.dmgMult) && Number.isFinite(s.r.rate)), `${kind}: its attacks are worked out`);
      }
    });
  } finally {
    OWN_MOVES.on = was;
  }
});

test('on: each drops only for a hero of its class, about as often as each other kind of weapon does for him', () => {
  withNew(true, () => {
    for (const cls of ALL_CLASS_IDS) {
      const own = classWeapon(cls);
      const count = new Map<WeaponKind, number>();
      const rng = new RNG(4242);
      const N = 6000;
      for (let k = 0; k < N; k++) {
        const it = rollItem(1 + (k % 15), rng, { slot: 'mainhand', cls });
        count.set(it.weapon!, (count.get(it.weapon!) ?? 0) + 1);
      }
      for (const kind of CLASS_WEAPONS) if (kind !== own) assert.equal(count.get(kind) ?? 0, 0, `${cls} never finds a ${kind}`);
      const kinds = own ? [...WEAPONS, own] : [...WEAPONS];
      assert.deepEqual([...count.keys()].sort(), [...kinds].sort(), `${cls}: the kinds he finds`);
      for (const kind of kinds) {
        const share = (count.get(kind) ?? 0) / N;
        assert.ok(Math.abs(share - 1 / kinds.length) < 0.025, `${cls}: ${kind} is ${(share * 100).toFixed(1)}% of his weapons, about 1 in ${kinds.length}`);
      }
      // and as the game drops them, a weapon in his hand or none
      const g = new Game(cls, 21);
      const drop = (g as unknown as { rollGear(q: number): Item }).rollGear.bind(g);
      let mine = 0;
      for (let k = 0; k < 1500; k++) {
        const it = drop(k % 5);
        if (isNew(it.weapon)) {
          assert.equal(it.weapon, own, `${cls}: only his own`);
          mine++;
        }
      }
      if (own) assert.ok(mine > 0, `${cls}: his own does drop`);
    }
  });
});

test('on: the wraps take both hands and leave the off hand empty; the tome takes a focus, the wrench a shield', () => {
  withNew(true, () => {
    const offs = (g: Game): Record<'shield' | 'quiver' | 'focus', Item> => {
      const find = (weapons: WeaponKind[]): Item => {
        const rng = new RNG(9);
        for (;;) {
          const it = rollItem(1, rng, { slot: 'offhand', weapons, cls: g.hero.cls });
          if (it.offhand) return it;
        }
      };
      return { shield: find(['sword']), quiver: find(['bow']), focus: find(['wand']) };
    };
    // the Veteran: a sword and shield in hand; the wraps on, the shield back in the bag; and no off-hand piece will go on
    const v = new Game('brawler', 3);
    const vo = offs(v);
    v.hero.gear.mainhand = plainWeapon('sword');
    v.hero.gear.offhand = vo.shield;
    v.hero.bag = v.hero.bag.map(() => null);
    v.hero.bag[0] = plainWeapon('wraps');
    assert.equal(v.equipFromBag(0), null);
    assert.equal(v.hero.gear.mainhand!.weapon, 'wraps');
    assert.equal(v.hero.gear.mainhand!.hands, 2);
    assert.equal(v.hero.gear.offhand, null, 'the off hand is empty');
    assert.ok(v.hero.bag.includes(vo.shield), 'the shield went back to the bag');
    for (const [kind, off] of Object.entries(vo)) {
      assert.equal(canPair(v.hero.gear.mainhand, off), false, `wraps and a ${kind}`);
      v.hero.bag = v.hero.bag.map(() => null);
      v.hero.bag[0] = off;
      assert.ok(v.equipFromBag(0), `a ${kind} is refused`);
      assert.equal(v.hero.gear.offhand, null);
      assert.equal(v.hero.bag[0], off);
    }
    // the Warlock: a focus beside his demonic tome, nothing else
    const w = new Game('warlock', 3);
    const wo = offs(w);
    assert.equal(w.hero.gear.mainhand!.weapon, 'tome');
    assert.equal(w.hero.gear.mainhand!.hands, 1);
    assert.deepEqual(Object.entries(wo).filter(([, o]) => canPair(w.hero.gear.mainhand, o)).map(([k]) => k), ['focus']);
    w.hero.bag[0] = wo.shield;
    assert.equal(w.equipFromBag(0), 'Needs a one-handed sword');
    w.hero.bag[0] = wo.focus;
    assert.equal(w.equipFromBag(0), null);
    assert.equal(w.hero.gear.offhand, wo.focus);
    // the Tinkerer: a shield beside her wrench, nothing else
    const t = new Game('tinkerer', 3);
    const to = offs(t);
    assert.equal(t.hero.gear.mainhand!.weapon, 'wrench');
    assert.equal(t.hero.gear.mainhand!.hands, 1);
    assert.deepEqual(Object.entries(to).filter(([, o]) => canPair(t.hero.gear.mainhand, o)).map(([k]) => k), ['shield']);
    t.hero.bag[0] = to.focus;
    assert.equal(t.equipFromBag(0), 'Needs a wand');
    t.hero.bag[0] = to.shield;
    assert.equal(t.equipFromBag(0), null);
    assert.equal(t.hero.gear.offhand, to.shield);
  });
});

test('on: his vendor stocks his own for him alone, the shelf as long as ever; the stranger offers it to him alone', () => {
  withNew(true, () => {
    for (const cls of ALL_CLASS_IDS) {
      const own = classWeapon(cls);
      for (const seed of [3, 17]) {
        for (const depth of [1, 6]) {
          const g = new Game(cls, seed);
          g.depth = depth;
          g.cleared = depth - 1;
          g.rollShop();
          for (const id of VENDOR_IDS) {
            const v = VENDORS[id];
            const stock = g.shops[id];
            const where = `${cls}, the ${id}, seed ${seed}, floor ${depth}`;
            assert.equal(stock.length, TUNE.shopSize, `${where}: a shelf of ${TUNE.shopSize}`);
            v.weapons.forEach((kind, i) => assert.equal(stock[i]!.weapon, kind, `${where}: its plain ${kind}`));
            const his = !!own && OWN[own].vendor === id;
            if (his) {
              const it = stock[v.weapons.length]!;
              assert.equal(it.weapon, own, `${where}: his plain ${own}, after the vendor's own`);
              assert.equal(it.rarity, 0);
              assert.equal(it.ilvl, depth);
            }
            for (const it of stock) if (isNew(it?.weapon)) assert.ok(his && it!.weapon === own, `${where}: ${it!.name}`);
          }
        }
      }
      const kinds = gambleKinds(cls);
      if (!own) {
        assert.equal(kinds, GAMBLE_KINDS, cls);
        continue;
      }
      assert.equal(kinds.length, GAMBLE_KINDS.length + 1);
      const at = kinds.findIndex((k) => k.weapon === own);
      assert.equal(at, WEAPONS.length, `${cls}: his own after the five`);
      assert.equal(kinds[at].name, OWN[own].name);
      assert.equal(kinds[at].icon, own);
      assert.deepEqual(kinds.filter((_, i) => i !== at), [...GAMBLE_KINDS], `${cls}: the rest as they are`);
      const g = new Game(cls, 8);
      assert.deepEqual(g.gambleKinds(), kinds);
      for (let k = 0; k < 20; k++) {
        g.hero.gold = 1e6;
        g.hero.bag = g.hero.bag.map(() => null);
        assert.equal(g.gamble(at), null);
        assert.equal(g.hero.bag[g.won]!.weapon, own, `${cls}: a throw for his own`);
      }
      assert.ok(g.gamblePrice(at) > 0);
    }
    // the first three: the stranger's offer as ever, and no throw ever a new kind
    for (const cls of CLASS_IDS) {
      const g = new Game(cls, 8);
      for (let k = 0; k < GAMBLE_KINDS.length; k++) {
        g.hero.gold = 1e6;
        g.hero.bag = g.hero.bag.map(() => null);
        assert.equal(g.gamble(k), null);
        assert.ok(!isNew(g.hero.bag[g.won]!.weapon), cls);
      }
    }
  });
});

test('on and off: a piece of any new kind is saved and loads back as itself', () => {
  for (const loadOn of [true, false]) {
    withNew(true, () => {
      const g = new Game('brawler', 13);
      const pieces: Item[] = [];
      for (const kind of CLASS_WEAPONS) {
        // a magic one with a word in it, and a plain one
        const rng = new RNG(31);
        let it: Item | null = null;
        for (let k = 0; k < 400 && !it; k++) {
          const r = rollItem(8, rng, { slot: 'mainhand', rarity: 1, cls: OWN[kind].cls });
          if (r.weapon === kind) it = r;
        }
        assert.ok(it, kind);
        assert.ok(imbueItem(it!, 'fire', rng), `${kind}: a word burned in`);
        pieces.push(it!, plainWeapon(kind, 4));
      }
      g.hero.gear.mainhand = pieces[0];
      pieces.slice(1).forEach((it, i) => (g.hero.bag[i] = it));
      const run = JSON.parse(JSON.stringify(g.save()));
      const back = withNew(loadOn, () => Game.restore(run));
      const was = [g.hero.gear.mainhand, ...g.hero.bag.slice(0, pieces.length - 1)];
      const now = [back.hero.gear.mainhand, ...back.hero.bag.slice(0, pieces.length - 1)];
      assert.deepEqual(now.map(bare), was.map(bare), `loaded with the switch ${loadOn ? 'on' : 'off'}`);
      for (const it of now) assert.ok(isNew(it!.weapon) && it!.icon === it!.weapon, it!.name);
      assert.equal(kindName(now[0]!), "Brawler's Wraps");
    });
  }
});

test('their pictures with ITEMS_A off: a stand-in for each, in today\'s size, and nothing pink or gold on them (on: the art\'s, tests/items_a_game.test.ts)', () => {
  const art = makeIconArt();
  for (const kind of CLASS_WEAPONS) {
    assert.ok(ICON_KEYS.includes(kind), kind);
    const s = art.item[kind];
    assert.ok(s, kind);
    assert.equal(s.w, 16);
    assert.equal(s.h, 16);
    assert.equal(s.ax, 8);
    assert.equal(s.ay, 8);
    const p = paintingOf(s);
    // linen, steel, dark stone and the ink outline: no gold, no pink, nothing glowing
    const allowed = new Set([P.ink, P.bn2, P.bn3, P.bn4, P.st1, P.st2, P.st3, P.st5, P.sl1, P.sl2, P.sl3, P.sl4, P.sl5].map((c) => c.toLowerCase()));
    let painted = 0;
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const c = p.get(x, y);
        if (c === null) continue;
        painted++;
        assert.ok(allowed.has(c.toLowerCase()), `${kind} (${x}, ${y}) is ${c}`);
      }
    }
    assert.ok(painted > 60, `${kind}: big enough to read (${painted} pixels)`);
  }
  // every kind of weapon there is has a picture and a name
  for (const kind of ALL_WEAPONS) {
    assert.ok(art.item[kind], kind);
    assert.ok(kindName(plainWeapon(kind)).length > 0, kind);
  }
});
