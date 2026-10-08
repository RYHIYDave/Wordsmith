// The inventory in pages (Version 13.1): what can be checked without a screen.
//
// The owner, 4 Oct 2026: "The inventory should have a few different pages, stats on one to show
// attributes and defenses. Your attacks and damage info on another, and gear on a third. Your gear
// should be arranged as they would be placed on the character, like Diablo or path of exile. Your
// inventory should be persistent at the bottom as you flip through the different pages".
//
// Here: which page it opens on; that every thing worn has a slot of its own round the hero, where
// it is worn; how the spare words are laid out in the room they have; and the rules the pages
// brought with them (a ring put on the finger it is dragged to, a piece taken off into the cell it
// is dragged to, pieces moved about in the bag, an attack's damage as a pair of numbers).
// The thumbs and the mouse are in the browser playtest: tools/scenarios/pages.mjs.
//   run: tsx --test tests/inventory.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { SKILLS, SLOT_LEVELS, SLOT_OPENS, socketCount } from '../src/game/defs';
import { Game } from '../src/game/game';
import { rollItem } from '../src/game/items';
import { EQUIP_SLOTS, WORD_IDS } from '../src/game/types';
import type { EquipSlot, Item, WordId } from '../src/game/types';
import { COMPARE, DOLL_ROWS, DOLL_SLOT, DOLL_W, INV_MAX_H, INV_MAX_W, INV_MIN_H, INV_MIN_W, INV_PAGES, dollAt, dollHeight, gameRect, invRect, layPouch, newInvUi, resetInvUi, wornFor } from '../src/ui/inventory';
import { CELL, itemCard } from '../src/ui/panels';
import { nameLines, nameParts, namePartsWidth, tileWidth } from '../src/ui/words';

test('it opens on GEAR; from an attack, or with a word in hand, on ATTACKS', () => {
  assert.deepEqual(INV_PAGES, ['gear', 'attacks', 'stats']);
  const st = newInvUi();
  assert.equal(st.page, 'gear');
  resetInvUi(st);
  assert.equal(st.page, 'gear', 'the INVENTORY button');
  resetInvUi(st, null, 1);
  assert.equal(st.page, 'attacks', 'the slow attack was pressed on the game screen');
  assert.equal(st.focus, 1, 'and it is the attack read out');
  resetInvUi(st);
  assert.equal(st.page, 'gear', 'and the INVENTORY button again: GEAR again');
  assert.equal(st.focus, 1, 'the attack last touched is remembered');
  resetInvUi(st, 'fire');
  assert.equal(st.page, 'attacks', 'a word has just been found: it is in hand, and the attacks are where it goes');
  assert.equal(st.word, 'fire');
  // nothing is left in hand from the last time
  st.sel = { kind: 'bag', i: 2 };
  st.pending = { word: 'fire', sel: { kind: 'bag', i: 2 } };
  st.carry = { sel: { kind: 'bag', i: 2 }, x0: 0, y0: 0, moving: true, was: false };
  st.tab = { page: 'stats', t: 0.2 };
  resetInvUi(st);
  assert.equal(st.word, null);
  assert.equal(st.sel, null);
  assert.equal(st.pending, null);
  assert.equal(st.carry, null);
  assert.equal(st.tab, null);
});

