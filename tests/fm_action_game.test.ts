// THE FLESHMANCER'S MOVES DONE THE ACTION WAY, IN THE GAME (game/fm_action.ts FM_ACTION; game/bosses.ts FM2_ACTS, fmActing; the art
// chat's art/fleshmancer_action.ts behind FLESH_ACTION, his yes there, 2 Nov 2026). Held here, with both switches on for each test:
//   1. off, his old acts and the mini's; on, the new, where his pictures have them, and the art's switch with it;
//   2. his shards: a hero before him is struck as the first fan flies past; one behind him, never;
//   3. his rings: a hero on the first ring's hands is struck as it bursts up; one between the first and second rings, standing where
//      the second ring's gap is, is not;
//   4. his fire: a hero three tiles off is burned as it whips round and in the lanes it leaves; one in close under him, never;
//   5. his teleport: gone and come back elsewhere, his rise marked a second before; a hero on the mark struck as he erupts.
//   run: tsx --test tests/fm_action_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { FIRE_HIT, FIRE_STOP, FLESH_ACTION, RING_HITS, SHARD_HITS, SHARD_LONG } from '../src/art/fleshmancer_action';
import { RINGS, RISE_MARK, SHARDS, ringHands } from '../src/art/fleshmancer_action_fx';
import { useFmAction } from '../src/art/bestiary';
import { RNG } from '../src/engine/rng';
import { ACTS, FM2_ACTS, MINI2_ACTS, actsOf } from '../src/game/bosses';
import { FM2, FM_ACTION, FM_RISE } from '../src/game/fm_action';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster } from '../src/game/state';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}
function on(fn: () => void): void {
  const was = FM_ACTION.on;
  useFmAction(true);
  try {
    fn();
  } finally {
    useFmAction(was);
  }
}
/** The practice room, emptied: the Fleshmancer `far` tiles west of the hero, facing him, awake, beginning act `id`. */
function room(far: number, id: ActId): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('fleshmancer', h.x - far, h.y, -2, 0, false, new RNG(9), null, null);
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.fx = 1;
  m.fy = 0;
  m.speed = 0;
  g.events.length = 0;
  g.bosses.startAct(m, FM2_ACTS, FM2_ACTS.findIndex((a) => a.id === id));
  return { g, m };
}
/** Steps the game on for `secs` (sixty a second): the hero stands, his life put back each step; when he was struck. */
function watch(g: Game, secs: number, each: (t: number) => void = () => undefined): number[] {
  const c = emptyControls();
  const h = g.hero;
  const hurts: number[] = [];
  for (let k = 1; k <= Math.round(secs * 60); k++) {
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) hurts.push(k / 60);
    h.life = h.d.maxLife;
    h.invuln = 0;
    g.events.length = 0;
    each(k / 60);
  }
  return hurts;
}

test('1. on, the new, where his pictures have them, and his new pictures with them; off, his old acts', () => {
  assert.equal(FM_ACTION.on, false, 'off until his yes in the main chat');
  assert.equal(FLESH_ACTION.on, false);
  assert.equal(actsOf({ kind: 'fleshmancer' }), ACTS.fleshmancer);
  on(() => {
    assert.ok(FLESH_ACTION.on, 'the art with the rules');
    assert.equal(actsOf({ kind: 'fleshmancer' }), FM2_ACTS);
    assert.equal(actsOf({ kind: 'minifm' }), MINI2_ACTS);
    assert.deepEqual(FM2_ACTS.map((a) => a.id), ['fm:shards', 'fm:rings', 'fm:fire', 'raise', 'blink', 'rise']);
    assert.equal(FM2_ACTS[0].long, SHARD_LONG);
    assert.equal(FM2_ACTS[1].hit, RING_HITS[0]);
    assert.equal(FM2_ACTS[2].hit, FIRE_HIT);
  });
});

