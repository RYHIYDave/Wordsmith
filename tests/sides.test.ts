// The town's services beside the inventory (Version 14.3): what can be checked without a screen.
//
// The owner, 5 Oct 2026: "Vendors, stash, and lexicon would take up the left side so you would
// have access to your inventory on the right side". Each service has the half of the screen the
// game is seen in when the inventory is open alone (gameRect), which is some 240 game pixels
// wide on every screen. Here: that what each must show has room there, on each screen the game
// is played on. (How things change hands between the two halves is played with a mouse and
// with fingers in tools/scenarios/town.mjs.)
//   run: tsx --test tests/sides.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { TUNE, WORDS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { WORD_IDS } from '../src/game/types';
import type { Limit } from '../src/game/types';
import { gameRect, invRect } from '../src/ui/inventory';
import { lexLayout, wordPage } from '../src/ui/lexicon';
import { CELL, PITCH } from '../src/ui/panels';
import { CARD_ROOM, SIDE_M, sideBody } from '../src/ui/town';

/** The screens the game is played on, in game pixels: a PC, a phone held sideways, a phone held upright (the narrow layout). */
const SCREENS: { name: string; w: number; h: number; touch: boolean }[] = [
  { name: 'a PC', w: 480, h: 270, touch: false },
  { name: 'a phone held sideways', w: 507, h: 234, touch: true },
  { name: 'a phone held upright', w: 293, h: 633, touch: true },
];

test('a service has the part of the screen the inventory leaves: side by side, or over it on a phone held upright', () => {
  for (const s of SCREENS) {
    const side = gameRect(s.w, s.h);
    const inv = invRect(s.w, s.h);
    assert.equal(side.w * side.h + inv.w * inv.h, s.w * s.h, `${s.name}: the two cover the screen between them`);
    if (s.h > s.w) {
      assert.deepEqual([side.x, side.y, side.w], [0, 0, s.w], `${s.name}: the service is across the top`);
      assert.equal(inv.y, side.h, `${s.name}: and the inventory under it`);
    } else {
      assert.deepEqual([side.x, side.y, side.h], [0, 0, s.h], `${s.name}: the service is on the left`);
      assert.equal(inv.x, side.w, `${s.name}: and the inventory on its right`);
    }
    assert.ok(side.w >= 236, `${s.name}: a service has at least the width the inventory is laid out for (${side.w})`);
  }
});

test('the vendor\'s shelves and the stash go into their half, with room under them to read a piece in', () => {
  const g = new Game('warrior', 5);
  g.enterTown();
  assert.equal(g.shop.length, 10, 'what is for sale is one row of ten');
  for (const s of SCREENS) {
    const side = sideBody(gameRect(s.w, s.h), s.w, s.h);
    const fit = Math.floor((side.w - 2 * SIDE_M + 2) / PITCH);
    assert.ok(fit >= 10, `${s.name}: ten cells go in a row (${fit})`);
    const head = 2 + (s.touch ? 22 : 16) + 2;
    // the vendor: a row for sale, and three rows for what was sold on this visit
    assert.equal(TUNE.soldKept, 30);
    const vendor = head + (8 + PITCH + 2) + (8 + 3 * PITCH + 2);
    assert.ok(side.h - vendor >= 96, `${s.name}: under the vendor's shelves there is room to read a piece (${side.h - vendor})`);
    // the stash: nine to a row
    const rows = Math.ceil(TUNE.stashSize / 9);
    const stash = head + 8 + rows * PITCH + 2;
    assert.ok(side.h - stash >= 96, `${s.name}: under the stash (${rows} rows) there is room to read a piece (${side.h - stash})`);
  }
});

test('the Lexicon in its half: rows of rune stones, the page, and the shelf of kept words, one under another', () => {
  for (const s of SCREENS) {
    const side = gameRect(s.w, s.h);
    const body = sideBody(side, s.w, s.h);
    // (where the inventory lies under the service, the foot of the service's half is left to what is read)
    assert.equal(body.h, s.h > s.w ? side.h - CARD_ROOM : side.h, s.name);
    const lay = lexLayout(body, s.touch);
    // (thirteen words, since Version 19.3: in one row where they fit, else in rows as even as can be)
    assert.ok(lay.perRow * lay.rows >= WORD_IDS.length && lay.perRow * (lay.rows - 1) < WORD_IDS.length, `${s.name}: every word has its place, and no row is empty`);
    assert.ok(lay.x0 + (lay.perRow - 1) * lay.pitch + CELL <= side.x + side.w - SIDE_M, `${s.name}: every word's stone is inside the half`);
    assert.ok(lay.pitch >= CELL, `${s.name}: the stones do not overlap`);
    assert.ok(lay.bodyY + lay.rows * (CELL + 2) - 2 <= lay.pageY, `${s.name}: the page starts under the stones`);
    assert.ok(lay.pageY + lay.pageH <= lay.shelfY, `${s.name}: and ends over the shelf`);
    assert.ok(lay.keptY + CELL <= body.y + body.h, `${s.name}: the kept words are inside the part the service keeps`);
    // (since Version 19.3's second row of stones, a phone held sideways has 110: the tallest page,
    // Twin's, is 103 there, and the next test reads every page whole on every screen)
    assert.ok(lay.pageH >= 108, `${s.name}: the page has room (${lay.pageH})`);
  }
});

test('every word\'s page, with everything about it known, is written whole in the Lexicon\'s half on every screen', () => {
  const g = new Game('warrior', 5);
  const meta = g.meta;
  for (const w of WORD_IDS) meta.known[w] = { found: true, front: true, behind: true, gear: true, dungeon: true };
  for (const limit of ['cooldown', 'mana'] as Limit[]) {
    meta.limit = limit;
    for (const s of SCREENS) {
      const lay = lexLayout(sideBody(gameRect(s.w, s.h), s.w, s.h), s.touch);
      for (const w of WORD_IDS) {
        const page = wordPage(meta, w, lay.bw, false, true);
        assert.equal(page.parts.length, 4, 'what it is; on an attack; on gear; on a dungeon');
        const tall = page.nameH + page.parts.reduce((a, p) => a + p.gap + p.h, 0);
        assert.ok(tall - 1 <= lay.pageH, `${s.name}, ${limit}: ${WORDS[w].name}'s page is ${tall} tall and has ${lay.pageH}`);
        for (const p of page.parts) for (const r of p.rows) assert.ok(r.text.length > 0, 'no empty line');
      }
    }
  }
});

test('a page with nothing discovered says "Undiscovered" under each heading, and is shorter', () => {
  const g = new Game('warrior', 5);
  const meta = g.meta;
  meta.known.fire = { found: true, front: false, behind: false, gear: false, dungeon: false };
  const bare = wordPage(meta, 'fire', 224, false, true);
  const text = bare.parts.flatMap((p) => p.rows.map((r) => r.text)).join(' | ');
  assert.equal(text.split('Undiscovered.').length - 1, 4, text);
  meta.known.fire = { found: true, front: true, behind: true, gear: true, dungeon: true };
  const full = wordPage(meta, 'fire', 224, false, true);
  const h = (p: typeof bare): number => p.parts.reduce((a, q) => a + q.gap + q.h, 0);
  assert.ok(h(bare) < h(full));
  // (on the starting screen's wider book, what a word may become on gear has a line to a slot)
  const wide = wordPage(meta, 'fire', 340, true, false);
  assert.ok(wide.parts[2].rows.length >= full.parts[2].rows.length);
  assert.equal(wide.nameH, 20);
});