test('every thing worn has its own slot beside the hero: two columns, and nothing over the head', () => {
  // (the rows stand closer together on a phone held sideways, where the page is 102 game pixels tall)
  for (const pitch of [20, 21, 22]) {
    const at = (s: EquipSlot): { x: number; y: number } => ({ x: dollAt(s, pitch)[0], y: dollAt(s, pitch)[1] });
    const tall = dollHeight(pitch);
    for (const s of EQUIP_SLOTS) {
      const p = at(s);
      assert.ok(p.x >= 0 && p.y >= 0 && p.x + CELL <= DOLL_W && p.y + CELL <= tall, `${s} lies inside the block`);
    }
    // no slot lies on another
    for (let i = 0; i < EQUIP_SLOTS.length; i++) for (let j = i + 1; j < EQUIP_SLOTS.length; j++) {
      const a = at(EQUIP_SLOTS[i]);
      const b = at(EQUIP_SLOTS[j]);
      assert.ok(a.x + CELL <= b.x || b.x + CELL <= a.x || a.y + CELL <= b.y || b.y + CELL <= a.y, `${EQUIP_SLOTS[i]} and ${EQUIP_SLOTS[j]} do not overlap`);
    }
    // The owner, 5 Oct 2026: "the helmet being alone at the top above the sprite is kinda weird".
    // Every slot is in one of two columns, five to a column, and the hero (twice their size in
    // the game: 44 wide) stands between the columns with nothing over the head or under the feet.
    const left = EQUIP_SLOTS.filter((s) => at(s).x === 0);
    const right = EQUIP_SLOTS.filter((s) => at(s).x === DOLL_W - CELL);
    assert.equal(left.length, DOLL_ROWS);
    assert.equal(right.length, DOLL_ROWS);
    assert.ok(DOLL_W - 2 * CELL >= 44 + 12, 'there is room for the hero between them');
    // down each column in the order of the body, a pair to a row: head and neck; chest and waist;
    // the two hands' weapons, a side each; hands and feet; the two rings
    const rows: [EquipSlot, EquipSlot][] = [['helm', 'amulet'], ['chest', 'belt'], ['mainhand', 'offhand'], ['gloves', 'boots'], ['ring1', 'ring2']];
    rows.forEach(([a, b], i) => {
      assert.equal(at(a).y, i * pitch, `${a} is in row ${i}`);
      assert.equal(at(b).y, i * pitch, `${b} is in row ${i}`);
      assert.equal(at(a).x, 0, `${a} is on the left`);
      assert.equal(at(b).x, DOLL_W - CELL, `${b} is on the right`);
    });
    assert.equal(tall, 4 * pitch + CELL);
  }
  assert.equal(Object.keys(DOLL_SLOT).length, EQUIP_SLOTS.length);
});

test('the inventory takes half the screen: the right half, or the bottom half of a phone held upright', () => {
  // The owner, 5 Oct 2026: "Can we have it only cover half of the screen? ... the inventory is
  // open to the right side of the screen and ... the player in the left side of the screen."
  const both = (W: number, H: number): { inv: ReturnType<typeof invRect>; game: ReturnType<typeof gameRect> } => {
    const inv = invRect(W, H);
    const game = gameRect(W, H);
    // the two parts are the whole screen, and neither lies on the other
    assert.equal(inv.w * inv.h + game.w * game.h, W * H, `${W} x ${H}: the two parts are the whole screen`);
    assert.ok(game.x === 0 && game.y === 0);
    assert.ok(inv.x + inv.w === W && inv.y + inv.h === H, 'the inventory is against the right and the bottom');
    return { inv, game };
  };
  // a phone held sideways, and a PC: the right half
  assert.deepEqual(both(507, 234).inv, { x: 254, y: 0, w: 253, h: 234 });
  assert.deepEqual(both(507, 234).game, { x: 0, y: 0, w: 254, h: 234 });
  assert.deepEqual(both(480, 270).inv, { x: 240, y: 0, w: 240, h: 270 });
  // a phone held upright (the narrow layout): the bottom of the screen, as much of the half as it has a use for
  assert.deepEqual(both(293, 633).inv, { x: 0, y: 361, w: 293, h: INV_MAX_H });
  assert.deepEqual(both(293, 633).game, { x: 0, y: 0, w: 293, h: 361 });
  assert.equal(both(293, 500).inv.h, 250, 'and never more than half');
  // never narrower than it is laid out for, where the screen has that much
  assert.equal(both(400, 300).inv.w, INV_MIN_W);
  assert.equal(both(300, 220).inv.w, INV_MIN_W);
  assert.equal(both(200, 150).inv.w, 200, 'a screen smaller than that: all of it');
  // on a very wide screen the game keeps more than half
  assert.equal(both(800, 300).inv.w, INV_MAX_W);
  // every screen the game is played on gives the panel the room it is laid out for
  for (const [W, H] of [[507, 234], [480, 270], [293, 633], [640, 360], [568, 320]] as const) {
    const r = invRect(W, H);
    assert.ok(r.w >= INV_MIN_W && r.h >= INV_MIN_H, `${W} x ${H}: the panel is ${r.w} x ${r.h}`);
  }
});

