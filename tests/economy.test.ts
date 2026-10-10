// Power words are scarce, and where they turn up is luck.
// The owner: "I don't want too many words. They should be pretty random. I don't want a ton of
// words left over." And: "let the boss have a guaranteed drop of at least 1 word. we can have the
// chance of dropping more words increase with difficulty and rarity modifiers on dungeons."
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { TUNE, WORDS, useFirstLevels } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { CLASS_IDS, WORD_IDS } from '../src/game/types';
import type { ClassId, WordId } from '../src/game/types';

const DT = 1 / 30;

// THE FIRST LEVELS (game/defs.ts, on since Version 19.5) keep every word from a hero until the
// wordsmith's ring is lit, and leave the first dungeon without a word at all (the owner, 21:05: "That
// also means no words on monsters for dungeon 1"). These tests are of how scarce words are as the
// drops are tuned, dungeon by dungeon, so they run with the first levels off, as the game was; what
// the first levels change is tested in tests/first_levels.test.ts.
useFirstLevels(false);

/** Dungeon number `depth` of a character who has been down before (so it is not their first dungeon, with its fallen wordsmith). */
function dungeon(cls: ClassId, seed: number, depth: number, plan: WordId[] = []): Game {
  const g = new Game(cls, seed);
  g.depth = depth;
  g.cleared = depth;
  for (const w of plan) g.plan.push(w);
  g.enterDungeon();
  g.events.length = 0;
  return g;
}

type Inner = { kill: (m: Monster) => void };
const wordsOnFloor = (g: Game): WordId[] => g.drops.filter((d) => d.kind === 'word').map((d) => d.word as WordId);

test('what hangs over a monster is what its death leaves, and for most monsters that is nothing', () => {
  for (const cls of CLASS_IDS) {
    for (const [seed, depth] of [[3, 1], [4, 2], [5, 4], [6, 7], [7, 10]] as const) {
      const g = dungeon(cls, seed, depth);
      const a = g as unknown as Inner;
      let named = 0;
      for (const m of [...g.monsters]) {
        const carried = g.wordsCarried(m);
        assert.deepEqual(carried, m.carries);
        if (!m.elite && !m.boss) {
          assert.deepEqual(carried, [], 'an ordinary monster carries no word');
          continue;
        }
        if (m.boss) {
          assert.ok(carried.length >= 1 && carried.length <= 3, 'the boss always gives up a word: one at least, three at most');
          assert.ok(m.words.includes(carried[0]), 'the first is one of its own');
          assert.equal(new Set(carried).size, carried.length, 'no word twice');
          if (depth === 1) assert.equal(carried.length, 1, 'in the first dungeon, with nothing burned in, exactly one');
        } else {
          named++;
          assert.ok(carried.length <= 1, 'a named monster or a guardian gives up one word at most');
          if (carried.length) assert.ok(m.words.includes(carried[0]) && m.name.includes(WORDS[carried[0]].front), 'and it is one of the words in its name');
          assert.ok(m.words.length >= 1 && m.name !== 'Skeleton', 'whether or not it gives one up, it has its word\'s power and its name');
        }
        // its death leaves exactly that
        g.drops.length = 0;
        a.kill(m);
        assert.deepEqual(wordsOnFloor(g), [...carried], `${m.name} (dungeon ${depth}) leaves what it carried: ${carried.join(', ') || 'no word'}`);
      }
      assert.ok(named > 0);
    }
  }
});

