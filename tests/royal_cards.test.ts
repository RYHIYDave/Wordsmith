// THE ROYAL CARDS (game/royal_cards.ts; the High City's event, behind HIGH_CITY, off): his idea, 28 Oct 2026, “I had an idea
// for the four bosses, that there would be enemies that were influenced by one of the bosses, then they would drop cards.  The
// cards would then be used at the gambler.  You hand in a pair or three of a kind and then you get loot based on the
// difficulty of the hand.”; the deck “Just the four royals (Recommended)”, Kings the rarest; built “With floor 16
// (Recommended)”. Here:
//   1. the hands his cards make, best first; what each takes and pays; a hand that holds another always pays more;
//   2. Kings pay more than Princesses (three Kings more than three Princesses);
//   3. a card on the floor walked over is his, and kept in his save;
//   4. handed in at the stranger, in town: its cards gone, its pieces in his bag at the levels it says; not out of town, not
//      into a full bag, not a hand he does not hold;
//   5. the stranger's CARDS page only with the High City on and a card held;
//   6. the crests and the cards drawn: each royal's its own colours.
//   run: tsx --test tests/royal_cards.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { Game } from '../src/game/game';
import { ROYALS, ROYAL_TUNE, canMake, cleanCards, handCards, handName, handPays, handsFrom, paysName, rankOf, royalFloor } from '../src/game/royal_cards';
import type { Hand, Royal } from '../src/game/royal_cards';
import { cardsOpen } from '../src/ui/royal_cards';
import { royalCrest } from '../src/art/royal_crest';
import { royalCard, ROYAL_LOOK } from '../src/art/high_city_set';
import { paintWithoutCanvas, paintingOf } from './helpers';
import { quietHex } from '../src/art/act2_quiet';

paintWithoutCanvas();

const worth = (h: Hand): number => {
  const p = handPays(h);
  return p.n * 100 + p.rarity * 10 + p.plus;
};

test('1. the hands his cards make, best first; each takes its cards', () => {
  assert.deepEqual(handsFrom({}), []);
  assert.deepEqual(handsFrom({ princess: 1, prince: 1, queen: 1, king: 1 }), [], 'one of each: no hand');
  assert.deepEqual(handsFrom({ princess: 2 }), [{ kind: 'pair', main: 'princess' }]);
  const hs = handsFrom({ king: 3, queen: 2 });
  assert.deepEqual(hs[0], { kind: 'fullhouse', main: 'king', kicker: 'queen' }, 'the full house first');
  const kinds = hs.map((h) => `${h.kind}:${h.main}:${h.kicker ?? ''}`);
  for (const k of ['three:king:', 'twopair:king:queen', 'pair:king:', 'pair:queen:']) assert.ok(kinds.includes(k), k);
  for (let i = 1; i < hs.length; i++) assert.ok(worth(hs[i - 1]) >= worth(hs[i]), 'best first');
  assert.deepEqual(handCards({ kind: 'fullhouse', main: 'king', kicker: 'queen' }).sort(), ['king', 'king', 'king', 'queen', 'queen']);
  assert.equal(canMake({ king: 3, queen: 2 }, { kind: 'fullhouse', main: 'king', kicker: 'queen' }), true);
  assert.equal(canMake({ king: 2, queen: 3 }, { kind: 'fullhouse', main: 'king', kicker: 'queen' }), false);
  assert.equal(handName({ kind: 'twopair', main: 'king', kicker: 'princess' }), 'Two pair: Kings and Princesses');
  assert.equal(paysName({ n: 2, rarity: 2, plus: 3 }), 'Two rare pieces, 3 levels above you');
  assert.equal(paysName({ n: 1, rarity: 1, plus: 0 }), 'A magic piece');
});

test('1. a hand that holds another always pays more than it', () => {
  const all: Hand[] = [];
  for (const a of ROYALS) {
    for (const kind of ['pair', 'three', 'four'] as const) all.push({ kind, main: a });
    for (const b of ROYALS) if (b !== a) all.push({ kind: 'fullhouse', main: a, kicker: b });
    for (const b of ROYALS) if (rankOf(a) > rankOf(b)) all.push({ kind: 'twopair', main: a, kicker: b });
  }
  const need = (h: Hand): Map<Royal, number> => {
    const m = new Map<Royal, number>();
    for (const r of handCards(h)) m.set(r, (m.get(r) ?? 0) + 1);
    return m;
  };
  let pairs = 0;
  for (const big of all) {
    for (const less of all) {
      if (big === less) continue;
      const b = need(big);
      const l = need(less);
      const holds = [...l].every(([r, k]) => (b.get(r) ?? 0) >= k) && handCards(big).length > handCards(less).length;
      if (!holds) continue;
      pairs++;
      assert.ok(worth(big) > worth(less), `${handName(big)} pays more than ${handName(less)}`);
      const pb = handPays(big);
      const pl = handPays(less);
      assert.ok(pb.n >= pl.n && pb.rarity >= pl.rarity && pb.plus >= pl.plus, `${handName(big)}: no less in any way than ${handName(less)}`);
    }
  }
  assert.ok(pairs > 30, `${pairs} checked`);
});