test('the spare words are laid out in lines, in their order, each inside the room it has', () => {
  const count = (w: WordId): number => (w === 'fire' ? 2 : 1);
  const some: WordId[] = ['power', 'swift', 'twin'];
  const one = layPouch(some, count, 400, 3, 3);
  assert.equal(one.lines, 1);
  assert.equal(one.bare, false);
  assert.equal(one.hidden, 0);
  assert.deepEqual(one.cells.map((c) => c.word), some);
  assert.equal(one.cells[0].x, 0);
  assert.equal(one.cells[1].x, tileWidth('power', 'name') + 3);
  // every word there is, in a narrower room: several lines, nothing beyond the edge, nothing on anything else
  const all = layPouch(WORD_IDS, count, 222, 6, 3);
  assert.ok(all.lines > 1);
  assert.equal(all.cells.length, WORD_IDS.length);
  assert.deepEqual(all.cells.map((c) => c.word), [...WORD_IDS]);
  for (const c of all.cells) assert.ok(c.x >= 0 && c.x + c.w <= 222, `${c.word} lies inside the line`);
  for (let i = 1; i < all.cells.length; i++) {
    const a = all.cells[i - 1];
    const b = all.cells[i];
    assert.ok(b.line > a.line || b.x >= a.x + a.w + 3, `${b.word} comes after ${a.word}`);
    assert.ok(b.line === a.line || b.x === 0, 'a new line begins at its left edge');
  }
  // a word with a count is wider by its count
  assert.ok(tileWidth('fire', 'name', 2) > tileWidth('fire', 'name', 1));
});

test('with more words than there is room for, the tiles lose their rune stones; and then say how many are left out', () => {
  const count = (): number => 6;
  // room that holds them with their rune stones
  const roomy = layPouch(WORD_IDS, count, 309, 3, 3);
  assert.equal(roomy.bare, false, 'nine words, six of each, fit a phone held sideways as they are');
  assert.equal(roomy.hidden, 0);
  // one line fewer: bare
  const full = layPouch(WORD_IDS, count, 309, roomy.lines - 1, 3);
  if (full.hidden === 0) assert.equal(full.bare, true);
  for (const c of full.cells) assert.ok(c.line < roomy.lines - 1);
  // no room to speak of: what does not fit is counted, never drawn over the edge
  const tight = layPouch(WORD_IDS, count, 120, 1, 3);
  assert.equal(tight.bare, true);
  assert.ok(tight.hidden > 0);
  assert.equal(tight.cells.length + tight.hidden, WORD_IDS.length);
  for (const c of tight.cells) assert.ok(c.line === 0 && c.x + c.w <= 120);
  // no words at all
  const none = layPouch([], count, 200, 3, 3);
  assert.deepEqual(none, { cells: [], lines: 1, bare: false, stones: false, hidden: 0 });
  // The half-screen inventory has one line for them on a phone held sideways (224 game pixels):
  // a full pouch is laid out as rune stones alone, each the size of a bag's cell, and every word
  // is there to be pressed.
  const line = layPouch(WORD_IDS, count, 224, 1, 3);
  assert.equal(line.stones, true);
  assert.equal(line.hidden, 0, 'all nine words fit one line as stones');
  assert.deepEqual(line.cells.map((c) => c.word), [...WORD_IDS]);
  line.cells.forEach((c, i) => {
    assert.equal(c.w, CELL);
    assert.equal(c.x, i * (CELL + 3));
    assert.equal(c.line, 0);
  });
  // a few words in that line are written out, as ever
  const few = layPouch(['fire', 'power'], () => 1, 224, 1, 3);
  assert.equal(few.stones, false);
  assert.equal(few.bare, false);
});

/** A character with room in the bag, and a piece of that kind put into a cell of it. */
function withPiece(g: Game, cell: number, slot: Item['slot'], seed: number): Item {
  const it = rollItem(4, new RNG(seed), { slot, rarity: 0 });
  g.hero.bag[cell] = it;
  return it;
}

