// THE STRONGHOLDS' ALTAR, GONE WITH THE DOOR OPEN (game/act1_holds.ts ALTAR_GOES; game.ts openHold). The owner, 23 Oct 2026,
// 11:38 (Pacific): “The altars are still on the way of the entrance to the strongholds after you unlock the door”. The altar
// stands over the corner of two tiles (game/act1_dress.ts), both made solid; as the door opened only one was made floor
// again, and the other stood unseen before the door.
//
// What is held here, on every floor 6 to 10 with strongholds, on several dice: before the door is opened both tiles the
// altar stands on are solid; once it is opened (a word laid on the altar), both are floor, and the door's two tiles are
// reached on foot from the court in front of it, straight up the middle.
//   run: tsx --test tests/hold_altar.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ALTAR_GOES } from '../src/game/act1_holds';
import { Game } from '../src/game/game';
import { UNREACHABLE, flowField } from '../src/game/nav';

test('the door opened: both tiles of the altar are floor again, and the door is walked to straight from the court', () => {
  assert.equal(ALTAR_GOES.on, true);
  let holds = 0;
  for (let depth = 6; depth <= 10; depth++) {
    for (const seed of [3, 7, 11]) {
      const g = new Game('warrior', seed);
      g.depth = depth;
      g.cleared = depth - 1;
      g.wayDepth = depth;
      g.enterDungeon();
      const L = g.level;
      for (const q of L.land?.holds ?? []) {
        const what = `floor ${depth}, seed ${seed}, stronghold ${q.n}`;
        const W = L.floor.w;
        const front = [(q.gy + 1) * W + q.gx - 1, (q.gy + 1) * W + q.gx];
        for (const i of front) assert.equal(L.walk[i], 0, `${what}: the altar's tile ${i % W}, ${Math.floor(i / W)} solid while it stands`);
        g.hero.words.fire = (g.hero.words.fire ?? 0) + 1;
        g.hero.x = q.altar.x + 1.2;
        g.hero.y = q.altar.y + 0.9;
        assert.equal(g.altarWord(q.n, 'fire'), null, what);
        assert.equal(g.openHold(q.n), true, what);
        for (const i of front) assert.equal(L.walk[i], 1, `${what}: the altar's tile ${i % W}, ${Math.floor(i / W)} floor again`);
        // (from two tiles out in the court, the tiles before the door are one step (the flow field's 10 straight, 14 slant), with nothing in the way)
        const flow = flowField(L.walk, W, L.floor.h, q.gx, q.gy + 2);
        const a = flow[(q.gy + 1) * W + q.gx - 1];
        const b = flow[(q.gy + 1) * W + q.gx];
        assert.ok(a !== UNREACHABLE && b !== UNREACHABLE && a <= 14 && b <= 14, `${what}: straight up to the door (${a}, ${b})`);
        holds++;
      }
    }
  }
  assert.ok(holds >= 10, `${holds} strongholds`);
});
