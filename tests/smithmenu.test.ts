// The wordsmith's start screen (ui/panels.ts, smithLayout): where the picture, the name of the
// game and the buttons go, on every screen the game is played on. What can be checked without a
// screen. (The picture itself is art/title_smith.ts; that the buttons can be pressed is played
// in the scratchpad's smith_sizes.mjs and smith_upright.mjs until the screen is switched on.)
//
// The owner, 5 Oct 2026 (18:09): "I'd like it to be the full screen with the menus along the
// bottom".
//   run: tsx --test tests/smithmenu.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SMITH_H, SMITH_LIP, SMITH_SAFE, SMITH_W } from '../src/art/title_smith';
import { SMITH2_H, SMITH2_HEAD_TOP, SMITH2_LIFT, SMITH2_LIP, SMITH2_W } from '../src/art/title_smith2';
import { textWidth } from '../src/engine/font';
import { SMITH_MOST, SMITH_UNDER, smithLayout } from '../src/ui/panels';

/** The two pictures the screen may be laid out for: the first painting (a bust behind his table), and the one seen from the floor. */
const PICTURES: { name: string; w: number; h: number; lip: number; lift: number; headTop: number }[] = [
  { name: 'the first painting', w: SMITH_W, h: SMITH_H, lip: SMITH_LIP, lift: 38, headTop: SMITH_SAFE.top },
  { name: 'from the floor', w: SMITH2_W, h: SMITH2_H, lip: SMITH2_LIP, lift: SMITH2_LIFT, headTop: SMITH2_HEAD_TOP },
];

const NAME_W = textWidth('WORDSMITH');

/** The screens the game is played on, in game pixels, and some awkward ones. */
const SCREENS: { name: string; w: number; h: number }[] = [
  { name: 'a PC', w: 480, h: 270 },
  { name: 'a phone held sideways', w: 507, h: 234 },
  { name: 'a short wide window', w: 480, h: 200 },
  { name: 'a small old phone held sideways', w: 379, h: 214 },
  { name: 'the tallest wide screen', w: 600, h: 337 },
  { name: 'a phone held upright', w: 293, h: 633 },
  { name: 'an older phone held upright', w: 270, h: 480 },
  { name: 'a tablet held upright', w: 308, h: 410 },
];

/** The menu has three or four buttons; the options five to seven. */
const PAGES: { menu: boolean; count: number }[] = [
  { menu: true, count: 3 },
  { menu: true, count: 4 },
  { menu: false, count: 5 },
  { menu: false, count: 6 },
  { menu: false, count: SMITH_MOST },
];

test('every button is on the screen, and no two overlap', () => {
  for (const pic of PICTURES) {
    for (const s of SCREENS) {
      for (const pg of PAGES) {
        const lay = smithLayout(s.w, s.h, pg.menu, pg.count, NAME_W, pic);
        assert.equal(lay.rects.length, pg.count);
        lay.rects.forEach((r, i) => {
          const what = `${pic.name}, ${s.name}, ${pg.count} buttons, button ${i}`;
          assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= s.w && r.y + r.h <= s.h, `${what}: on the screen`);
          assert.ok(r.w >= 84 && r.h >= 22, `${what}: big enough for a thumb (${r.w} x ${r.h})`);
          for (let j = 0; j < i; j++) {
            const q = lay.rects[j];
            assert.ok(r.x >= q.x + q.w || q.x >= r.x + r.w || r.y >= q.y + q.h || q.y >= r.y + r.h, `${what}: clear of button ${j}`);
          }
        });
      }
    }
  }
});

test('the picture is in the same place on every page: it must not jump when OPTIONS is pressed', () => {
  for (const pic of PICTURES) {
    for (const s of SCREENS) {
      const first = smithLayout(s.w, s.h, true, 3, NAME_W, pic);
      for (const pg of PAGES) {
        const lay = smithLayout(s.w, s.h, pg.menu, pg.count, NAME_W, pic);
        assert.equal(lay.oy, first.oy, `${pic.name}, ${s.name}, ${pg.count} buttons`);
        assert.equal(lay.lift, first.lift, `${pic.name}, ${s.name}, ${pg.count} buttons`);
      }
    }
  }
});

