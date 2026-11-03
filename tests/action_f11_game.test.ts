// FLOORS 11 TO 15'S NEW MOVES OF THE CITY'S OWN, IN THE GAME (the art chat's art/action_f11_*.ts behind WATCH_LANTERN, FIELD_HARVEST,
// ORDERLY_GURNEY and WARDEN_BARRAGE, his yes to each there; brought in by the main chat, 2 Nov 2026, behind the same switches, off until his
// yes here). Each with its switch on, in a practice room, before the hero, only that move ready:
//   1. off, the old moves; on, the new;
//   2. the watch's chop: a hero on its split struck; one behind him, not;
//   3. the watch's lantern: a hero who stands struck as it smashes, then burned in the oil; one gone from where it was thrown, not;
//   4. the reapers' sickle boomerang: a hero where it flies struck going out, and where it comes back struck coming back; one well
//      off to the side, not;
//   5. the orderly's gurney: a hero in its lane struck as it crashes on him; one who steps out of the lane once it is marked, not;
//   6. the Bookwarden's barrage: a hero who stands struck by book after book.
//   run: tsx --test tests/action_f11_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CHOP, CHOP_HIT, LOB, LOB_HIT, POOL, WATCH_LANTERN, lobFly } from '../src/art/action_f11_watch';
import { BOOM, BOOM_CATCH, BOOM_HIT, FIELD_HARVEST, boomAt } from '../src/art/action_f11_field';
import { GURNEY, GURNEY_HIT, ORDERLY_GURNEY } from '../src/art/action_f11_orderly';
import { BARRAGE, BARRAGE_DONE, WARDEN_BARRAGE } from '../src/art/action_f11_warden';
import { act1Rules } from '../src/game/act1_rules/index';
import { beside } from '../src/game/facing';
import { firstHurt, room, watch } from './act1_kinds_room';

function on(sw: { on: boolean }, fn: () => void): void {
  const was = sw.on;
  sw.on = true;
  try {
    fn();
  } finally {
    sw.on = was;
  }
}
const ids = (kind: string): string[] => act1Rules(kind as never)!.acts.map((a) => a.id);

test('1. off, the old moves; on, the new', () => {
  for (const sw of [WATCH_LANTERN, FIELD_HARVEST, ORDERLY_GURNEY, WARDEN_BARRAGE]) assert.equal(sw.on, false, 'off until his yes');
  assert.deepEqual(ids('watch'), ['watch:sweep', 'watch:round']);
  assert.deepEqual(ids('fieldhand'), ['fieldhand:slash']);
  assert.deepEqual(ids('orderly'), ['orderly:blow', 'orderly:quake']);
  assert.deepEqual(ids('bookwarden'), ['bookwarden:slam', 'bookwarden:storm']);
  on(WATCH_LANTERN, () => assert.deepEqual(ids('watch'), ['watch:chop', 'watch:lantern']));
  on(FIELD_HARVEST, () => assert.deepEqual(ids('fieldhand'), ['fieldhand:boom']));
  on(ORDERLY_GURNEY, () => assert.deepEqual(ids('orderly'), ['orderly:blow', 'orderly:gurney']));
  on(WARDEN_BARRAGE, () => assert.deepEqual(ids('bookwarden'), ['bookwarden:slam', 'bookwarden:barrage']));
});

test('2. the watch\'s chop: on its split, struck; behind him, not', () => {
  on(WATCH_LANTERN, () => {
    {
      const { g, m } = room('watch', 2.4, 'watch:chop');
      const s = watch(g, m, CHOP.long + 0.2);
      assert.ok(s.acts[0]?.startsWith('watch:chop'), 'he chops');
      assert.equal(s.hurts.length, 1, 'struck');
      assert.ok(Math.abs(firstHurt(s) - s.began - CHOP_HIT) < 0.05, 'as it bites');
    }
    {
      const { g, m } = room('watch', 2.4, 'watch:chop');
      watch(g, m, 0.3);
      g.hero.x = m.x - 1.5;
      g.hero.y = m.y;
      assert.equal(watch(g, m, CHOP.long).hurts.length, 0, 'behind him, not');
    }
  });
});