test('words are scarce: a fully explored dungeon holds a handful, where it used to hold nine or more', () => {
  // WHICH DUNGEONS ARE COUNTED (changed for Version 18.3). Until then it was 30 seeds for each of
  // the three classes, and the three classes' dungeons of one seed are the same dungeon with the
  // same words on the same heads: 30 dungeons, counted three times. It asked that NONE of them
  // hold more than 8 words; and of 1,500 twelfth dungeons, counted for that release, 12 do without
  // the corridors across the screen and 14 with them (4.84 and 4.85 words on average): whether
  // one of thirty did was luck, and when the corridors set the rooms down afresh one did (8.3).
  // So: 90 separate dungeons of each depth, the classes taking turns, and "hardly ever a pile".
  const rows: string[] = [];
  for (const depth of [1, 2, 3, 5, 8, 12]) {
    let n = 0;
    let sure = 0;
    let all = 0;
    let most = 0;
    let piles = 0;
    let elites = 0;
    let eliteCarry = 0;
    let guardians = 0;
    let guardianCarry = 0;
    {
      for (let seed = 1; seed <= 90; seed++) {
        const g = dungeon(CLASS_IDS[seed % CLASS_IDS.length], seed * 17 + depth, depth);
        const f = g.level.floor;
        const chests = g.level.props.filter((p) => p.kind === 'chest');
        const vaults = f.rooms.filter((r) => r.kind === 'treasure' && chests.some((p) => p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h)).length;
        const ordinary = g.monsters.filter((m) => !m.elite && !m.boss).length;
        // standing in the dungeon for certain, on a monster's head...
        const standing = g.monsters.reduce((k, m) => k + m.carries.length, 0);
        // ...and what luck adds on average: chests, and the rare ordinary monster
        const expected = standing + vaults * TUNE.vaultWord + (chests.length - vaults) * TUNE.chestWord + ordinary * TUNE.dropWord;
        n++;
        sure += standing;
        all += expected;
        most = Math.max(most, expected);
        if (expected > 8) piles++;
        // (MONSTER PACKS, since Version 19.7: a lair may hold two guardians, and gives up a word as
        // one guardian did, so it is the lairs that are counted; and of the yellow packs' leaders, only
        // an elite room's may carry a word, as an elite always might: those are counted)
        const lairs = new Map<number, boolean>();
        for (const m of g.monsters) {
          if (m.champion) lairs.set(m.packId, (lairs.get(m.packId) ?? false) || m.carries.length > 0);
          else if (m.elite && !m.boss && (!m.rarity || f.packs[m.packId].tier === 'elite')) {
            elites++;
            if (m.carries.length) eliteCarry++;
          }
        }
        for (const carried of lairs.values()) {
          guardians++;
          if (carried) guardianCarry++;
        }
        assert.ok(standing >= 1, 'the boss, at least');
      }
    }
    rows.push(`dungeon ${depth}: ${(all / n).toFixed(1)} words in a full clear (${(sure / n).toFixed(1)} standing on monsters; the most in any one: ${most.toFixed(1)}); named monsters carrying ${Math.round((eliteCarry / elites) * 100)}%, guardians' lairs ${Math.round((guardianCarry / guardians) * 100)}%`);
    assert.ok(all / n >= 2 && all / n <= 5.5, `dungeon ${depth}: ${(all / n).toFixed(2)} words on average in a full clear (it was 9 to 13)`);
    assert.ok(piles <= 3 && most <= 11, `dungeon ${depth}: hardly ever a pile (${piles} of ${n} hold more than 8 words; ${most.toFixed(1)} at most)`);
    assert.ok(Math.abs(eliteCarry / elites - TUNE.eliteCarry) < 0.12, `dungeon ${depth}: about one named monster in five carries (${eliteCarry} of ${elites})`);
    assert.ok(Math.abs(guardianCarry / guardians - TUNE.guardianCarry) < 0.15, `dungeon ${depth}: a guardian's lair gives up a word about ${TUNE.guardianCarry * 100}% of the time (${guardianCarry} of ${guardians})`);
  }
  console.log(rows.join('\n'));
});