test('2. Kings the rarest and the richest: three Kings pay more than three Princesses; a pair of Queens or Kings a rare', () => {
  assert.ok(worth({ kind: 'three', main: 'king' }) > worth({ kind: 'three', main: 'princess' }));
  assert.ok(handPays({ kind: 'three', main: 'king' }).n > handPays({ kind: 'three', main: 'princess' }).n);
  assert.equal(handPays({ kind: 'pair', main: 'princess' }).rarity, 1);
  assert.equal(handPays({ kind: 'pair', main: 'queen' }).rarity, 2);
  const w = ROYAL_TUNE.weight;
  assert.ok(w.princess > w.prince && w.prince > w.queen && w.queen > w.king, 'the King touches fewest');
  assert.ok(ROYAL_TUNE.touched > 0 && ROYAL_TUNE.touched < 1);
});

test('the High City’s floors alone: off, no floor is the royals’; on, floor 16 is', () => {
  assert.equal(HIGH_CITY.on, false);
  assert.equal(royalFloor(16), false);
  HIGH_CITY.on = true;
  try {
    assert.equal(royalFloor(16), true);
    assert.equal(royalFloor(15), false);
    assert.equal(royalFloor(1), false);
  } finally {
    HIGH_CITY.on = false;
  }
});

test('3. a royal’s card walked over is his, and kept in his save', () => {
  const g = new Game('warrior', 5);
  const h = g.hero;
  const gx = g as unknown as { addDrop(kind: string, x: number, y: number, gold: number, item: null, word: null): void; updateDrops(dt: number): void };
  gx.addDrop('card', h.x, h.y, 0, null, null);
  g.drops[g.drops.length - 1].royal = 'queen';
  g.drops[g.drops.length - 1].x = h.x;
  g.drops[g.drops.length - 1].y = h.y;
  for (let i = 0; i < 20; i++) gx.updateDrops(0.05);
  assert.equal(g.drops.filter((d) => d.kind === 'card').length, 0, 'taken up');
  assert.deepEqual(h.cards, { queen: 1 });
  h.cards = { queen: 1, king: 3 };
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), g.meta);
  assert.deepEqual(back.hero.cards, { queen: 1, king: 3 });
  assert.deepEqual(cleanCards({ king: 2.7, queen: -1, joker: 4, prince: 'x' }), { king: 2 });
  // (none held: nothing in the save)
  h.cards = {};
  assert.equal('cards' in g.save(), false);
});

test('4. handed in at the stranger, in town: its cards gone, its pieces in his bag; not a hand he does not hold, not into a full bag', () => {
  const g = new Game('warrior', 7);
  const h = g.hero;
  assert.ok(g.level.town, 'a new game begins in town');
  h.bag.fill(null);
  h.cards = { king: 3, queen: 2, princess: 1 };
  const full: Hand = { kind: 'fullhouse', main: 'king', kicker: 'queen' };
  assert.equal(g.handInCards({ kind: 'four', main: 'king' }), 'You do not hold that hand');
  assert.equal(g.handInCards(full), null);
  assert.deepEqual(h.cards, { princess: 1 }, 'the five cards are the stranger’s');
  const pays = handPays(full);
  assert.equal(g.wonHand.length, pays.n);
  for (const i of g.wonHand) {
    const it = h.bag[i];
    assert.ok(it, 'a piece in the bag where it says');
    assert.equal(it!.rarity, pays.rarity);
  }
  // (a full bag)
  h.cards = { prince: 2 };
  h.bag.fill(h.bag[g.wonHand[0]]);
  assert.equal(g.handInCards({ kind: 'pair', main: 'prince' }), 'Bag is full');
  assert.deepEqual(h.cards, { prince: 2 }, 'nothing taken');
});

test('4. not out of town', () => {
  const g = Game.forTrial('warrior', 3, 2);
  assert.equal(g.level.town, false);
  g.hero.cards = { king: 2 };
  assert.equal(g.handInCards({ kind: 'pair', main: 'king' }), 'Only in town');
  assert.deepEqual(g.hero.cards, { king: 2 });
});

