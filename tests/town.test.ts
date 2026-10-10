// The town's services: gate (words on a dungeon), wordsmith (words on gear), the two vendors
// (Version 14.4: the armourer and the mystic), Lexicon, stash, and what survives a character's
// death.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { TUNE, VENDORS, VENDOR_IDS } from '../src/game/defs';
import { Game, cleanMeta, newMeta } from '../src/game/game';
import { seasoned } from './helpers';
import { itemValue, rollItem } from '../src/game/items';
import { TOWN } from '../src/game/level';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Station } from '../src/game/state';
import { CLASS_IDS, EQUIP_SLOTS, WORD_IDS } from '../src/game/types';
import { WAYS, topStep } from '../src/game/ways';

/** THE WAYS (game/ways.ts, on since Version 20.2), set for the length of `run` and put back. */
function waysSet<T>(on: boolean, run: () => T): T {
  const was = WAYS.on;
  WAYS.on = on;
  try {
    return run();
  } finally {
    WAYS.on = was;
  }
}

// (the stranger's is the gamble: his once the trades are open)
const STATIONS: Station[] = TUNE.tradesOpen ? ['gate', 'lexicon', 'wordsmith', 'armourer', 'mystic', 'stash', 'stranger'] : ['gate', 'lexicon', 'wordsmith', 'armourer', 'mystic', 'stash'];

/** Stand the hero next to a station. */
function goTo(g: Game, kind: Station): void {
  const s = g.level.stations.find((st) => st.kind === kind)!;
  assert.ok(s, `the town has a ${kind}`);
  const f = g.level.floor;
  const dist = flowField(g.level.walk, f.w, f.h, Math.floor(g.hero.x), Math.floor(g.hero.y));
  // the nearest walkable tile within reach of the station that the hero can actually walk to
  let best: { x: number; y: number } | null = null;
  let bd = Infinity;
  for (let ty = 0; ty < f.h; ty++) {
    for (let tx = 0; tx < f.w; tx++) {
      if (g.level.walk[ty * f.w + tx] !== 1 || dist[ty * f.w + tx] === UNREACHABLE) continue;
      const d = Math.hypot(tx + 0.5 - s.x, ty + 0.5 - s.y);
      if (d < bd) {
        bd = d;
        best = { x: tx + 0.5, y: ty + 0.5 };
      }
    }
  }
  assert.ok(best && bd < TUNE.useRange, `${kind} can be reached on foot (nearest standing place is ${bd.toFixed(2)} away)`);
  const at = best as { x: number; y: number };
  g.hero.x = at.x;
  g.hero.y = at.y;
}

test('the town has every service, each reachable on foot, and none overlap (the gate, while the ways are on, is walked through: no service of its own)', () => {
  for (const ways of [true, false]) waysSet(ways, () => {
    const g = new Game('warrior', 5);
    assert.ok(g.level.town);
    assert.deepEqual(g.level.stations.map((s) => s.kind).sort(), [...STATIONS].sort());
    for (const kind of STATIONS) {
      goTo(g, kind);
      if (kind === 'gate' && ways) {
        assert.notEqual(g.stationNear(), 'gate', 'standing by the gate offers no service while the ways are on (game/ways.ts)');
        continue;
      }
      assert.equal(g.stationNear(), kind, `standing by the ${kind} offers the ${kind}`);
      assert.ok(g.interactHint(), 'and there is a prompt for it');
    }
    // from the arrival point nothing is in reach, so no prompt covers the first view of the town
    g.hero.x = TOWN.start.x;
    g.hero.y = TOWN.start.y;
    assert.equal(g.stationNear(), null);
    // stations are far enough apart that the prompt is never ambiguous
    const st = g.level.stations;
    for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) {
      assert.ok(Math.hypot(st[i].x - st[j].x, st[i].y - st[j].y) > TUNE.useRange * 2, `${st[i].kind} and ${st[j].kind} are well apart`);
    }
  });
});

test('pressing interact in town asks for the service; it does not enter the dungeon by itself (the gate as a service: the ways off)', () => {
  const g = waysSet(false, () => new Game('mage', 5));
  goTo(g, 'gate');
  const c = emptyControls();
  c.interact = true;
  g.update(1 / 60, c);
  assert.ok(g.level.town, 'still in town');
  assert.ok(g.events.some((e) => e.t === 'station' && e.kind === 'gate'));
});