test('where a word turns up is luck: the same dungeon number gives different finds, and a named monster without a rune gives no word', () => {
  const shapes = new Set<string>();
  let dry = 0;
  let paid = 0;
  let geared = 0;
  for (let seed = 1; seed <= 24; seed++) {
    const g = dungeon('ranger', seed, 3);
    const a = g as unknown as Inner;
    const named = g.monsters.filter((m) => m.elite && !m.boss);
    shapes.add(named.map((m) => (m.carries.length ? m.carries[0] : '-')).join(' ') + ' / ' + g.boss!.carries[0]);
    if (!named.some((m) => m.carries.length)) dry++;
    for (const m of named.filter((q) => !q.carries.length)) {
      g.drops.length = 0;
      a.kill(m);
      assert.deepEqual(wordsOnFloor(g), [], `${m.name} had no rune over its head, and leaves no word`);
      // (loot was scaled back on 4 Oct 2026: gold every time, a piece of gear about half the time)
      assert.ok(g.drops.some((d) => d.kind === 'gold'), 'though it still pays in gold');
      assert.ok(g.drops.filter((d) => d.kind === 'item').length <= 1, 'and never more than one piece of gear');
      // (a guardian always leaves a piece: it is the plain named monsters that leave one about half the time)
      if (m.champion) continue;
      paid++;
      if (g.drops.some((d) => d.kind === 'item')) geared++;
    }
  }
  assert.ok(paid >= 40 && geared / paid > 0.3 && geared / paid < 0.7, `about half of the named monsters left gear (${geared} of ${paid})`);
  assert.ok(shapes.size >= 18, `24 dungeons gave ${shapes.size} different sets of finds`);
  assert.ok(dry >= 1, 'and in some of them only the boss had a word to give');
  // every word can be the one that turns up
  const seen = new Set<WordId>();
  for (let seed = 1; seed <= 60; seed++) for (const m of dungeon('mage', seed, 2).monsters) for (const w of m.carries) seen.add(w);
  assert.equal(seen.size, WORD_IDS.length, `every word turns up (${[...seen].join(', ')})`);
});

test('a chest only sometimes holds a word; an ordinary monster hardly ever', () => {
  let firsts = 0;
  let others = 0;
  let words = 0;
  for (let seed = 1; seed <= 70; seed++) {
    const g = dungeon(CLASS_IDS[seed % 3], seed, 1 + (seed % 5));
    const h = g.hero;
    const c = emptyControls();
    const f = g.level.floor;
    // (the monsters are put out of the way: this is about the chests)
    g.monsters.length = 0;
    const chests = g.level.props.filter((p) => p.kind === 'chest');
    const vaultOf = (p: (typeof chests)[0]): number => f.rooms.find((r) => r.kind === 'treasure' && p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h)?.id ?? -1;
    const begun = new Set<number>();
    for (const p of chests) {
      if (p.state === 1) continue;
      const shut = chests.filter((q) => q.state === 0);
      g.drops.length = 0;
      h.x = p.x;
      h.y = p.y + 0.9;
      g.update(DT, c);
      assert.equal(p.state, 1, 'the chest opens');
      // (chests that stand together open together: the first opened in each vault is that vault's rich one)
      for (const q of shut) {
        if (q.state !== 1) continue;
        const v = vaultOf(q);
        if (v >= 0 && !begun.has(v)) {
          begun.add(v);
          firsts++;
        } else others++;
      }
      words += wordsOnFloor(g).length;
    }
    assert.ok(chests.every((q) => q.state === 1));
  }
  const expected = firsts * TUNE.vaultWord + others * TUNE.chestWord;
  console.log(`chests: ${firsts} first chests of a vault and ${others} others held ${words} words between them (${expected.toFixed(0)} expected; it used to be ${Math.round(firsts + others * 0.35)})`);
  assert.ok(firsts >= 60 && others >= 60);
  assert.ok(words >= 1 && words < firsts * 0.5, `a vault's first chest holds a word about a quarter of the time, not always (${words} words from ${firsts} vaults)`);
  assert.ok(Math.abs(words - expected) < 3.5 * Math.sqrt(expected), `about as many as the chances say (${words} against ${expected.toFixed(1)})`);
  // ordinary monsters
  let dead = 0;
  let found = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const g = dungeon('warrior', seed, 2);
    const a = g as unknown as Inner;
    for (const m of [...g.monsters]) {
      if (m.elite || m.boss) continue;
      g.drops.length = 0;
      a.kill(m);
      dead++;
      found += wordsOnFloor(g).length;
    }
  }
  console.log(`ordinary monsters: ${found} words from ${dead} kills`);
  assert.ok(dead > 2000);
  assert.ok(found >= 1 && found <= dead * 0.01, `a word from an ordinary monster is a rare surprise (${found} in ${dead} kills; it was 1 in 80)`);
});

