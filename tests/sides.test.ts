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
import { wordPage } from '../src/ui/lexicon';
import { LEX28, LEX_PAGES, lex28Layout } from '../src/ui/lexicon28';
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

test('the Lexicon in its half: its five tabs, the open page\'s row of rune stones, the page, and the shelf of kept words, one under another', () => {
  // (THE LEXICON IN PAGES, the game's own since the ten new words went live, 11 Nov 2026: ui/lexicon28.ts, the way 'groups'; his
  // pick in the art chat, 9 Nov, “Categorize them into pages”, “By what they do”. Until then: every word's stone in rows across
  // the top, ui/lexicon.ts lexLayout, which with 28 words left a page 88 game pixels on a phone held sideways.)
  assert.equal(LEX28.way, 'groups');
  assert.deepEqual(LEX_PAGES.flatMap((q) => [...q.words]).sort(), [...WORD_IDS].sort(), 'every word is on one page');
  for (const s of SCREENS) {
    const side = gameRect(s.w, s.h);
    const body = sideBody(side, s.w, s.h);
    // (where the inventory lies under the service, the foot of the service's half is left to what is read)
    assert.equal(body.h, s.h > s.w ? side.h - CARD_ROOM : side.h, s.name);
    LEX_PAGES.forEach((pg, k) => {
      const lay = lex28Layout(body, s.touch, 'groups', pg.words[0]);
      assert.equal(lay.tab, k, `${s.name}: a word opens its own page`);
      const tabs = lay.tabs ?? [];
      assert.equal(tabs.length, LEX_PAGES.length, `${s.name}: a tab for each page`);
      tabs.forEach((t, i) => {
        assert.ok(t.h >= 18 && t.w >= 18, `${s.name}: tab ${i} can be pressed with a finger (${t.w} by ${t.h})`);
        assert.ok(t.x >= side.x + SIDE_M && t.x + t.w <= side.x + side.w - SIDE_M, `${s.name}: tab ${i} is inside the half`);
        if (i > 0) assert.ok(tabs[i - 1].x + tabs[i - 1].w < t.x, `${s.name}: the tabs do not overlap`);
      });
      assert.equal(lay.cells.length, pg.words.length, `${s.name}: the open page's stones, every one`);
      lay.cells.forEach((c, i) => {
        assert.ok(c.r.x + CELL <= side.x + side.w - SIDE_M, `${s.name}, ${pg.name}: every word's stone is inside the half`);
        assert.ok(c.r.y >= tabs[0].y + tabs[0].h, `${s.name}, ${pg.name}: the stones are under the tabs`);
        if (i > 0) assert.ok(lay.cells[i - 1].r.x + CELL <= c.r.x, `${s.name}, ${pg.name}: the stones do not overlap`);
        assert.ok(c.r.y + CELL <= lay.page.y, `${s.name}, ${pg.name}: the page starts under the stones`);
      });
      assert.ok(lay.page.y + lay.page.h <= lay.shelfY, `${s.name}: and ends over the shelf`);
      assert.ok(lay.keptY + CELL <= body.y + body.h, `${s.name}: the kept words are inside the part the service keeps`);
      // (the longest pages, Reaping's and Mirroring's with every use known, are 109 on a phone held sideways: the next test reads
      // every page whole on every screen)
      assert.ok(lay.page.h >= 108, `${s.name}: the page has room (${lay.page.h})`);
    });
  }
});

test('every word\'s page, with everything about it known, is written whole in the Lexicon\'s half on every screen', () => {
  const g = new Game('warrior', 5);
  const meta = g.meta;
  for (const w of WORD_IDS) meta.known[w] = { found: true, front: true, behind: true, gear: true, dungeon: true };
  for (const limit of ['cooldown', 'mana'] as Limit[]) {
    meta.limit = limit;
    for (const s of SCREENS) {
      const body = sideBody(gameRect(s.w, s.h), s.w, s.h);
      for (const w of WORD_IDS) {
        // (its own page of the Lexicon's five, open on it)
        const lay = lex28Layout(body, s.touch, 'groups', w);
        assert.ok(lay.cells.some((c) => c.w === w), `${s.name}: ${WORDS[w].name}'s stone is on the page it opens`);
        const page = wordPage(meta, w, lay.page.w, false, true);
        assert.equal(page.parts.length, 4, 'what it is; on an attack; on gear; on a dungeon');
        const tall = page.nameH + page.parts.reduce((a, p) => a + p.gap + p.h, 0);
        assert.ok(tall - 1 <= lay.page.h, `${s.name}, ${limit}: ${WORDS[w].name}'s page is ${tall} tall and has ${lay.page.h}`);
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