test('gate: up to three words, no repeats, one element; burned on entering; monsters have their powers', () => {
  const g = new Game('ranger', 9);
  // (the second dungeon: THE FIRST LEVELS leave the first without a word on any monster, burned in or not)
  g.depth = 2;
  g.cleared = 1;
  const h = g.hero;
  for (const w of WORD_IDS) h.words[w] = 2;
  assert.equal(g.planWord('fire'), null);
  assert.notEqual(g.planWord('fire'), null, 'the same word twice is refused');
  assert.notEqual(g.planWord('frost'), null, 'a second element is refused');
  assert.equal(g.planWord('swift'), null);
  assert.equal(g.planWord('power'), null);
  assert.notEqual(g.planWord('twin'), null, 'a fourth word is refused');
  assert.deepEqual(g.plan, ['fire', 'swift', 'power']);
  assert.equal(h.words.fire, 1);
  // changing your mind is free
  g.unplanWord(1);
  assert.deepEqual(g.plan, ['fire', 'power']);
  assert.equal(h.words.swift, 2);
  g.enterDungeon();
  assert.deepEqual(g.dungeonWords, ['fire', 'power']);
  assert.deepEqual(g.plan, [], 'the plan is used up');
  assert.equal(h.words.fire, 1, 'and the words are gone for good');
  assert.ok(g.monsters.length > 20);
  for (const m of g.monsters) assert.ok(m.words.includes('fire') && m.words.includes('power'), `${m.name} carries the dungeon's words`);
  // an ordinary dungeon's ordinary monsters carry none (MONSTER PACKS, since Version 19.7: those of
  // a plain pack; a blue pack's have its word, a yellow pack's minions their leader's)
  const plain = new Game('ranger', 9);
  plain.depth = 2;
  plain.cleared = 1;
  plain.enterDungeon();
  assert.ok(plain.monsters.filter((m) => !m.elite && !m.boss && !m.rarity).every((m) => m.words.length === 0));
  assert.ok(plain.monsters.filter((m) => !m.elite && !m.boss && !m.rarity).length > 20, 'and most are of plain packs');
  // the words make its monsters tougher
  const tough = g.monsters.filter((m) => m.kind === 'skeleton' && !m.elite && !m.rarity)[0];
  const weak = plain.monsters.filter((m) => m.kind === 'skeleton' && !m.elite && !m.rarity)[0];
  if (tough && weak) assert.ok(tough.maxLife > weak.maxLife, 'Power adds life');
});