test('the boss always gives up a word; the chance of more grows with the depth of the dungeon and with every word burned into it', () => {
  const avg = (depth: number, plan: WordId[]): number => {
    let n = 0;
    let words = 0;
    for (let seed = 1; seed <= 120; seed++) {
      const g = dungeon(CLASS_IDS[seed % 3], seed * 13 + depth, depth, plan);
      const boss = g.boss!;
      assert.ok(boss.carries.length >= 1 && boss.carries.length <= 3);
      assert.ok(boss.words.includes(boss.carries[0]), 'the one it always gives up is one of its own');
      n++;
      words += boss.carries.length;
    }
    return words / n;
  };
  const d1 = avg(1, []);
  const d4 = avg(4, []);
  const d9 = avg(9, []);
  const d10 = avg(10, []);
  const burned1 = avg(4, ['swift']);
  const burned3 = avg(4, ['frost', 'swift', 'power']);
  console.log(`words the boss gives up, on average: dungeon 1: ${d1.toFixed(2)}, dungeon 4: ${d4.toFixed(2)}, dungeon 9: ${d9.toFixed(2)}, dungeon 10 (a Greater Warden): ${d10.toFixed(2)}; dungeon 4 with one word burned in: ${burned1.toFixed(2)}, with three: ${burned3.toFixed(2)}`);
  assert.equal(d1, 1, 'the first dungeon: one word, for certain, and never more');
  assert.ok(d4 > d1 && d9 > d4 + 0.1, 'deeper dungeons: a growing chance of a second');
  assert.ok(d10 > d9 + 0.1, 'a Greater Warden: likelier still');
  assert.ok(burned1 > d4 + 0.15 && burned3 > burned1 + 0.3, 'every word burned into the dungeon makes more likelier');
  assert.ok(burned3 < 2.6, 'but burning three words in never pays three back');
});

test('words burned into a dungeon are spent: every monster has their powers, and the boss does not hand them back', () => {
  let plain = 0;
  let burned = 0;
  let back = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const g0 = dungeon('mage', seed, 4);
    const g = dungeon('mage', seed, 4, ['frost', 'swift']);
    assert.deepEqual(g.dungeonWords, ['frost', 'swift']);
    for (const m of g.monsters) {
      assert.ok(m.words.includes('frost') && m.words.includes('swift'), 'every monster in it has the burned-in words\' powers');
      if (m.boss) {
        // (it may give up a word that happens to be one of them: that is luck, not a refund)
        if (m.carries.includes('frost') && m.carries.includes('swift')) back++;
      } else if (!m.elite) assert.deepEqual(m.carries, [], 'an ordinary monster has the powers but gives up nothing');
      else assert.ok(m.carries.length <= 1);
    }
    // the dungeon itself is the same dungeon: only the luck of the finds changes
    assert.equal(g.monsters.length, g0.monsters.length);
    plain += g0.monsters.filter((m) => !m.boss && m.carries.length).length;
    burned += g.monsters.filter((m) => !m.boss && m.carries.length).length;
  }
  console.log(`named monsters and guardians carrying a word, over 40 dungeons: ${plain} with nothing burned in, ${burned} with two words burned in; the boss gave both burned words back in ${back} of 40`);
  assert.ok(burned > plain, 'burning words in makes it likelier that a named monster carries one');
  assert.ok(back <= 4, 'the boss does not hand the burned words back (it did, always, before)');
});

test('how scarce words are never changes the dungeon itself', () => {
  const g1 = dungeon('warrior', 21, 3);
  const keep = { ...TUNE };
  Object.assign(TUNE, { eliteCarry: 1, guardianCarry: 1 });
  try {
    const g2 = dungeon('warrior', 21, 3);
    assert.equal(g1.monsters.length, g2.monsters.length);
    g1.monsters.forEach((m, i) => {
      const o = g2.monsters[i];
      assert.deepEqual([m.kind, m.name, m.x, m.y, m.maxLife, m.words.join()], [o.kind, o.name, o.x, o.y, o.maxLife, o.words.join()]);
    });
    // (MONSTER PACKS, since Version 19.7: the named monsters that may carry a word are an elite
    // room's leader and the first guardian of a lair; a lair gives up a word as one guardian did)
    const packs = g2.level.floor.packs;
    const leaders = g2.monsters.filter((m) => m.elite && !m.champion && !m.boss && (!m.rarity || packs[m.packId].tier === 'elite'));
    assert.ok(leaders.length > 0 && leaders.every((m) => m.carries.length === 1), 'with the chances turned all the way up, every elite room\'s leader carries');
    for (const id of new Set(g2.monsters.filter((m) => m.champion).map((m) => m.packId))) {
      assert.equal(g2.monsters.filter((m) => m.champion && m.packId === id && m.carries.length === 1).length, 1, 'and every lair gives up one word');
    }
  } finally {
    Object.assign(TUNE, keep);
  }
});