test('his head and the name of the game are on the screen, the name over his head', () => {
  for (const pic of PICTURES) {
    for (const s of SCREENS) {
      const what = `${pic.name}, ${s.name}`;
      const lay = smithLayout(s.w, s.h, true, 4, NAME_W, pic);
      const headTop = lay.oy + pic.headTop;
      const lip = lay.oy + pic.lip;
      assert.equal(lip, s.h - lay.lift, what);
      assert.ok(lay.lift <= pic.lift || s.h > s.w, `${what}: the table's edge is no higher than the picture wants it`);
      assert.ok(lay.nameY >= 3, `${what}: the name is on the screen`);
      // (a screen too short for him, the name and the picture's own lift puts the table lower; at
      // the very shortest the name may lie on the crown of his head, which is in the dark: never
      // as low as his brow)
      const roomy = s.h >= pic.lip - pic.headTop + 9 * 2 + 6 + 26;
      const over = roomy ? 2 : 14;
      assert.ok(lay.nameY + 9 * lay.big <= headTop + over, `${what}: and ends at his head, not on his face (${lay.nameY + 9 * lay.big} against ${headTop})`);
      assert.ok(headTop - (lay.nameY + 9 * lay.big) <= 40, `${what}: and is near him, not adrift (${headTop - (lay.nameY + 9 * lay.big)} above)`);
      assert.ok(NAME_W * lay.big <= s.w - 12, `${what}: and fits across`);
      // the picture covers the screen from its top down to the buttons, or sinks into its own dark first
      assert.ok(lay.oy + pic.h >= s.h || lay.oy + pic.h >= lip + 40, `${what}: the table has a front under its edge`);
      assert.ok(pic.w >= s.w, `${what}: the picture is as wide as the screen`);
    }
  }
});

test('a wide screen: the menu is one row along the bottom, under the table\'s edge', () => {
  for (const pic of PICTURES) {
    for (const s of SCREENS.filter((q) => q.w >= q.h * 1.3)) {
      for (const count of [3, 4]) {
        const lay = smithLayout(s.w, s.h, true, count, NAME_W, pic);
        const lip = s.h - lay.lift;
        assert.equal(lay.per, count, `${pic.name}, ${s.name}`);
        for (const r of lay.rects) {
          assert.equal(r.y, lay.rects[0].y, `${pic.name}, ${s.name}: one row`);
          assert.ok(r.y >= lip, `${pic.name}, ${s.name}: under the table's edge`);
          assert.ok(r.y + r.h >= s.h - 4, `${pic.name}, ${s.name}: along the bottom`);
        }
      }
    }
  }
});

test('held upright: a column that hangs under the table and never stands on him, where the screen is tall enough for it', () => {
  for (const pic of PICTURES) {
    for (const s of SCREENS.filter((q) => q.h > q.w)) {
      for (const pg of PAGES) {
        const what = `${pic.name}, ${s.name}, ${pg.count} buttons`;
        const lay = smithLayout(s.w, s.h, pg.menu, pg.count, NAME_W, pic);
        const lip = s.h - lay.lift;
        const tall = s.h >= pic.lip - pic.headTop + 24 + SMITH_UNDER + SMITH_MOST * 28 + 2;
        if (tall) {
          assert.equal(lay.per, 1, `${what}: a column`);
          assert.equal(lay.rects[0].y, lip + SMITH_UNDER, `${what}: it hangs from the table`);
        }
        // however short the screen, no button is over his face
        const faceBottom = lay.oy + pic.headTop + 60;
        for (const r of lay.rects) assert.ok(r.y >= faceBottom, `${what}: clear of his face (${r.y} against ${faceBottom})`);
      }
    }
  }
});