test('burning a word into gear uses it up; what it becomes is rolled from the outcomes shown, and worn gear changes at once', () => {
  // The owner: "i dont want it to say exactly what would happen, but maybe show the range of outcomes on gear".
  for (const cls of CLASS_IDS) {
    const became = new Set<string>();
    for (let seed = 1; seed <= 24; seed++) {
      // (THE FIRST LEVELS, since Version 19.5: words are burned into gear once the wordsmith's ring is lit)
      const g = seasoned(new Game(cls, seed), 1);
      const h = g.hero;
      const rng = new RNG(77);
      h.gear.gloves = rollItem(3, rng, { slot: 'gloves', rarity: 1 });
      g.refresh();
      h.words.power = 2;
      const choices = g.imbueChoices({ kind: 'gear', slot: 'gloves' }, 'power');
      assert.equal(choices.length, 2, 'Power on gloves has two possible outcomes, and both are shown');
      assert.deepEqual(choices.map((c) => c.stat).sort(), ['physPct', 'str']);
      const str0 = h.d.str;
      g.events.length = 0;
      assert.equal(g.imbue({ kind: 'gear', slot: 'gloves' }, 'power'), null);
      assert.equal(h.words.power, 1, 'the word is used up');
      assert.equal(h.gear.gloves.imbues.length, 1);
      const im = h.gear.gloves.imbues[0];
      assert.ok(im && im.word === 'power');
      const made = choices.find((c) => c.stat === im.mods[0].stat)!;
      assert.ok(made, 'it became one of the outcomes that were shown');
      assert.ok(im.mods[0].value >= made.min && im.mods[0].value <= made.max, 'within the range that was shown');
      became.add(im.mods[0].stat);
      if (im.mods[0].stat === 'str') assert.equal(h.d.str, str0 + im.mods[0].value, 'the hero is stronger straight away');
      assert.ok(g.events.some((e) => e.t === 'burned' && e.word === 'power' && e.text.length > 0), 'and the player is told what it became');
      // a second word is added to the first (Version 13.2: "All items have room for 4 mods"; until then it took its place)
      const strNow = h.d.str;
      h.words.fire = 1;
      assert.equal(g.imbue({ kind: 'gear', slot: 'gloves' }, 'fire'), null);
      assert.deepEqual(h.gear.gloves.imbues.map((x) => x.word), ['power', 'fire']);
      assert.equal(h.gear.gloves.imbues[0], im, 'the first word is as it was');
      assert.equal(h.d.str, strNow, 'and its bonus is still there');
      assert.notEqual(g.imbue({ kind: 'gear', slot: 'gloves' }, 'fire'), null, 'no word left to burn');
      // blue gloves came with one property or two: with two words on them they hold three or four
      const room = 4 - h.gear.gloves.affixes.length - 2;
      // a word the piece has no room for, or nothing new from, is refused and is NOT used up
      h.words.leech = 3;
      let burned = 0;
      for (let k = 0; k < 3; k++) if (g.imbue({ kind: 'gear', slot: 'gloves' }, 'leech') === null) burned++;
      assert.ok(burned <= Math.min(room, 2), `room for ${room}; Leech has two outcomes; ${burned} burned`);
      assert.equal(h.words.leech, 3 - burned, 'a refused word stays in the pouch');
      assert.ok(h.gear.gloves.affixes.length + h.gear.gloves.imbues.length <= 4);
      if (h.gear.gloves.affixes.length + h.gear.gloves.imbues.length === 4) {
        h.words.twin = 1;
        assert.equal(g.imbueProblem({ kind: 'gear', slot: 'gloves' }, 'twin'), 'That piece is full');
        assert.equal(g.imbue({ kind: 'gear', slot: 'gloves' }, 'twin'), 'That piece is full');
        assert.equal(h.words.twin, 1);
        assert.deepEqual(g.imbueChoices({ kind: 'gear', slot: 'gloves' }, 'twin'), []);
      }
    }
    assert.equal(became.size, 2, `${cls}: over 24 tries both outcomes turned up: which one is luck`);
  }
});

test('every word can be burned into every slot', () => {
  const g = seasoned(new Game('warrior', 3), 1);
  const rng = new RNG(5);
  const slots = ['mainhand', 'offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring'] as const;
  for (const w of WORD_IDS) {
    // (a plain piece of each kind for each word: a piece that already carries something may have no room, or nothing new to take)
    slots.forEach((slot, i) => {
      g.hero.bag[i] = rollItem(4, rng, { slot, rarity: 0 });
    });
    slots.forEach((_, i) => {
      g.hero.words[w] = 1;
      const n = g.imbueChoices({ kind: 'bag', i }, w).length;
      assert.ok(n >= 1);
      assert.equal(g.imbueProblem({ kind: 'bag', i }, w), null);
      assert.equal(g.imbue({ kind: 'bag', i }, w), null);
      assert.deepEqual(g.hero.bag[i]?.imbues.map((x) => x.word), [w]);
      assert.equal(g.hero.bag[i]?.rarity, 1, 'a white piece with a word is blue');
    });
  }
});

