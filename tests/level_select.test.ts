// THE LEVEL SELECT (game/defs.ts LEVEL_SELECT, off until his yes). The owner, 22 Oct 2026, 14:27 (Pacific): “Can you put in a
// level selector in the options?”; asked which kind, by 14:29: “Test hero, any floor (Recommended)”, offered as: pick floor 1 to
// 15 and a class; start there with a hero levelled and geared for that floor; not saved; your real hero untouched.
//
// What is held here:
//   - off, the options are as they were (no button of it), and its page is never reached;
//   - the test hero (Game.forTrial), for every floor and class: on that floor, as if the floors before were cleared, the
//     town's waypoint leading back to it; the level a hero comes there at; his points spent; a full set of magic gear of the
//     floor's item level that he can wear; the words that can be found down to that floor; a new hero on floor 1;
//   - he has a Lexicon and stash of his own (nothing he does reaches the device's), and the device's choices go with him;
//   - with its button the options are eight: held upright they take the room the seven took, every button still big enough
//     for a thumb, and the picture does not move;
//   - the page of floors offers every floor built, each pressed opening the class cards for a test hero there.
// That the saved run is never written while he plays: tools/scenarios/level_select.mjs (main.ts).
//   run: tsx --test tests/level_select.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SMITH2_H, SMITH2_HEAD_TOP, SMITH2_LIFT, SMITH2_LIP, SMITH2_W } from '../src/art/title_smith2';
import { SMITH3_H, SMITH3_HEAD_TOP, SMITH3_LIFT, SMITH3_LIP, SMITH3_W } from '../src/art/title_smith3';
import { textWidth } from '../src/engine/font';
import { lastFloor } from '../src/game/act1';
import { CLASSES, LEVEL_SELECT, PRACTICE, wordsAt } from '../src/game/defs';
import { Game, newMeta } from '../src/game/game';
import { MODES } from '../src/game/modes';
import { CLASS_IDS, EQUIP_SLOTS } from '../src/game/types';
import { FLOOR_ROWS, SMITH_MOST, smithLayout } from '../src/ui/panels';
// @ts-ignore - node typings are not part of this project
import { readFileSync } from 'node:fs';

function switched<T>(on: boolean, run: () => T): T {
  const was = LEVEL_SELECT.on;
  LEVEL_SELECT.on = on;
  try {
    return run();
  } finally {
    LEVEL_SELECT.on = was;
  }
}

test('the switch is on (since 24.0, his yes); off, the options have no button of it', () => {
  assert.equal(LEVEL_SELECT.on, true);
  const src = readFileSync('src/ui/panels.ts', 'utf8') as string;
  // (its button comes only from floorsItem, which gives nothing while the switch is off)
  assert.ok(src.includes("return LEVEL_SELECT.on ? [{ id: 'floors', label: 'LEVEL SELECT'"), 'the button only behind the switch');
  assert.equal((src.match(/\.\.\.floorsItem\(\)/g) ?? []).length, 2, 'in both start screens\' options');
  const main = readFileSync('src/main.ts', 'utf8') as string;
  assert.ok(main.includes('if (titleUi.practice && titleUi.trial && LEVEL_SELECT.on) {'), 'and the test hero only made with it on');
});

test('the test hero, on every floor and in every class: there, levelled, his points spent, geared for it, with its words', () => {
  const last = lastFloor();
  assert.equal(last, 15);
  // (THE HIGH CITY: its floors' levels may be in ahead of its switch)
  assert.ok(LEVEL_SELECT.level.length >= last);
  for (const cls of CLASS_IDS) {
    for (let d = 1; d <= last; d++) {
      const what = `${cls}, floor ${d}`;
      const g = Game.forTrial(cls, 1000 + d, d);
      const h = g.hero;
      assert.equal(g.trial, true, what);
      if (MODES.on) assert.equal(g.mode, 'normal', `${what}: Normal, he wakes in town if he falls`);
      assert.equal(g.practice, false, `${what}: a floor, not the practice room`);
      assert.equal(g.depth, d, what);
      assert.equal(g.inDungeon, true, what);
      assert.equal(g.level.town, false, what);
      assert.equal(g.cleared, d - 1, `${what}: the floors before it cleared`);
      assert.equal(g.wayDepth, d, `${what}: the town's waypoint leads back to it`);
      assert.equal(h.level, LEVEL_SELECT.level[d - 1], what);
      assert.equal(h.pending, 0, `${what}: no points left waiting`);
      const base = CLASSES[cls].attrs;
      const spent = (h.attrs.str - base.str) + (h.attrs.dex - base.dex) + (h.attrs.int - base.int);
      if (d === 1) {
        // (floor 1: a new hero, as any begins)
        assert.equal(spent, 0, what);
        assert.equal(h.ring, false, `${what}: the ring not yet lit`);
        assert.equal(Object.values(h.words).filter((n) => n > 0).length, 0, `${what}: no words yet`);
        continue;
      }
      assert.ok(spent > 0 && h.attrs[CLASSES[cls].primary] - base[CLASSES[cls].primary] > spent / 2, `${what}: his points spent, most on his own attribute`);
      assert.equal(h.ring, true, `${what}: the ring lit`);
      for (const slot of EQUIP_SLOTS) {
        const it = h.gear[slot];
        if (slot === 'offhand') {
          if (it) assert.ok(g.useProblem(it) === null, `${what}: ${slot} wearable`);
          continue;
        }
        assert.ok(it, `${what}: ${slot} worn`);
        assert.equal(it!.rarity, 1, `${what}: ${slot} magic`);
        assert.equal(it!.ilvl, Math.min(d, h.level), `${what}: ${slot} of the floor's item level`);
        assert.equal(g.useProblem(it!), null, `${what}: ${slot} wearable`);
      }
      assert.equal(h.gear.mainhand!.weapon, CLASSES[cls].starts, `${what}: his class's own weapon`);
      for (const w of wordsAt(d)) assert.equal(h.words[w], PRACTICE.words, `${what}: ${w} in the pouch`);
      assert.equal(h.life, h.d.maxLife, `${what}: whole`);
    }
  }
  // (the city's words only from floor 11, as they are found)
  const ten = Game.forTrial('mage', 5, 10);
  const eleven = Game.forTrial('mage', 5, 11);
  assert.ok(wordsAt(11).length > wordsAt(10).length);
  for (const w of wordsAt(11)) if (!wordsAt(10).includes(w)) {
    assert.ok(!(ten.hero.words[w] > 0), `floor 10: no ${w}`);
    assert.equal(eleven.hero.words[w], PRACTICE.words, `floor 11: ${w}`);
  }
});