test('3. the watch\'s lantern: struck as it smashes and burned in the oil; gone from where it was thrown, not', () => {
  on(WATCH_LANTERN, () => {
    {
      const { g, m } = room('watch', 5, 'watch:lantern');
      const s = watch(g, m, LOB_HIT + lobFly(5) + 2);
      assert.ok(s.acts[0]?.startsWith('watch:lantern'), 'he throws');
      const t = firstHurt(s) - s.began;
      assert.ok(t > LOB_HIT && t < LOB_HIT + lobFly(5.5) + 0.1, `struck as it smashes (${t.toFixed(2)})`);
      assert.ok(s.hurts.length >= 3, 'and burned in the oil');
    }
    {
      const { g, m } = room('watch', 5, 'watch:lantern');
      const s = watch(g, m, LOB_HIT + lobFly(5) + 2, (t) => (t > LOB_HIT + 0.05 && t < LOB_HIT + 0.75 ? { mx: 0, my: 1 } : null));
      assert.ok(Math.abs(g.hero.y - m.y) > POOL.r + 0.4, 'he got clear');
      assert.equal(s.hurts.length, 0, 'not struck, not burned');
    }
    assert.ok(LOB.far >= 8);
  });
});

test('4. the sickle boomerang: struck where it flies out, and where it comes back; well off to the side, not', () => {
  on(FIELD_HARVEST, () => {
    for (const [u, pass] of [[0.25, 'out'], [0.75, 'back']] as const) {
      const p = boomAt(BOOM_HIT + BOOM.fly * u)!;
      const { g, m } = room('fieldhand', 4, 'fieldhand:boom');
      // (he begins, facing the hero, along the floor's +x: then the hero stands where the sickle will be)
      const s0 = watch(g, m, 0.1);
      assert.ok(s0.acts[0]?.startsWith('fieldhand:boom'), 'it throws');
      const w = beside(m.x, m.y, m.fx, m.fy, m.act!.hand, p.x, p.y);
      g.hero.x = w.x;
      g.hero.y = w.y;
      const s = watch(g, m, BOOM_CATCH + 0.3);
      assert.ok(s.hurts.length >= 1, `struck ${pass}`);
    }
    {
      const { g, m } = room('fieldhand', 4, 'fieldhand:boom');
      watch(g, m, 0.1);
      g.hero.x = m.x + 2;
      g.hero.y = m.y + 5;
      assert.equal(watch(g, m, BOOM_CATCH + 0.3).hurts.length, 0, 'well off to the side, not');
    }
  });
});

test('5. the gurney: in its lane, struck as it crashes on him; stepped out of the lane once it is marked, not', () => {
  on(ORDERLY_GURNEY, () => {
    {
      const { g, m } = room('orderly', 5, 'orderly:gurney');
      const s = watch(g, m, GURNEY_HIT + 1.5);
      assert.ok(s.acts[0]?.startsWith('orderly:gurney'), 'he slams it');
      assert.equal(s.hurts.length, 1, 'struck once');
      assert.ok(firstHurt(s) - s.began > GURNEY_HIT, 'as it comes');
    }
    {
      const { g, m } = room('orderly', 5, 'orderly:gurney');
      const s = watch(g, m, GURNEY_HIT + 1.5, (t) => (t > GURNEY.aim + 0.05 && t < GURNEY_HIT ? { mx: 0, my: 1 } : null));
      assert.ok(Math.abs(g.hero.y - m.y) > GURNEY.half + 0.3, 'he got out of its lane');
      assert.equal(s.hurts.length, 0, 'not struck');
    }
  });
});

test('6. the book barrage: a hero who stands struck by book after book', () => {
  on(WARDEN_BARRAGE, () => {
    const { g, m } = room('bookwarden', 5, 'bookwarden:barrage');
    const s = watch(g, m, BARRAGE_DONE + 0.2);
    assert.ok(s.acts[0]?.startsWith('bookwarden:barrage'), 'he flings them');
    assert.ok(s.hurts.length >= 3, `book after book (${s.hurts.length})`);
    assert.ok(s.hurts.length <= BARRAGE.n, 'each once at most');
  });
});