test('vendor: stock, buying, selling', () => {
  const g = new Game('warrior', 11);
  const h = g.hero;
  // (`shop` is the shelf of the vendor the hero is dealing with: at first the armourer's)
  assert.equal(g.vendor, 'armourer');
  assert.equal(g.shop, g.shops.armourer);
  assert.equal(g.shop.length, TUNE.shopSize);
  assert.ok(g.shop.every((it) => it !== null));
  // the same run at the same point sees the same stock (reloading the page is not a re-roll)
  const again = new Game('warrior', 11);
  assert.deepEqual(again.shop.map((it) => it?.name), g.shop.map((it) => it?.name));
  const it = g.shop[2]!;
  assert.ok(it);
  const price = itemValue(it);
  h.gold = price - 1;
  assert.notEqual(g.buy(2), null, 'too poor');
  h.gold = price + 5;
  assert.equal(g.buy(2), null);
  assert.equal(h.gold, 5);
  assert.equal(g.shop[2], null);
  assert.equal(h.bag[0], it);
  assert.notEqual(g.buy(2), null, 'already sold');
  // selling pays a quarter
  assert.equal(g.sell(0), null);
  const paid = Math.max(1, Math.floor(price * TUNE.sellRate));
  assert.equal(h.gold, 5 + paid);
  assert.equal(h.bag[0], null);
  // what was sold on this visit can be had back for what was paid for it (Version 14.3)
  assert.deepEqual(g.sold, [it]);
  h.gold = paid - 1;
  assert.notEqual(g.buyBack(0), null, 'too poor to buy it back');
  h.gold = paid + 3;
  assert.equal(g.buyBack(0), null);
  assert.equal(h.gold, 3);
  assert.equal(h.bag[0], it);
  assert.equal(g.sold.length, 0);
  assert.notEqual(g.buyBack(0), null, 'nothing left to buy back');
  // (the vendor keeps only so many: the oldest goes for good)
  for (let k = 0; k < TUNE.soldKept + 2; k++) {
    h.bag[1] = rollItem(1, new RNG(100 + k), {});
    assert.equal(g.sell(1), null);
  }
  assert.equal(g.sold.length, TUNE.soldKept);
  // (and nothing of it is left on the next visit)
  g.rollShop();
  assert.equal(g.sold.length, 0);
  // a full bag cannot buy
  for (let i = 0; i < h.bag.length; i++) h.bag[i] = rollItem(1, new RNG(i), {});
  h.gold = 99999;
  assert.notEqual(g.buy(3), null);
  // the stock changes once a dungeon has been cleared
  const later = new Game('warrior', 11);
  later.depth = 2;
  later.cleared = 1;
  later.rollShop();
  assert.notDeepEqual(later.shop.map((s) => s?.name), g.shop.map((s) => s?.name));
});

test('two vendors: the armourer deals in arms and armour, the mystic in what a caster carries; each always has a plain weapon of each of its kinds', () => {
  // The owner, 4 Oct 2026: "two different vendors, one selling martial equipment, the other
  // selling magical equipment". As read back to him: martial is swords, two-handed swords, bows,
  // shields, quivers, armour; magical is staffs, wands, focuses, rings, amulets; "each always
  // stocks a plain weapon of each of its kinds".
  const PAIRS: Record<string, string> = { shield: 'sword', quiver: 'bow', focus: 'wand' };
  assert.deepEqual([...VENDOR_IDS].sort(), ['armourer', 'mystic']);
  for (const cls of CLASS_IDS) {
    for (const seed of [3, 11, 29]) {
      for (const depth of [1, 4, 9]) {
        const g = new Game(cls, seed);
        g.depth = depth;
        g.cleared = depth - 1;
        g.rollShop();
        const seen = new Set<number>();
        for (const id of VENDOR_IDS) {
          const v = VENDORS[id];
          const stock = g.shops[id];
          const where = `${id}, ${cls}, seed ${seed}, dungeon ${depth}`;
          assert.equal(stock.length, TUNE.shopSize, `${where}: a shelf of ${TUNE.shopSize}`);
          assert.equal(v.weapons.length + v.slots.length, TUNE.shopSize, `${id}: its plain weapons and its other pieces fill the shelf`);
          // first, a plain weapon of each of its kinds, of this dungeon's level
          v.weapons.forEach((kind, i) => {
            const it = stock[i]!;
            assert.equal(it.weapon, kind, `${where}: piece ${i} is its plain ${kind}`);
            assert.equal(it.rarity, 0);
            assert.equal(it.affixes.length, 0);
            assert.equal(it.ilvl, depth);
          });
          // then a piece for each slot it deals in, in that order
          v.slots.forEach((slot, i) => assert.equal(stock[v.weapons.length + i]!.slot, slot, `${where}: piece ${v.weapons.length + i}`));
          // and whatever is held in a hand is of its own kinds
          for (const piece of stock) {
            assert.ok(piece, where);
            const it = piece!;
            assert.ok(!seen.has(it.uid), 'no piece is on two shelves');
            seen.add(it.uid);
            if (it.slot === 'mainhand') assert.ok(it.weapon !== null && v.weapons.includes(it.weapon), `${where}: a ${it.weapon} is not the ${id}'s to sell`);
            if (it.slot === 'offhand') assert.ok(it.offhand !== null && (v.weapons as readonly string[]).includes(PAIRS[it.offhand]), `${where}: a ${it.offhand} is not the ${id}'s to sell`);
          }
        }
        // between them the two sell every kind of weapon, plain
        const plain = VENDOR_IDS.flatMap((id) => g.shops[id].slice(0, VENDORS[id].weapons.length).map((it) => it!.weapon));
        assert.deepEqual([...plain].sort(), ['bow', 'greatsword', 'staff', 'sword', 'wand']);
      }
    }
  }
  // buying is from the vendor the hero is dealing with
  const g = new Game('mage', 4);
  g.hero.gold = 99999;
  g.vendor = 'mystic';
  const wand = g.shops.mystic[1]!;
  assert.equal(wand.weapon, 'wand');
  assert.equal(g.buy(1), null);
  assert.equal(g.shops.mystic[1], null);
  assert.ok(g.shops.armourer.every((it) => it !== null), 'the other shelf is as it was');
  assert.ok(g.hero.bag.includes(wand));
  // and either of them buys anything: what was sold is on the one shelf, whoever it was sold to
  g.vendor = 'armourer';
  assert.equal(g.sell(g.hero.bag.indexOf(wand)), null);
  assert.deepEqual(g.sold, [wand]);
  g.vendor = 'mystic';
  assert.equal(g.buyBack(0), null);
  assert.ok(g.hero.bag.includes(wand));
});