test('his own Lexicon and stash; the device\'s choices go with him', () => {
  const meta = newMeta();
  meta.limit = 'mana';
  meta.voice = 'female';
  meta.lexicon[Object.keys(meta.lexicon)[0] as keyof typeof meta.lexicon] = 3;
  const before = JSON.stringify(meta);
  const g = Game.forTrial('ranger', 77, 6, meta);
  assert.notEqual(g.meta, meta, 'a Lexicon and stash of his own');
  assert.equal(g.meta.limit, 'mana');
  assert.equal(g.voice, 'female');
  // (what he does there does not reach the device's)
  g.meta.stash[0] = g.hero.gear.helm;
  g.meta.bestDepth = 99;
  assert.equal(JSON.stringify(meta), before, 'the device\'s as it was');
});

/** The pictures the start screen is laid out for, and the screens held upright (as tests/smithmenu.test.ts has them). */
const PICTURES = [
  { name: 'from the floor', w: SMITH2_W, h: SMITH2_H, lip: SMITH2_LIP, lift: SMITH2_LIFT, headTop: SMITH2_HEAD_TOP },
  { name: 'made new', w: SMITH3_W, h: SMITH3_H, lip: SMITH3_LIP, lift: SMITH3_LIFT, headTop: SMITH3_HEAD_TOP },
];
const SCREENS = [
  { name: 'a PC', w: 480, h: 270 },
  { name: 'a phone held sideways', w: 507, h: 234 },
  { name: 'a small old phone held sideways', w: 379, h: 214 },
  { name: 'a phone held upright', w: 293, h: 633 },
  { name: 'an older phone held upright', w: 270, h: 480 },
  { name: 'a tablet held upright', w: 308, h: 410 },
];

test('eight options: on the screen, none overlapping, each big enough for a thumb; upright in the room the seven took, the picture still', () =>
  switched(true, () => {
    const NAME_W = textWidth('WORDSMITH');
    const n = SMITH_MOST + 1;
    for (const pic of PICTURES) {
      for (const s of SCREENS) {
        const what = `${pic.name}, ${s.name}`;
        const lay = smithLayout(s.w, s.h, false, n, NAME_W, pic);
        const seven = smithLayout(s.w, s.h, false, SMITH_MOST, NAME_W, pic);
        const menu = smithLayout(s.w, s.h, true, 4, NAME_W, pic);
        assert.equal(lay.rects.length, n);
        assert.equal(lay.oy, menu.oy, `${what}: the picture does not move`);
        assert.equal(lay.lift, menu.lift, what);
        lay.rects.forEach((r, i) => {
          assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= s.w && r.y + r.h <= s.h, `${what}, ${i}: on the screen`);
          assert.ok(r.w >= 84 && r.h >= 22, `${what}, ${i}: big enough for a thumb (${r.w} x ${r.h})`);
          for (let j = 0; j < i; j++) {
            const q = lay.rects[j];
            assert.ok(r.x >= q.x + q.w || q.x >= r.x + r.w || r.y >= q.y + q.h || q.y >= r.y + r.h, `${what}, ${i}: clear of ${j}`);
          }
        });
        if (s.h > s.w && seven.per === 1) {
          assert.equal(lay.per, 1, `${what}: still a column`);
          assert.equal(lay.rects[0].y, seven.rects[0].y, `${what}: from where the seven began`);
          const end = (l: typeof lay): number => l.rects[l.rects.length - 1].y + l.rects[l.rects.length - 1].h;
          assert.ok(end(lay) <= end(seven), `${what}: and ending no lower`);
        }
      }
    }
  }));

test('the page of floors: every floor built, in its rows of five', () => {
  const all: number[] = [];
  // (THE HIGH CITY: its row shown only once its first floor is built, and only as far as they are: ui/panels.ts drawFloors)
  for (const r of FLOOR_ROWS.filter((q) => q.from <= lastFloor())) for (let d = r.from; d <= Math.min(r.to, lastFloor()); d++) all.push(d);
  assert.deepEqual(all, Array.from({ length: lastFloor() }, (_, i) => i + 1));
  for (const r of FLOOR_ROWS) assert.equal(r.to - r.from + 1, 5);
});
