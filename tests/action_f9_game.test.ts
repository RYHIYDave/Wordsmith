// FLOORS 9 AND 10'S NEW MOVES, IN THE GAME (the art chat's art/action_f9_*.ts behind DEER_BRAMBLE, WOLF_PACK and DROWNED_RETCH, his yes to
// each there; brought in by the main chat, 2 Nov 2026, behind the same switches, off until his yes here). Each with its switch on:
//   1. off, the old moves; on, the new;
//   2. the twisted deer's charge: a hero in its lane is struck once as it comes by, the deer carried down it; one who steps out of the
//      lane once it is marked, not;
//   3. its hedge: a wall behind it he cannot cross while it stands, its thorns stinging him against it; gone after;
//   4. the fog wolves: a pack of four gathers on the ring round him, then each lunges through him in turn, a beat apart, going round;
//   5. the Drowned's retch: a hero in the cone is struck as the gush comes down, then slowed and stung in the slick; one out of it, not;
//   6. its frost grab: a hero where its hands close is struck and frozen in place: he neither walks nor dodges, until it lets go.
//   run: tsx --test tests/action_f9_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CHARGE, CHARGE_HIT, DEER_BRAMBLE, HEDGE, HEDGE_GONE, LEAP_HIT, PACK, WOLF_PACK } from '../src/art/action_f9_pinewood';
import { DROWNED_RETCH, FROST, GRAB_HIT, RETCH_HIT, SLICK } from '../src/art/action_f9_fen';
import { RNG } from '../src/engine/rng';
import { CHARGE_PERIL } from '../src/game/act1_rules/deer';
import { SLICK_PERIL } from '../src/game/act1_rules/drowned';
import { act1Rules } from '../src/game/act1_rules/index';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
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
  for (const sw of [DEER_BRAMBLE, WOLF_PACK, DROWNED_RETCH]) assert.equal(sw.on, false, 'off until his yes');
  assert.deepEqual(ids('deer'), ['deer:gore', 'deer:stomp']);
  assert.deepEqual(ids('wolf'), ['wolf:bite']);
  assert.deepEqual(ids('drowned'), ['drowned:grab', 'drowned:rise']);
  on(DEER_BRAMBLE, () => assert.deepEqual(ids('deer'), ['deer:gore', 'deer:charge']));
  on(WOLF_PACK, () => assert.deepEqual(ids('wolf'), ['wolf:lunge']));
  on(DROWNED_RETCH, () => assert.deepEqual(ids('drowned'), ['drowned:grab', 'drowned:retch', 'drowned:rise']));
});

test('2. the deer\'s charge: struck once in its lane as it comes by, the deer carried down it; stepped out of the lane, not', () => {
  on(DEER_BRAMBLE, () => {
    {
      const { g, m } = room('deer', 5, 'deer:charge');
      const x0 = m.x;
      const s = watch(g, m, CHARGE.long + 0.3);
      assert.ok(s.acts[0]?.startsWith('deer:charge'), 'it charges');
      assert.equal(s.hurts.length, 1, 'struck once');
      assert.ok(firstHurt(s) - s.began > CHARGE_HIT, 'as it comes by');
      assert.ok(m.x - x0 > 5, `carried down its lane (${(m.x - x0).toFixed(2)})`);
      assert.ok(g.perils.some((p) => p.a1 === CHARGE_PERIL), 'its hedge behind it');
    }
    {
      const { g, m } = room('deer', 5, 'deer:charge');
      const s = watch(g, m, CHARGE.long + 0.3, (t) => (t > CHARGE.aim + 0.05 && t < CHARGE_HIT ? { mx: 0, my: 1 } : null));
      assert.ok(Math.abs(g.hero.y - m.y) > CHARGE.half + 0.4, 'he got clear of its lane');
      assert.equal(s.hurts.length, 0, 'out of its lane, not struck');
    }
  });
});

test('3. its hedge: a wall he cannot cross while it stands, its thorns stinging; gone after', () => {
  on(DEER_BRAMBLE, () => {
    const { g, m } = room('deer', 5, 'deer:charge');
    // (he steps out of its lane, beside it, and then tries to walk across where it has run)
    watch(g, m, CHARGE.long + 0.1, (t) => (t > CHARGE.aim + 0.05 && t < CHARGE_HIT ? { mx: 0, my: 1 } : null));
    const p = g.perils.find((q) => q.a1 === CHARGE_PERIL)!;
    assert.ok(p, 'the hedge');
    const h = g.hero;
    h.x = p.x + p.fx * 3;
    h.y = p.y + p.fy * 3 + 1.2;
    m.moveCd = m.moveCd!.map(() => 1e9);
    const s = watch(g, m, 1.2, () => ({ mx: 0, my: -1 }));
    const aside = -(h.x - p.x) * p.fy + (h.y - p.y) * p.fx;
    assert.ok(aside > HEDGE.half, `still on his side (${aside.toFixed(2)})`);
    assert.ok(s.hurts.length >= 1, 'its thorns sting him against it');
    // (once it is gone he walks across)
    watch(g, m, HEDGE_GONE - p.t + 0.2);
    assert.ok(!g.perils.includes(p), 'gone');
    watch(g, m, 1.5, () => ({ mx: 0, my: -1 }));
    const after = -(h.x - p.x) * p.fy + (h.y - p.y) * p.fx;
    assert.ok(after < -HEDGE.half, `and across, once it is gone (${after.toFixed(2)})`);
  });
});