test('vendor prices are within reach of a dungeon or two of gold', () => {
  for (const depth of [1, 3, 6]) {
    const g = new Game('mage', 4);
    g.depth = depth;
    g.rollShop();
    for (const id of VENDOR_IDS) {
      const prices = g.shops[id].map((it) => (it ? itemValue(it) : 0)).sort((a, b) => a - b);
      console.log(`dungeon ${depth}, the ${id}'s prices: ${prices.join(', ')}`);
      assert.ok(prices[0] > 0);
    }
  }
});

test('Lexicon and stash outlast the character; the rest does not', () => {
  const meta = newMeta();
  const g = new Game('mage', 21, meta);
  const h = g.hero;
  h.words.fire = 0;
  h.words.twin = 3;
  h.gold = 100000;
  assert.equal(g.depositWord('twin'), null);
  assert.equal(g.depositWord('twin'), null);
  assert.notEqual(g.depositWord('frost'), null, 'cannot deposit a word you do not carry');
  assert.equal(meta.lexicon.twin, 2);
  assert.equal(h.words.twin, 1);
  assert.equal(g.withdrawWord('twin'), null);
  assert.equal(meta.lexicon.twin, 1);
  assert.notEqual(g.withdrawWord('power'), null);
  const boots = rollItem(2, new RNG(8), { slot: 'boots', rarity: 2 });
  h.bag[3] = boots;
  assert.equal(g.stashItem(3), null);
  assert.equal(h.bag[3], null);
  assert.equal(meta.stash[0], boots);
  // death
  g.enterDungeon();
  g.hurtHero(1e9, 'phys', [], null);
  assert.ok(g.over);
  assert.equal(meta.deaths, 1);
  // a new character finds them
  const next = new Game('warrior', 22, meta);
  assert.equal(next.meta.lexicon.twin, 1);
  assert.equal(next.hero.words.twin, 0, 'carried words were lost');
  assert.equal(next.unstashItem(0), null);
  assert.equal(next.hero.bag[0], boots);
  assert.equal(meta.stash[0], null);
  // nothing made for the new character shares an id with the old gear
  const ids = new Set<number>();
  for (const it of [...EQUIP_SLOTS.map((s) => next.hero.gear[s]), ...next.hero.bag, ...next.shops.armourer, ...next.shops.mystic]) {
    if (!it) continue;
    assert.ok(!ids.has(it.uid), `item id ${it.uid} is used once`);
    ids.add(it.uid);
  }
});