// ---------------------------------------------------------------------------------------------
// Loot, scaled back (the owner, 4 Oct 2026: "When loot drops we just want it to say amulet or
// sword not the actual name of the item. It will lower screen clutter ... And let's scale back
// the drops").

test('loot is scaled back: one piece from a guardian, two from a boss, one from a chest, and gold in fewer, bigger piles', () => {
  let ordinary = 0;
  let ordinaryItems = 0;
  let piles = 0;
  let coins = 0;
  for (const cls of CLASS_IDS) {
    for (const [seed, depth] of [[11, 2], [12, 3], [13, 5], [14, 6]] as const) {
      const g = dungeon(cls, seed, depth);
      const a = g as unknown as Inner;
      for (const m of [...g.monsters]) {
        g.drops.length = 0;
        a.kill(m);
        const items = g.drops.filter((d) => d.kind === 'item');
        if (m.boss) {
          assert.equal(items.length, TUNE.bossItems + (depth % 5 === 0 ? TUNE.bossItemsFifth : 0), `the boss of dungeon ${depth} leaves its hoard`);
          assert.ok(items[0].item!.rarity >= 1, 'whose first piece is never plain (it is no longer rare for certain: gear is made good with words)');
        } else if (m.champion) {
          assert.equal(items.length, 1, 'a guardian leaves one piece');
          // (it was always rare until 4 Oct 2026; now it is only likelier than usual to be good)
        } else if (m.elite) {
          assert.ok(items.length <= 1);
        } else {
          ordinary++;
          ordinaryItems += items.length;
          const gold = g.drops.filter((d) => d.kind === 'gold');
          piles += gold.length;
          for (const d of gold) {
            coins += d.gold;
            assert.ok(d.gold >= TUNE.goldMin * depth && d.gold <= TUNE.goldMax * depth, 'a pile is worth picking up');
          }
        }
      }
    }
  }
  assert.ok(ordinary > 1000, `enough ordinary monsters to count (${ordinary})`);
  assert.ok(ordinaryItems / ordinary < 0.05, `an ordinary monster leaves gear about 3 times in 100 (${ordinaryItems} of ${ordinary})`);
  assert.ok(piles / ordinary > 0.2 && piles / ordinary < 0.3, `and gold about one time in four (${piles} of ${ordinary})`);
  assert.ok(coins > 0);
});

test('a chest holds one piece of gear (a vault\'s may hold two)', () => {
  let opened = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const g = dungeon(CLASS_IDS[seed % 3], seed, 1 + (seed % 4));
    const c = emptyControls();
    const f = g.level.floor;
    g.monsters.length = 0;
    const chests = g.level.props.filter((q) => q.kind === 'chest');
    const inVault = (p: (typeof chests)[0]): boolean => f.rooms.some((r) => r.kind === 'treasure' && p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h);
    for (const p of chests) {
      if (p.state === 1) continue;
      const shut = chests.filter((q) => q.state === 0);
      // (a full bag, so that nothing is picked up before it is counted)
      g.hero.bag.fill(g.hero.gear.mainhand);
      g.drops.length = 0;
      g.hero.x = p.x;
      g.hero.y = p.y + 0.9;
      g.update(DT, c);
      g.events.length = 0;
      // (chests in a vault stand close together: walking up to one can open its neighbour too)
      const now = shut.filter((q) => q.state === 1);
      assert.ok(now.includes(p), 'the chest opens');
      opened += now.length;
      const most = now.reduce((n, q) => n + (inVault(q) ? 2 : 1), 0);
      const items = g.drops.filter((d) => d.kind === 'item');
      assert.ok(items.length >= now.length && items.length <= most, `${now.length} chest(s) dropped ${items.length} piece(s), at most ${most}`);
    }
  }
  assert.ok(opened > 20, `enough chests opened (${opened})`);
});

