// THE RIVERS FLAT WATER, THE SWIPE MOVES OVER THEM (game/water.ts LEAP_WATER, off until his yes). The owner, 23 Oct 2026,
// 11:42 (Pacific): “I would love to be able to swipe move over rivers or flat paths”.
//
// What is held here:
//   - off, a floor is as it was: no water marked, and the swipe moves stop at the race;
//   - on, the Pinewood's river and the Millrace's river and race are water, on tiles nobody walks on, near their lines and
//     nowhere else, and seen across; floors with no river have none;
//   - on, each class's swipe (the warrior's Lunge, the ranger's roll, the mage's Warp) made across the mill race lands on the
//     strip of ground beyond it; nobody stands in the water.
//   run: tsx --test tests/leap_water.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { laneDist } from '../src/game/act1_layout';
import { Game } from '../src/game/game';
import { makeDungeon } from '../src/game/level';
import { millOf, millWorks } from '../src/game/act2/millrace';
import { emptyControls } from '../src/game/state';
import { LEAP_WATER, WATER_REACH } from '../src/game/water';
import { seasoned } from './helpers';

function waterSet<T>(on: boolean, run: () => T): T {
  const was = LEAP_WATER.on;
  LEAP_WATER.on = on;
  try {
    return run();
  } finally {
    LEAP_WATER.on = was;
  }
}

test('the switch, on: his yes by 22:06, 23 Oct 2026, to the game\'s pictures: “Yes, next version (Recommended)”; off, no water', () => {
  assert.equal(LEAP_WATER.on, true);
  const L = waterSet(false, () => makeDungeon(13, 5));
  assert.equal(L.water, undefined);
});

test('on: the rivers and the race are water, where nobody walks, near their lines; none where a floor has no river', () =>
  waterSet(true, () => {
    for (const depth of [9, 13]) {
      for (const seed of [1, 2, 3, 5]) {
        const L = makeDungeon(depth, seed);
        const what = `floor ${depth}, seed ${seed}`;
        assert.ok(L.water, what);
        const land = L.land!;
        let n = 0;
        for (let i = 0; i < L.water!.length; i++) {
          if (!L.water![i]) continue;
          n++;
          assert.equal(L.walk[i], 0, `${what}: nobody walks in the water`);
          assert.equal(L.open[i], 1, `${what}: it is seen across`);
          const x = (i % L.floor.w) + 0.5;
          const y = Math.floor(i / L.floor.w) + 0.5;
          const near = (land.river && laneDist({ pts: land.river, w: 0 }, x, y) < WATER_REACH.river) || (land.race && laneDist({ pts: land.race, w: 0 }, x, y) < WATER_REACH.race);
          assert.ok(near, `${what}: water only by a river or the race`);
        }
        assert.ok(n > 20, `${what}: ${n} tiles of water`);
      }
    }
    for (const depth of [6, 7, 10, 11, 12, 14, 15]) assert.equal(makeDungeon(depth, 3).water, undefined, `floor ${depth}: no river`);
  }));

test('each class\'s swipe made across the mill race: on, it lands on the strip beyond; off, it stops at the race', () => {
  for (const on of [false, true]) {
    waterSet(on, () => {
      for (const cls of ['warrior', 'ranger', 'mage'] as const) {
        const g = seasoned(new Game(cls, 5), 20);
        g.depth = 13;
        g.cleared = 12;
        g.wayDepth = 13;
        g.enterDungeon();
        g.monsters.length = 0;
        const m = millOf(g.level.land!)!;
        const w = millWorks(m);
        // (from the yard beside the race, level with the strip past the wheel, across to the strip's far tile)
        const y = w.chest[1] + 0.5 + (m.s > 0 ? 0 : 0);
        const h = g.hero;
        h.x = m.cx - 0.5;
        h.y = y;
        h.invuln = 1e9;
        assert.equal(g.level.walk[Math.floor(h.y) * g.level.floor.w + Math.floor(h.x)], 1, `${cls}: he stands on the yard`);
        for (const s of h.skills) {
          s.cd = 0;
          s.charges = Math.max(1, s.charges);
        }
        (g as unknown as { useEvasive(x: number, y: number, c: unknown): void }).useEvasive(m.cx + 1.5, y, emptyControls());
        for (let k = 0; k < 30; k++) {
          g.events.length = 0;
          g.update(1 / 30, emptyControls());
        }
        const i = Math.floor(h.y) * g.level.floor.w + Math.floor(h.x);
        if (on) {
          assert.ok(h.x > m.cx + 1, `${cls}: across the race (at ${h.x.toFixed(2)})`);
          assert.equal(g.level.walk[i], 1, `${cls}: on ground`);
        } else assert.ok(h.x < m.cx, `${cls}: stopped this side of the race (at ${h.x.toFixed(2)})`);
      }
    });
  }
});