test('a ring goes on the finger it is dragged to; anything else goes where it is worn', () => {
  const g = Game.forPractice('ranger', 3);
  const h = g.hero;
  // (the practice room's character comes dressed: both fingers are bared first)
  h.gear.ring1 = null;
  h.gear.ring2 = null;
  h.gear.helm = null;
  const a = withPiece(g, 20, 'ring', 5);
  const b = withPiece(g, 21, 'ring', 6);
  const c = withPiece(g, 22, 'ring', 7);
  // let go over the second ring's slot: it is on that finger, though the first is free
  assert.equal(g.equipFromBag(20, 'ring2'), null);
  assert.equal(h.gear.ring2, a);
  assert.equal(h.gear.ring1, null);
  assert.equal(h.bag[20], null);
  // let go anywhere else on the hero (no slot, or a slot that is not a ring's): the first free finger
  assert.equal(g.equipFromBag(21, 'helm'), null);
  assert.equal(h.gear.ring1, b);
  // on a finger that has a ring: the two change places
  assert.equal(g.equipFromBag(22, 'ring2'), null);
  assert.equal(h.gear.ring2, c);
  assert.equal(h.bag[22], a, 'the ring that was there lies where the new one lay');
  // a helmet let go over a ring's slot is still a helmet
  const helm = withPiece(g, 23, 'helm', 8);
  assert.equal(g.equipFromBag(23, 'ring1'), null);
  assert.equal(h.gear.helm, helm);
  assert.equal(h.gear.ring1, b);
});

test('a piece taken off lies in the cell it was dragged to, if that cell is empty', () => {
  const g = Game.forPractice('warrior', 3);
  const h = g.hero;
  const helm = withPiece(g, 20, 'helm', 9);
  assert.equal(g.equipFromBag(20), null);
  assert.equal(h.gear.helm, helm);
  const free = h.bag.findIndex((it) => it === null);
  assert.ok(free >= 0 && free !== 23 && h.bag[23] === null);
  assert.equal(g.unequip('helm', 23), null);
  assert.equal(h.bag[23], helm, 'it lies where it was let go');
  assert.equal(h.gear.helm, null);
  // onto a cell that is taken: the first empty one, as before
  assert.equal(g.equipFromBag(23), null);
  const taken = h.bag.findIndex((it) => it !== null);
  assert.ok(taken >= 0);
  const was = h.bag[taken];
  assert.equal(g.unequip('helm', taken), null);
  assert.equal(h.bag[taken], was, 'what lay there still lies there');
  assert.equal(h.bag[h.bag.indexOf(helm)], helm);
  assert.equal(h.bag.indexOf(helm), h.bag.findIndex((it, i) => it === helm && i !== taken));
  // and with no cell named: the first empty one
  assert.equal(g.equipFromBag(h.bag.indexOf(helm)), null);
  const first = h.bag.indexOf(null);
  assert.equal(g.unequip('helm'), null);
  assert.equal(h.bag[first], helm);
});

test('pieces are moved about in the bag: to an empty cell, or changing places with what lies there', () => {
  const g = Game.forPractice('mage', 3);
  const h = g.hero;
  const a = withPiece(g, 16, 'belt', 3);
  const b = withPiece(g, 17, 'boots', 4);
  const before = h.bag.filter((it) => it !== null).length;
  g.moveInBag(16, 23);
  assert.equal(h.bag[23], a);
  assert.equal(h.bag[16], null);
  g.moveInBag(23, 17);
  assert.equal(h.bag[17], a);
  assert.equal(h.bag[23], b, 'the two changed places');
  // onto itself, or to a cell that is not there: nothing happens, and nothing is lost
  g.moveInBag(17, 17);
  g.moveInBag(17, 99);
  g.moveInBag(-1, 3);
  assert.equal(h.bag[17], a);
  assert.equal(h.bag.filter((it) => it !== null).length, before);
});

test('an attack\'s numbers: one hit, lowest to highest, as the rules will roll it', () => {
  for (const cls of ['warrior', 'ranger', 'mage'] as const) {
    const g = Game.forPractice(cls, 3);
    const h = g.hero;
    for (let s = 0; s < 3; s++) {
      const [lo, hi] = g.hitRange(s);
      const def = SKILLS[h.skills[s].id];
      assert.ok(lo >= 1 && hi >= lo, `${def.name}: ${lo} to ${hi}`);
      // with no word on it, a hit is the weapon's damage times the attack's own share
      const k = h.skills[s].r.dmgMult * (1 + (h.d.stats.dmgPct + h.d.stats.physPct) / 100);
      assert.equal(lo, Math.max(1, Math.round(h.d.dmgMin * k)));
      assert.equal(hi, Math.max(1, Math.round(h.d.dmgMax * k)));
    }
    // what comes and goes in a fight is not in it
    const calm = g.hitRange(0);
    h.might = 40;
    assert.deepEqual(g.hitRange(0), calm);
    h.might = 0;
  }
  // a word in front that changes the hit changes the numbers
  const g = Game.forPractice('warrior', 3);
  const plain = g.hitRange(0);
  assert.equal(g.placeWord({ skill: 0, side: 'front', idx: 0 }, 'power'), null);
  const strong = g.hitRange(0);
  assert.ok(strong[1] > plain[1], `Power Strike hits harder than Strike (${plain[1]} -> ${strong[1]})`);
});

