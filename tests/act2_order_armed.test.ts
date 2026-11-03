// THE HIGH CITY, FLOOR 19: THE SILENT ORDER'S ARMED LAST (game/act1_rules/order.ts, art/act1_figs/order.ts; the art chat's
// ORDER_ARMED, his pick “A fan of three on 19 (Recommended)”):
//   1. on floor 19 the Order come as the armed last (Monster.form 1, their own pictures); on floor 17 as the guests;
//   2. the armed last's knife is a fan of three, 35 degrees apart, each flying its own way; the guest's one;
//   3. the three of one throw strike him once at most.
//   run: tsx --test tests/act2_order_armed.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { KNIFE_FAN } from '../src/art/silent_order';
import { makeBestiary } from '../src/art/bestiary';
import { RNG } from '../src/engine/rng';
import { ARMED_FLOOR } from '../src/game/act1_rules/order';
import { keep, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas, unlike } from './helpers';

paintWithoutCanvas();

function order(depth: number, far: number): ReturnType<typeof room> {
  const r = room('order', 30);
  const g = r.g;
  g.depth = depth;
  g.monsters.length = 0;
  const h = g.hero;
  const m = g.spawn('order', h.x + far, h.y, -2, 0, false, new RNG(11));
  (g as unknown as { wakeUp(m: unknown): void }).wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.fx = -1;
  m.fy = 0;
  keep(m, 'order:knife' as never);
  return { g, m, all: [m] };
}

test('1. on floor 19 the armed last, their own pictures; on floor 17 the guests', () => {
  assert.equal(ARMED_FLOOR, 19);
  assert.equal(order(19, 4).m.form, 1, 'the armed last on 19');
  assert.equal(order(17, 4).m.form ?? 0, 0, 'the guests on 17');
  const art = makeBestiary();
  const guest = art.of('order').front.idle[0];
  const armed = art.of('order:1' as never).front.idle[0];
  assert.ok(unlike(guest, armed) > 150, `the armed last look their own (${unlike(guest, armed)} pixels unlike)`);
});

test('2-3. the armed last throw a fan of three, 35 degrees apart; the guests one; the three strike once at most', () => {
  for (const [depth, n] of [[19, 3], [17, 1]] as const) {
    const { g, m } = order(depth, 4);
    assert.ok(untilAct(g, m, 'order:knife' as never), `${depth}: the knife`);
    const seen = watch(g, m, 1.6);
    const knives = g.perils.filter((p) => p.a1 === 'order:knife');
    assert.equal(knives.length, n, `${depth}: ${n} knife(s)`);
    if (n === 3) {
      // (each knife's way off the middle one's)
      const mid = knives.find((p) => p.b === 0)!;
      const ang = knives.map((p) => (Math.atan2(mid.fx * p.fy - mid.fy * p.fx, mid.fx * p.fx + mid.fy * p.fy) * 180) / Math.PI).sort((a, b) => a - b);
      assert.ok(Math.abs(ang[1] - ang[0] - KNIFE_FAN.spread) < 0.5 && Math.abs(ang[2] - ang[1] - KNIFE_FAN.spread) < 0.5, `fanned ${KNIFE_FAN.spread} apart (${ang.map((a) => a.toFixed(1)).join(', ')})`);
    }
    assert.equal(seen.hurts.length, 1, `${depth}: struck once`);
  }
});