// ---------------------------------------------------------------------------------------------
// Rarity grows as you play (the owner, 4 Oct 2026: "early on there can be white rarity gear with
// only a few blue items yellow items should be pretty rare. You'll be using words to craft gear so
// we don't want to give the player a full set of yellow rarity gear").

test('early dungeons give mostly plain gear and almost nothing rare; deep ones give more of both', () => {
  // HOW MANY DUNGEONS ARE COUNTED (changed for Version 18.2). Until then it was 12 seeds for each
  // of the three classes, "36 dungeons": but the three classes' dungeons of one seed drop the same
  // pieces, so it was 12 dungeons three times over, and of some 110 pieces two or three were rare.
  // One rare piece more or less crossed the line below: the count read 1.8% rare before the corners
  // of rooms were cut clean and 3.3% after, with nothing about the drops changed (what stands in a
  // dungeon was rolled afresh, and so were its drops). Over 3,000 first dungeons a side, counted
  // for that release: 1.89% before, 1.82% after. So: 240 dungeons of each depth, each of another
  // seed, the classes taking turns.
  const DUNGEONS = 240;
  const tally = (depth: number): { n: number; share: number[] } => {
    const counts = [0, 0, 0];
    for (let k = 0; k < DUNGEONS; k++) {
      const g = dungeon(CLASS_IDS[k % CLASS_IDS.length], 21 + k, depth);
      const a = g as unknown as Inner;
      g.drops.length = 0;
      for (const m of [...g.monsters]) a.kill(m);
      for (const d of g.drops) if (d.kind === 'item') counts[Math.min(2, d.item!.rarity)]++;
    }
    const n = counts[0] + counts[1] + counts[2];
    return { n, share: counts.map((c) => c / n) };
  };
  const early = tally(1);
  const deep = tally(12);
  console.log(`gear from every monster of ${DUNGEONS} dungeons: depth 1 ${early.n} pieces, ${early.share.map((v) => (v * 100).toFixed(1) + '%').join(' / ')}; depth 12 ${deep.n} pieces, ${deep.share.map((v) => (v * 100).toFixed(1) + '%').join(' / ')} (plain / magic / rare)`);
  assert.ok(early.n > 1000 && deep.n > 1000, 'enough gear to count');
  assert.ok(early.share[0] > 0.65, `in the first dungeon most gear is plain (${early.share[0].toFixed(2)})`);
  assert.ok(early.share[1] < 0.33, `with only a few magic pieces (${early.share[1].toFixed(2)})`);
  assert.ok(early.share[2] < 0.03, `and a rare piece is an event (${early.share[2].toFixed(3)})`);
  assert.ok(deep.share[2] > early.share[2] * 2, 'deep dungeons give more rare gear');
  assert.ok(deep.share[1] > early.share[1], 'and more magic gear');
  assert.ok(deep.share[2] < 0.12, `but never a flood of it (${deep.share[2].toFixed(3)})`);
  assert.ok(deep.share[0] > 0.4, `and plain gear, the kind that is made good with words, stays common (${deep.share[0].toFixed(2)})`);
});

test('the vendor sells what the dungeons give: plain and magic early, something rare now and then', () => {
  const stock = (depth: number): number[] => {
    const counts = [0, 0, 0];
    for (let seed = 1; seed <= 60; seed++) {
      const g = new Game(CLASS_IDS[seed % 3], seed);
      g.depth = depth;
      g.cleared = depth - 1;
      g.rollShop();
      for (const it of g.shop) if (it) counts[Math.min(2, it.rarity)]++;
    }
    const n = counts[0] + counts[1] + counts[2];
    return counts.map((c) => c / n);
  };
  const early = stock(1);
  const deep = stock(12);
  console.log(`vendor stock, plain / magic / rare: depth 1 ${early.map((v) => (v * 100).toFixed(0) + '%').join(' / ')}; depth 12 ${deep.map((v) => (v * 100).toFixed(0) + '%').join(' / ')}`);
  assert.ok(early[2] < 0.06, `a rare piece in the first shop is unusual (${early[2].toFixed(3)})`);
  assert.ok(early[0] > 0.4, 'most of the first shop is plain');
  assert.ok(deep[2] > early[2] && deep[1] > early[1], 'the stock gets better with the dungeons');
});
