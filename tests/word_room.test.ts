// EVERY WORD IN REACH IN THE INVENTORY (ui/inventory.ts WORD_HALF, and WORD_ROOM at the town's services; both off until his
// yes to the game's pictures of them). The owner, 23 Oct 2026, 11:06 (Pacific): “look at the current UI for words and find a
// way to manage them better in the inventory system.  Once you get more than a certain number of unique words, they become
// inaccessible.  I want them at the ready to quickly swap in and out on attacks, or craft on gear, but the tiny area
// they’re currently has run out of room now that we’ve added a bunch more words.” Shown the two ways, by 11:37: “Words on
// the other half”, then “I like the second picture with the runes”.
//
// What is held here:
//   - on every screen the game is played on, the words' panel over the game's half has a place for every word there is
//     (every word and every melded one, Rank II's too), as its rune stone, inside the panel, none over another;
//   - there they are rune stones from the first, even where their names would fit;
//   - at a service (whose half it is), the bottom of the panel turned to ALL has a place for every word, beside its tile;
//   - the line of words over the bag is as it was without the switches.
//   run: tsx --test tests/word_room.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { wordIds } from '../src/game/melds';
import { CELL, PITCH } from '../src/ui/panels';
import { INV_MIN_W, SWAP_W, WORD_HALF, WORD_ROOM, gameRect, halfRoom, invRect, layPouch } from '../src/ui/inventory';

const ALL = wordIds();
const SCREENS = [
  { name: 'a PC', w: 480, h: 270 },
  { name: 'a phone held sideways', w: 507, h: 234 },
  { name: 'a small old phone held sideways', w: 379, h: 214 },
  { name: 'a phone held upright', w: 293, h: 633 },
  { name: 'an older phone held upright', w: 270, h: 480 },
  { name: 'a tablet held upright', w: 308, h: 410 },
];

test('the switches, off until his yes to the game\'s pictures', () => {
  assert.equal(WORD_HALF.on, false);
  assert.equal(WORD_ROOM.on, false);
  assert.ok(ALL.length >= 38, `${ALL.length} words there are`);
});

test('over the game\'s half, on every screen: every word there is, as its rune stone, inside the panel', () => {
  for (const s of SCREENS) {
    const room = halfRoom(gameRect(s.w, s.h));
    const lay = layPouch(ALL, () => 6, room.w, room.lines, 3, true);
    assert.equal(lay.hidden, 0, `${s.name}: every word has a place (${room.w} wide, ${room.lines} lines)`);
    assert.equal(lay.stones, true, `${s.name}: as rune stones`);
    assert.ok(lay.lines <= room.lines, s.name);
    for (const c of lay.cells) assert.ok(c.x >= 0 && c.x + c.w <= room.w && c.line < room.lines, `${s.name}: ${c.word} inside`);
    for (let i = 1; i < lay.cells.length; i++) {
      const a = lay.cells[i - 1];
      const b = lay.cells[i];
      assert.ok(b.line > a.line || b.x >= a.x + a.w, `${s.name}: ${b.word} clear of ${a.word}`);
    }
  }
});

test('rune stones from the first, even where the names would fit', () => {
  const few = ALL.slice(0, 4);
  const named = layPouch(few, () => 1, 300, 6, 3);
  assert.equal(named.stones, false, 'the line of words over the bag writes four words out');
  const runes = layPouch(few, () => 1, 300, 6, 3, true);
  assert.equal(runes.stones, true);
  for (const c of runes.cells) assert.equal(c.w, CELL);
});

test('at a service, the bottom turned to ALL has a place for every word, beside its tile', () => {
  // (the narrowest panel, on a phone held sideways: its bottom is the line of words and the bag's three rows)
  const bodyW = INV_MIN_W - 12;
  const bagH = 3 * PITCH - 2;
  const stripH = 7 + (1 * 22 - 2) + 3 + 7 + bagH + 2;
  const lines = Math.floor((stripH - 7) / 22);
  const lay = layPouch(ALL, () => 6, bodyW - SWAP_W - 3, lines, 3);
  assert.equal(lay.hidden, 0, `${lines} lines, ${bodyW - SWAP_W - 3} wide`);
  assert.ok(invRect(507, 234).w >= INV_MIN_W);
});