// ---------------------------------------------------------------------------------------------
// Version 13.2

test('word slots open by the list: one a side from the start, the second in front at 5 and behind at 10; a third a side is not switched on', () => {
  assert.deepEqual(SLOT_OPENS, { front: [1, 5], behind: [1, 10] }, 'the game as it is: two a side (a third at 15 and 20 is the owner\'s idea, tried only through the test hook)');
  assert.deepEqual([SLOT_LEVELS.front, SLOT_LEVELS.behind], [5, 10]);
  const at = (lv: number): string => socketCount(lv).join();
  assert.deepEqual([1, 4, 5, 9, 10, 15, 20, 99].map(at), ['1,1', '1,1', '2,1', '2,1', '2,2', '2,2', '2,2', '2,2']);
  // and with the two levels of his idea added, everything that counts slots follows
  SLOT_OPENS.front.push(15);
  SLOT_OPENS.behind.push(20);
  try {
    assert.deepEqual([1, 5, 10, 14, 15, 19, 20, 99].map(at), ['1,1', '2,1', '2,2', '2,2', '3,2', '3,2', '3,3', '3,3']);
    const g = Game.forPractice('mage', 4);
    g.hero.level = 20;
    g.refresh();
    assert.deepEqual(g.hero.skills.map((k) => [k.front.length, k.behind.length]), [[3, 3], [3, 3], [3, 3]]);
    g.hero.words.power = 1;
    assert.equal(g.placeWord({ skill: 0, side: 'front', idx: 2 }, 'power'), null, 'a word goes into a third slot');
    // switched off again, the slot closes and its word goes back to the pouch
    SLOT_OPENS.front.length = 2;
    SLOT_OPENS.behind.length = 2;
    g.refresh();
    assert.deepEqual(g.hero.skills.map((k) => [k.front.length, k.behind.length]), [[2, 2], [2, 2], [2, 2]]);
    assert.equal(g.hero.words.power, 1);
  } finally {
    SLOT_OPENS.front.length = 2;
    SLOT_OPENS.behind.length = 2;
  }
});

test('a long attack name is broken into lines that fit, a small "of" or "and" going on with the word it leads', () => {
  const def = SKILLS.volley;
  const cases: [WordId[], WordId[]][] = [
    [[], []],
    [['power'], []],
    [['lightning', 'volatile'], ['swift', 'lightning']],
    [['lightning', 'volatile', 'poison'], ['power', 'fire', 'swift']],
  ];
  for (const [front, behind] of cases) {
    const parts = nameParts(def, front, behind);
    for (const maxW of [120, 160, 220, 281, 495]) {
      const lines = nameLines(parts, maxW);
      // nothing lost, nothing reordered
      assert.deepEqual(lines.flat(), parts);
      for (const ln of lines) {
        assert.ok(ln.length > 0);
        // a line is no wider than it may be (unless it is one word that is wider all by itself)
        assert.ok(namePartsWidth(ln) <= maxW || ln.filter((p) => !p.small).length === 1, `${ln.map((p) => p.text).join(' ')}: ${namePartsWidth(ln)} in ${maxW}`);
        // no line ends on a small "of" or "and" (it would be cut off from its word)
        assert.ok(!ln[ln.length - 1].small, ln.map((p) => p.text).join(' '));
      }
      if (namePartsWidth(parts) <= maxW) assert.equal(lines.length, 1, 'what fits on one line stays on one');
    }
  }
  // the widest name the game can make today (two words in front, two behind, on any attack) is
  // a pixel wider than a phone held upright has to write on (281): LIGHTNING LEECHING WHIRLWIND of
  // SWIFTNESS and LIGHTNING. New words and a third slot a side would make many more.
  let widest = 0;
  let which = '';
  for (const id of Object.keys(SKILLS) as (keyof typeof SKILLS)[]) {
    for (const f1 of WORD_IDS) for (const f2 of WORD_IDS) for (const b1 of WORD_IDS) for (const b2 of WORD_IDS) {
      if (f1 === f2 || b1 === b2) continue;
      const parts = nameParts(SKILLS[id], [f1, f2], [b1, b2]);
      const w = namePartsWidth(parts);
      if (w > widest) { widest = w; which = parts.map((p) => p.text).join(' '); }
      if (w > 281) {
        const lines = nameLines(parts, 281);
        assert.equal(lines.length, 2, which);
        assert.ok(lines.every((ln) => namePartsWidth(ln) <= 281), which);
      }
    }
  }
  assert.ok(widest > 281, `the widest is ${widest}: "${which}"`);
});