test('2. his shards: before him, struck as the first fan flies past; in a gap of the first, not by it, but by the second', () => {
  on(() => {
    const a = room(4.2, 'fm:shards');
    const hurts = watch(a.g, SHARD_LONG + 0.6);
    assert.ok(hurts.length >= 1, 'struck');
    assert.ok(hurts[0] > SHARD_HITS[0] && hurts[0] < SHARD_HITS[0] + 0.5, `as the first fan flies (${hurts[0].toFixed(2)})`);
    // (in the gap between the first fan's two middle shards, half their angle apart, as it is aimed: the second fan comes in its
    // gaps, aimed where he is as it is drawn up)
    const b = room(4.2, 'fm:shards');
    const half = ((SHARDS.apart / 2) * Math.PI) / 180;
    b.g.hero.x = b.m.x + Math.cos(half) * 4.2;
    b.g.hero.y = b.m.y + Math.sin(half) * 4.2;
    const fm = { x: b.m.x, y: b.m.y };
    // (he aims his first fan at the hero as he begins: so the hero stands before him, then steps into the gap as it hangs)
    b.g.hero.x = fm.x + 4.2;
    b.g.hero.y = fm.y;
    const got = watch(b.g, SHARD_LONG + 0.6, (t) => {
      if (Math.abs(t - 0.5) < 0.009) {
        b.g.hero.x = fm.x + Math.cos(half) * 4.2;
        b.g.hero.y = fm.y + Math.sin(half) * 4.2;
      }
    });
    assert.ok(got.every((t) => t > SHARD_HITS[1]), `not by the first fan (struck at ${got.map((t) => t.toFixed(2)).join(', ')})`);
    assert.ok(got.length >= 1, 'by the second, in its gaps');
  });
});

test('3. his rings: on the first ring\'s hands, struck as it bursts; between the first and second where the second has its gap, not', () => {
  on(() => {
    const a = room(RINGS.radii[0], 'fm:rings');
    // (stand exactly on one of the first ring's hands)
    const aim = Math.atan2(a.m.fy, a.m.fx);
    const hand = ringHands(0).hands[0];
    a.g.hero.x = a.m.x + Math.cos(aim + hand.a) * RINGS.radii[0];
    a.g.hero.y = a.m.y + Math.sin(aim + hand.a) * RINGS.radii[0];
    const hurts = watch(a.g, RING_HITS[1] + 0.8);
    assert.ok(hurts.length >= 1, 'struck');
    assert.ok(Math.abs(hurts[0] - RING_HITS[0]) < 0.1, `as it bursts (${hurts[0].toFixed(2)})`);
    // (between rings 1 and 2, in ring 2's gap: the hands of neither reach)
    const b = room(3, 'fm:rings');
    const gap = ringHands(1).gaps[0];
    const r = (RINGS.radii[0] + RINGS.radii[1]) / 2;
    b.g.hero.x = b.m.x + Math.cos(aim + gap) * r;
    b.g.hero.y = b.m.y + Math.sin(aim + gap) * r;
    assert.equal(watch(b.g, RING_HITS[1] + 0.8).length, 0, 'between them');
  });
});

test('4. his fire: three tiles off, burned as it whips round and in its lanes; in close under him, never', () => {
  on(() => {
    const a = room(3, 'fm:fire');
    const hurts = watch(a.g, FIRE_STOP + 1.5);
    assert.ok(hurts.length >= 1, 'burned');
    assert.ok(hurts.every((t) => t >= FIRE_HIT - 0.02), 'not before it bursts out');
    const b = room(0.45, 'fm:fire');
    assert.equal(watch(b.g, FIRE_STOP + 1.5).length, 0, 'in close under him');
  });
});

test('5. his teleport: gone, back elsewhere, his rise marked a second before; struck on the mark as he erupts', () => {
  on(() => {
    const { g, m } = room(2, 'blink');
    const x0 = m.x;
    const y0 = m.y;
    let marked = -1;
    let rise: { x: number; y: number } | null = null;
    watch(g, FM2.blink.sink + 0.05, (t) => {
      const p = g.perils.find((q) => q.a1 === FM_RISE);
      if (p && marked < 0) {
        marked = t;
        rise = { x: p.x, y: p.y };
      }
    });
    assert.ok(rise, 'his rise marked');
    assert.ok(Math.hypot(m.x - x0, m.y - y0) > 1, 'elsewhere');
    // (the hero steps onto the mark; he erupts after the pause and the rise's first part)
    g.hero.x = rise!.x + 0.5;
    g.hero.y = rise!.y;
    const hurts = watch(g, FM2.blink.pause + FM2.blink.up + 0.4);
    assert.ok(hurts.length >= 1, 'struck as he erupts');
    assert.ok(Math.abs(hurts[0] - (FM2.blink.pause + FM2.blink.up)) < 0.12, `as he erupts (${hurts[0].toFixed(2)})`);
    assert.ok(RISE_MARK.warn <= FM2.blink.pause + FM2.blink.up + 1e-9, 'marked a second before');
  });
});