test('stash and bag limits', () => {
  const g = new Game('ranger', 2);
  const rng = new RNG(1);
  for (let i = 0; i < TUNE.stashSize; i++) g.meta.stash[i] = rollItem(1, rng, {});
  g.hero.bag[0] = rollItem(1, rng, {});
  assert.notEqual(g.stashItem(0), null, 'the stash is full');
  for (let i = 0; i < g.hero.bag.length; i++) g.hero.bag[i] = rollItem(1, rng, {});
  assert.notEqual(g.unstashItem(0), null, 'the bag is full');
});

test('saving keeps the gate plan; the Lexicon and stash are saved apart from the run', () => {
  const meta = newMeta();
  const g = new Game('warrior', 40, meta);
  // (home from the first dungeon: its own gate takes no word, since Version 19.5)
  g.depth = 2;
  g.cleared = 1;
  g.hero.words.volatile = 1;
  g.hero.words.swift = 2;
  g.hero.gold = TUNE.keepCost;
  assert.equal(g.planWord('volatile'), null);
  assert.equal(g.depositWord('swift'), null);
  g.hero.bag[0] = rollItem(1, new RNG(3), {});
  g.stashItem(0);
  const run = JSON.parse(JSON.stringify(g.save()));
  const kept = cleanMeta(JSON.parse(JSON.stringify(meta)));
  const back = Game.restore(run, kept);
  assert.deepEqual(back.plan, ['volatile']);
  assert.equal(back.hero.words.volatile, 0);
  assert.equal(back.hero.words.swift, 1);
  assert.equal(back.meta.lexicon.swift, 1);
  assert.ok(back.meta.stash[0]);
  assert.equal(back.shop.length, TUNE.shopSize);
});

test('a damaged or missing Lexicon save becomes an empty one, not a crash', () => {
  for (const bad of [null, undefined, {}, { lexicon: { fire: -3, bogus: 9 }, stash: 'no' }, { stash: [null, null] }]) {
    const m = cleanMeta(bad as never);
    assert.equal(m.stash.length, TUNE.stashSize);
    for (const w of WORD_IDS) assert.ok(m.lexicon[w] >= 0);
    const g = new Game('mage', 1, m);
    assert.ok(g.level.town);
  }
});

test('clearing a dungeon records the deepest one reached (by the portal home: the ways off; and down the stairwell, below)', () => {
  const g = waysSet(false, () => {
    const q = new Game('warrior', 77);
    q.enterDungeon();
    return q;
  });
  // kill the boss the quick way and walk into the portal
  assert.ok(g.boss);
  const c = emptyControls();
  for (const m of g.monsters) m.life = 1;
  const boss = g.boss!;
  g.hero.x = boss.x - 1;
  g.hero.y = boss.y;
  for (let i = 0; i < 2000 && g.boss && !g.boss.dead; i++) {
    g.hero.life = g.hero.d.maxLife;
    c.fire = true;
    c.aimX = boss.x;
    c.aimY = boss.y;
    g.update(1 / 30, c);
    g.events.length = 0;
  }
  const p = g.level.portal!;
  assert.ok(p && p.state === 1, 'the portal opened');
  g.hero.x = p.x;
  g.hero.y = p.y + 0.8;
  c.fire = false;
  c.interact = true;
  g.update(1 / 30, c);
  assert.ok(g.level.town);
  assert.equal(g.meta.bestDepth, 1);
  assert.equal(g.depth, 2);
});

test('going down the stairwell records the deepest floor reached (the ways on, as in the game)', () => {
  const g = new Game('warrior', 77);
  g.hero.invuln = 1e9;
  g.enterDungeon();
  const boss = g.monsters.find((m) => m.boss)!;
  (g as unknown as { damageMonster: (m: unknown, d: number, el: string, c: boolean, s: number) => void }).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
  const st = g.level.ways!.stair!;
  assert.ok(st.open, 'the stairwell opened');
  const top = topStep(st);
  g.hero.x = top.x;
  g.hero.y = top.y;
  const L = g.level;
  for (let i = 0; i < 60 && g.level === L; i++) g.update(1 / 30, emptyControls());
  assert.ok(g.inDungeon && g.level !== L, 'down to the next floor');
  assert.equal(g.meta.bestDepth, 1);
  assert.equal(g.depth, 2);
});
