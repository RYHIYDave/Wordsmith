// THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY, IN THE GAME (game/bosses.ts AM_ACTION, AM2, amActing; the art chat's
// art/amalgam_action.ts behind AMALGAM_ACTION; his yes to each, 1 Nov 2026, and of the bone mites, "That’s awesome", and "They
// crumble after a while"). Held here, with both switches on for each test:
//   1. off, its old acts; on, the new, where its pictures have them, and the art's switch with it;
//   2. the swipe: before it, both rakes and the finisher; behind it, nothing; the finisher's ring marked as it rears;
//   3. the bone rain: the skulls come down over the floor round it, each where it was marked a second before; one that lands
//      where the hero stands strikes him; a bone mite pulls together where each burst, one blow kills it, it leaves nothing,
//      and left alone it crumbles;
//   4. the floor arms: more of them, the first under the hero;
//   5. the devour: dragged in from its rake, bitten at its bite.
//   run: tsx --test tests/am_action_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { AMALGAM_ACTION, ARMS_HIT, DEVOUR_HITS, RAIN_HIT, SWIPE_HITS, SWIPE_LONG } from '../src/art/amalgam_action';
import { ARMS, RAIN, SLAM_RING } from '../src/art/amalgam_action_fx';
import { MITE } from '../src/art/amalgam_mites';
import { useAmAction } from '../src/art/bestiary';
import { RNG } from '../src/engine/rng';
import { ACTS, AM2, AM2_ACTS, AM_ACTION, AM_DROP, actsOf } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster } from '../src/game/state';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}
function on(fn: () => void): void {
  const was = AM_ACTION.on;
  useAmAction(true);
  try {
    fn();
  } finally {
    useAmAction(was);
  }
}
/** The practice room, emptied: the Amalgamation `far` tiles west of the hero, facing him, awake, beginning act `id`. */
function room(far: number, id: ActId): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('amalgam', h.x - far, h.y, -2, 0, false, new RNG(9), null, null);
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.fx = 1;
  m.fy = 0;
  g.events.length = 0;
  g.bosses.startAct(m, AM2_ACTS, AM2_ACTS.findIndex((a) => a.id === id));
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
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a.toFixed(3)} against ${b.toFixed(3)}`);

test('1. off, its old acts; on, the new, where its pictures have them, and its new pictures with them', () => {
  assert.equal(AM_ACTION.on, false);
  assert.equal(AMALGAM_ACTION.on, false);
  assert.equal(actsOf({ kind: 'amalgam' }), ACTS.amalgam);
  on(() => {
    assert.ok(AMALGAM_ACTION.on, 'the art with the rules');
    assert.equal(actsOf({ kind: 'amalgam' }), AM2_ACTS);
    assert.deepEqual(AM2_ACTS.map((a) => a.id), ['swipe', 'am:rain', 'floorArms', 'devour', 'burst']);
    assert.equal(AM2_ACTS[0].long, SWIPE_LONG);
    assert.equal(AM2_ACTS[1].hit, RAIN_HIT);
    assert.equal(AM2_ACTS[2].hit, ARMS_HIT);
  });
});

test('2. the swipe: both rakes and the finisher before it; nothing behind it; the finisher marked as it rears', () => {
  on(() => {
    const a = room(2.5, 'swipe');
    let marked = -1;
    const hurts = watch(a.g, SWIPE_LONG + 0.2, (t) => {
      if (marked < 0 && a.g.zones.some((z) => z.kind === 'warn' && z.src === a.m.id && Math.abs(z.r - SLAM_RING.finisher) < 1e-9)) marked = t;
    });
    assert.equal(hurts.length, 3, `struck at ${hurts.map((t) => t.toFixed(2)).join(', ')}`);
    SWIPE_HITS.forEach((T, i) => near(hurts[i], T, 0.03, `blow ${i + 1}`));
    near(marked, AM2.finisherWarn, 0.03, 'the finisher marked');
    const b = room(2.5, 'swipe');
    b.g.hero.x = b.m.x - 2.5;
    assert.equal(watch(b.g, SWIPE_LONG + 0.2).length, 0, 'behind it: nothing');
  });
});

test('3. the bone rain: marked a second before; struck where one lands; a mite where each burst, one blow, nothing left, crumbling', () => {
  on(() => {
    const { g, m } = room(3, 'am:rain');
    const h = g.hero;
    // (to the slam: then the skulls are on their way)
    watch(g, RAIN_HIT + 0.02);
    const drops = g.perils.filter((p) => p.a1 === AM_DROP);
    assert.ok(drops.length >= 15, `${drops.length} skulls`);
    assert.ok(drops.every((p) => Math.hypot(p.x - m.x, p.y - m.y) >= RAIN.clear - 1e-6), 'none on it');
    // (he steps where the first of them will land)
    const first = drops.reduce((a, b) => (b.t > a.t ? b : a));
    h.x = first.x;
    h.y = first.y;
    const lands = -first.t;
    const hurts = watch(g, lands + 0.03);
    assert.ok(hurts.some((t) => Math.abs(t - lands) < 0.03), `struck as it lands (at ${hurts.map((t) => t.toFixed(2)).join(', ')}; it lands at ${lands.toFixed(2)})`);
    // (the mites, pulled together where they burst)
    h.x += 40;
    watch(g, 2.5);
    const mites = g.monsters.filter((o) => o.kind === 'mite' && !o.dead);
    assert.ok(mites.length >= 10, `${mites.length} mites`);
    assert.ok(mites.every((o) => o.life === 1 && o.maxLife === 1), 'one blow kills each');
    const before = g.drops.length;
    g.kill(mites[0]);
    assert.equal(g.drops.length, before, 'it leaves nothing');
    watch(g, MITE.life);
    assert.equal(g.monsters.filter((o) => o.kind === 'mite' && !o.dead).length, 0, 'left alone, they crumble');
  });
});

test('4. the floor arms: more of them, the first under the hero', () => {
  on(() => {
    const { g } = room(3, 'floorArms');
    const hurts = watch(g, ARMS_HIT + ARMS.last + 0.4);
    const arms = g.perils.filter((p) => p.kind === 'arm' && p.d === 1);
    assert.equal(arms.length, ARMS.n, `${arms.length} arms`);
    near(hurts[0], ARMS_HIT + ARMS.first + ARMS.up, 0.04, 'the first, under him');
  });
});

test('5. the devour: dragged in from its rake, bitten at its bite', () => {
  on(() => {
    const { g, m } = room(3.4, 'devour');
    let atRake = 0;
    let atBite = 0;
    const hurts = watch(g, DEVOUR_HITS[1] + 0.1, (t) => {
      const d = Math.hypot(g.hero.x - m.x, g.hero.y - m.y);
      if (Math.abs(t - DEVOUR_HITS[0]) < 0.009) atRake = d;
      if (Math.abs(t - DEVOUR_HITS[1] + 0.02) < 0.009) atBite = d;
    });
    assert.ok(atBite < atRake - 1, `dragged in from ${atRake.toFixed(2)} to ${atBite.toFixed(2)} tiles`);
    assert.equal(hurts.length, 1);
    near(hurts[0], DEVOUR_HITS[1], 0.03, 'bitten');
  });
});