test('4. the fog wolves: a pack of four gathers on the ring, then each lunges through him in turn, a beat apart, going round', () => {
  on(WOLF_PACK, () => {
    const g = Game.forPractice('warrior', 5);
    (g as unknown as { waveT: number }).waveT = 1e9;
    g.monsters.length = 0;
    const h = g.hero;
    const pack: Monster[] = [];
    for (let i = 0; i < 4; i++) {
      const a = 0.4 + i * 0.5;
      const m = g.spawn('wolf', h.x + Math.cos(a) * 4.5, h.y + Math.sin(a) * 4.5, -2, 0, false, new RNG(3 + i));
      (g as unknown as { wakeUp(m: Monster): void }).wakeUp(m);
      m.words = [];
      m.life = m.maxLife = 1e9;
      pack.push(m);
    }
    const c = emptyControls();
    const began: { id: number; t: number; a: number }[] = [];
    const hurts: number[] = [];
    let gathered = -1;
    for (let k = 1; k <= 60 * 9; k++) {
      const before = h.life;
      g.update(1 / 60, c);
      if (h.life < before) hurts.push(k / 60);
      h.life = h.d.maxLife;
      h.invuln = 0;
      g.events.length = 0;
      if (gathered < 0 && pack.every((m) => Math.abs(Math.hypot(m.x - h.x, m.y - h.y) - PACK.ring) < 0.45)) gathered = k / 60;
      for (const m of pack) {
        if (m.state === 'act' && m.act && m.act.t <= 1 / 60 + 1e-9 && !began.some((b) => b.id === m.id && k / 60 - b.t < 1)) began.push({ id: m.id, t: k / 60, a: Math.atan2(m.y - h.y, m.x - h.x) });
      }
    }
    assert.ok(gathered > 0, 'they gather on the ring');
    assert.ok(began.length >= 4, `they lunge (${began.length})`);
    const first4 = began.slice(0, 4);
    assert.equal(new Set(first4.map((b) => b.id)).size, 4, 'each in turn');
    for (let i = 1; i < first4.length; i++) assert.ok(first4[i].t - first4[i - 1].t >= PACK.beat - 0.02, `a beat apart (${(first4[i].t - first4[i - 1].t).toFixed(2)})`);
    // (going round: each the next round the ring from the one before, the same way each time)
    const turn = (a: number, b: number): number => Math.atan2(Math.sin(b - a), Math.cos(b - a));
    const ways = first4.slice(1).map((b, i) => Math.sign(turn(first4[i].a, b.a)));
    assert.ok(ways.every((w) => w === ways[0]), 'going round one way');
    assert.ok(hurts.length >= 4, `each bites him as it leaps through (${hurts.length})`);
    assert.ok(began.length && hurts.some((t) => Math.abs(t - (first4[0].t + LEAP_HIT)) < 0.05), 'as its jaws snap shut');
  });
});

test('5. the Drowned\'s retch: in the cone, struck as the gush comes down, then slowed and stung in the slick; out of it, not', () => {
  on(DROWNED_RETCH, () => {
    {
      const { g, m } = room('drowned', 2.2, 'drowned:retch');
      if (m.a1) m.a1.under = 0;
      const s = watch(g, m, RETCH_HIT + SLICK.lands + 0.05);
      assert.ok(s.acts[0]?.startsWith('drowned:retch'), 'it retches');
      assert.equal(s.hurts.length, 1, 'struck');
      assert.ok(Math.abs(firstHurt(s) - s.began - (RETCH_HIT + SLICK.lands)) < 0.05, 'as the gush comes down');
      const s2 = watch(g, m, 1.5);
      assert.ok((g.hero.slowT ?? 0) > 0 && (g.hero.slowBy ?? 0) >= 1 - SLICK.slow - 1e-9, 'slowed in it');
      assert.ok(s2.hurts.length >= 2, 'and stung');
      assert.ok(g.perils.some((p) => p.a1 === SLICK_PERIL), 'it lies there');
    }
    {
      const { g, m } = room('drowned', 2.2, 'drowned:retch');
      if (m.a1) m.a1.under = 0;
      const s = watch(g, m, RETCH_HIT + SLICK.lands + 1.5, (t) => (t > 0.35 && t < RETCH_HIT ? { mx: 0, my: 1 } : null));
      assert.ok(Math.abs(g.hero.y - m.y) > 2, 'he got out of its cone');
      assert.equal(s.hurts.length, 0, 'not struck, not stung');
    }
  });
});

test('6. its frost grab: struck and frozen in place, neither walking nor dodging, until it lets go', () => {
  on(DROWNED_RETCH, () => {
    const { g, m } = room('drowned', FROST.at, 'drowned:grab');
    if (m.a1) m.a1.under = 0;
    const s = watch(g, m, GRAB_HIT + 0.05);
    assert.ok(s.acts[0]?.startsWith('drowned:grab'), 'it grabs');
    assert.equal(s.hurts.length, 1, 'struck');
    const h = g.hero;
    assert.ok((h.iceT ?? 0) > FROST.hold - 0.1, 'frozen in place');
    const x = h.x;
    const y = h.y;
    // (he walks, and dodges: nowhere)
    const c = emptyControls();
    for (let k = 0; k < Math.round((FROST.hold - 0.15) * 60); k++) {
      c.mx = 0;
      c.my = 1;
      c.evade = k === 3;
      c.evadeX = h.x;
      c.evadeY = h.y + 3;
      g.update(1 / 60, c);
      h.life = h.d.maxLife;
    }
    assert.ok(Math.hypot(h.x - x, h.y - y) < 0.05, `held where he stood (${Math.hypot(h.x - x, h.y - y).toFixed(2)})`);
    // (let go: he walks again)
    c.evade = false;
    for (let k = 0; k < 40; k++) g.update(1 / 60, c);
    assert.ok(h.y - y > 0.3, 'let go, he walks');
  });
});