// The owner, 5 Oct 2026, 22:02: "add a third option to pieces of gear when you examine them.
// Compare. And this should bring up your currently equipped piece. And cut the line at the bottom
// that says "this piece is better". We'll leave that to the player to decide".
// (The button itself, pressed with a mouse and with fingers: tools/scenarios/pages.mjs, 3b.)
test('COMPARE brings up what is worn where the piece would go: one piece, or none; for a ring, every ring that is on', () => {
  assert.equal(COMPARE, 'COMPARE');
  const g = Game.forPractice('warrior', 3);
  const h = g.hero;
  for (const s of EQUIP_SLOTS) if (s !== 'mainhand') h.gear[s] = null;
  const roll = (slot: 'chest' | 'helm' | 'ring', seed: number): Item => rollItem(6, new RNG(seed), { slot, rarity: 1 });
  // nothing worn there: nothing to bring up
  const chest = roll('chest', 1);
  assert.deepEqual(wornFor(g, chest), []);
  // something worn there: that piece
  const worn = roll('chest', 2);
  h.gear.chest = worn;
  assert.deepEqual(wornFor(g, chest), [worn]);
  assert.deepEqual(wornFor(g, roll('helm', 3)), [], 'and still nothing for the head');
  // a weapon: the weapon in hand
  const blade = h.gear.mainhand;
  assert.ok(blade);
  if (blade) assert.deepEqual(wornFor(g, rollItem(6, new RNG(9), { slot: 'mainhand', rarity: 1 })), [blade]);
  // a ring. No ring on: nothing. One on, either hand: that one, though the new ring would go to the bare hand.
  const ring = roll('ring', 4);
  const a = roll('ring', 5);
  const b = roll('ring', 6);
  assert.deepEqual(wornFor(g, ring), []);
  h.gear.ring1 = a;
  assert.equal(g.slotFor(ring), 'ring2', 'it would go on the bare hand');
  assert.deepEqual(wornFor(g, ring), [a], 'and the ring on the other hand is still what it is compared with');
  h.gear.ring1 = null;
  h.gear.ring2 = b;
  assert.deepEqual(wornFor(g, ring), [b]);
  // one on each hand: both, the one it would take the place of first
  h.gear.ring1 = a;
  assert.equal(g.slotFor(ring), 'ring1');
  assert.deepEqual(wornFor(g, ring), [a, b]);
});

test('nothing is left up from the last time the inventory was open', () => {
  const g = Game.forPractice('warrior', 3);
  const st = newInvUi();
  assert.equal(st.compare, null);
  const piece = rollItem(6, new RNG(1), { slot: 'chest', rarity: 1 });
  g.hero.bag[20] = piece;
  st.compare = { item: piece, n: 0, at: { x: 100, y: 100, w: 150, h: 100 } };
  resetInvUi(st);
  assert.equal(st.compare, null);
});

test('a piece\'s card says what the piece is, and gives no verdict on it: that is left to the player', () => {
  const g = Game.forPractice('warrior', 3);
  const verdict = /stronger|weaker|better|worse|upgrade|downgrade/i;
  let read = 0;
  for (let seed = 1; seed <= 60; seed++) {
    for (const slot of ['chest', 'helm', 'ring', 'mainhand', 'boots'] as const) {
      const it = rollItem(1 + (seed % 9), new RNG(seed * 7 + 1), { slot });
      for (const touch of [false, true]) {
        const lines = itemCard(g, it, touch);
        assert.equal(lines[0].text, it.name, 'its name is its first line');
        for (const l of lines) assert.ok(!verdict.test(l.text), `"${l.text}" judges the piece`);
        read++;
      }
    }
  }
  assert.ok(read >= 600);
});