test('5. the stranger’s CARDS page: only with the High City on, and a card held', () => {
  const g = new Game('warrior', 5);
  g.hero.cards = { king: 1 };
  assert.equal(cardsOpen(g), false, 'off: never');
  HIGH_CITY.on = true;
  try {
    assert.equal(cardsOpen(g), true);
    g.hero.cards = {};
    assert.equal(cardsOpen(g), false, 'nothing held');
  } finally {
    HIGH_CITY.on = false;
  }
});

test('6. each royal’s crest and card in its own colours: its field’s, none of another’s field; no cyan (what glows on a friend) in either', () => {
  const colours = (sp: ReturnType<typeof royalCrest>): Set<string> => {
    const p = paintingOf(sp);
    const out = new Set<string>();
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c) out.add(c.toLowerCase());
    }
    return out;
  };
  for (const r of ROYALS) {
    const crest = royalCrest(r);
    assert.equal(crest.w, 17);
    assert.equal(crest.h, 19);
    const card = royalCard(r);
    // (the art chat's card: 52 x 34 picture pixels, two to the game's pixel)
    assert.equal(paintingOf(card).w, 52);
    assert.equal(paintingOf(card).h, 34);
    for (const [what, sp] of [['crest', crest], ['card', card]] as const) {
      const cs = colours(sp);
      // (the card's colours as the art chat's places are: dulled under the words', art/act2_quiet.ts)
      const tone = (c: string): string[] => [c.toLowerCase(), quietHex(c).toLowerCase()];
      const own = ROYAL_LOOK[r].field.flatMap(tone);
      assert.ok(own.some((c) => cs.has(c)), `${r}'s ${what}: its own field`);
      for (const o of ROYALS) {
        if (o === r) continue;
        const theirs = ROYAL_LOOK[o].field.flatMap(tone).filter((c) => !own.includes(c));
        assert.ok(!theirs.some((c) => cs.has(c)), `${r}'s ${what}: none of the ${o}'s field`);
      }
      for (const c of cs) {
        const [R, G, B] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
        const mx = Math.max(R, G, B);
        const mn = Math.min(R, G, B);
        const hue = mx === mn ? 0 : mx === R ? (60 * ((G - B) / (mx - mn)) + 360) % 360 : mx === G ? 60 * ((B - R) / (mx - mn)) + 120 : 60 * ((R - G) / (mx - mn)) + 240;
        assert.ok(!(hue >= 160 && hue <= 205 && mx > 0 && (mx - mn) / mx > 0.2), `${r}'s ${what}: ${c} is cyan`);
      }
    }
  }
});

test('on floor 16, laid: a share of its packs touched, each pack by one royal, all of it; none a lair’s or the boss; one dying drops its card', () => {
  HIGH_CITY.on = true;
  try {
    let packs = 0;
    let touched = 0;
    const by: Record<string, number> = {};
    for (const seed of [3, 4, 9, 11, 17, 23]) {
      const g = new Game('warrior', seed);
      g.depth = 16;
      g.cleared = 15;
      g.wayDepth = 16;
      g.enterDungeon();
      assert.equal(g.level.land?.kind, 'swangardens');
      const of = new Map<number, Set<string>>();
      for (const m of g.monsters) {
        if (m.boss) assert.equal(m.royal, undefined, 'never the boss');
        if (m.boss) continue;
        const s = of.get(m.packId) ?? new Set<string>();
        s.add(m.royal ?? '-');
        of.set(m.packId, s);
      }
      for (const [, s] of of) {
        packs++;
        assert.equal(s.size, 1, 'a pack touched all of it, by one royal, or none of it');
        const r = [...s][0];
        if (r !== '-') {
          touched++;
          by[r] = (by[r] ?? 0) + 1;
        }
      }
      // (one touched dying: its card on the floor)
      const m = g.monsters.find((q) => q.royal && !q.boss);
      if (m) {
        const was = g.drops.filter((d) => d.kind === 'card').length;
        g.kill(m);
        const cards = g.drops.filter((d) => d.kind === 'card');
        assert.equal(cards.length, was + 1, 'its card dropped');
        assert.equal(cards[cards.length - 1].royal, m.royal);
      }
    }
    const share = touched / packs;
    assert.ok(share > ROYAL_TUNE.touched * 0.5 && share < ROYAL_TUNE.touched * 1.6, `${touched} of ${packs} packs touched`);
    assert.ok((by.princess ?? 0) > (by.king ?? 0), `the Princess's more often than the King's: ${JSON.stringify(by)}`);
  } finally {
    HIGH_CITY.on = false;
  }
});
