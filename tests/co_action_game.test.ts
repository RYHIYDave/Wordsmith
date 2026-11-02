// THE CHAINED ONE'S MOVES DONE THE ACTION WAY, IN THE GAME (game/bosses.ts CO_ACTION, CO2, coActing; the art chat's
// art/chained_action.ts behind CHAINED_ACTION; his "Yes, that's it (Recommended)" to each, 31 Oct 2026). Held here, with both
// switches on for each test:
//   1. off, his old acts; on, the new, their blows where his pictures have them, and the art's switch with it;
//   2. the lash: before him, struck by the forehand, the backhand and the crack; out past his chains, by the crack alone; behind
//      him, not at all; the crack's lane marked as his fists go up; he steps in LASH_TRAVEL as it ends;
//   3. the whirl: his chains strike again and again as he spins; the ring, marked as his fists go up, strikes as it lands;
//   4. the hook: caught as it bites, dragged in, and the blow waiting comes down where he lies;
//   5. the ball: its ring marked from its warning; struck where it lands; out of the mark, not.
//   run: tsx --test tests/co_action_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BALL_LAND, CHAINED_ACTION, HOOK_BACK, HOOK_BITE, HOOK_BLOW, LASH_HITS, LASH_LONG, WHIRL_HIT } from '../src/art/chained_action';
import { CRACK, RING } from '../src/art/chained_action_fx';
import { useCoAction } from '../src/art/bestiary';
import { RNG } from '../src/engine/rng';
import { ACTS, CO2, CO2_ACTS, CO_ACTION, CO_CRACK, actTimeOf, actsOf } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ActId, Monster } from '../src/game/state';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}
function on(fn: () => void): void {
  const was = CO_ACTION.on;
  useCoAction(true);
  try {
    fn();
  } finally {
    useCoAction(was);
  }
}
/** The practice room, emptied: the Chained One `far` tiles west of the hero, facing him, awake, beginning act `id`. */
function room(far: number, id: ActId): { g: Game; m: Monster } {
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x += Math.max(0, far - 7);
  const m = g.spawn('chained', h.x - far, h.y, -2, 0, false, new RNG(9), null, null);
  hooks.wakeUp(m);
  m.words = [];
  m.shield = 0;
  m.life = m.maxLife = 1e9;
  m.fx = 1;
  m.fy = 0;
  g.events.length = 0;
  g.bosses.startAct(m, CO2_ACTS, CO2_ACTS.findIndex((a) => a.id === id));
  return { g, m };
}
/** Steps the game on for `secs` (sixty a second): the hero stands, his life put back each step; when he was struck. `each`: told the clock. */
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

test('1. off, his old acts; on, the new, where his pictures have them, and his new pictures with them', () => {
  assert.equal(CO_ACTION.on, false);
  assert.equal(CHAINED_ACTION.on, false);
  assert.equal(actsOf({ kind: 'chained' }), ACTS.chained);
  on(() => {
    assert.ok(CHAINED_ACTION.on, 'the art with the rules');
    assert.equal(actsOf({ kind: 'chained' }), CO2_ACTS);
    const by = (id: string) => CO2_ACTS.find((a) => a.id === id)!;
    assert.equal(by('lash').long, LASH_LONG);
    assert.equal(by('lash').hit, LASH_HITS[0]);
    assert.ok(by('whirl').loop && Math.abs(actTimeOf(by('whirl'), WHIRL_HIT) - WHIRL_HIT - by('whirl').loop!.extra) < 1e-9, 'the whirl\'s ring after its loop played round');
    assert.deepEqual(CO2_ACTS.map((a) => a.id), ACTS.chained.map((a) => a.id), 'the same acts, done the new way');
  });
});

test('2. the lash: forehand, backhand, crack; past his chains the crack alone; behind him nothing; he steps in', () => {
  on(() => {
    const a = room(2.5, 'lash');
    const x0 = a.m.x;
    let lane = -1;
    const hurts = watch(a.g, LASH_LONG + 0.2, (t) => {
      if (lane < 0 && a.g.perils.some((p) => p.a1 === CO_CRACK)) lane = t;
    });
    assert.equal(hurts.length, 3, `struck at ${hurts.map((t) => t.toFixed(2)).join(', ')}`);
    near(hurts[0], LASH_HITS[0], 0.03, 'the forehand');
    near(hurts[1], LASH_HITS[1], 0.03, 'the backhand');
    near(hurts[2], LASH_HITS[2], CRACK.run, 'the crack');
    near(lane, CO2.crackWarn, 0.03, 'its lane marked as his fists go up');
    near(a.m.x - x0, CO2.travel, 0.02, 'stepped in');
    const b = room(5, 'lash');
    assert.equal(watch(b.g, LASH_LONG + 0.2).length, 1, 'past his chains: the crack');
    const c = room(2.5, 'lash');
    c.g.hero.x = c.m.x - 2.5;
    assert.equal(watch(c.g, LASH_LONG + 0.2).length, 0, 'behind him: nothing');
  });
});

test('3. the whirl: his chains again and again as he spins; the ring, marked, as it lands', () => {
  on(() => {
    const { g, m } = room(2.0, 'whirl');
    const a = CO2_ACTS.find((q) => q.id === 'whirl')!;
    let marked = -1;
    const hurts = watch(g, a.long + 0.2, (t) => {
      if (marked < 0 && g.zones.some((z) => z.kind === 'warn' && z.src === m.id && Math.abs(z.r - RING.whirl) < 1e-9)) marked = t;
    });
    const ring = actTimeOf(a, WHIRL_HIT);
    const spun = hurts.filter((t) => t < ring - 0.05);
    assert.ok(spun.length >= 4, `his chains struck ${spun.length} times as he spun`);
    assert.ok(hurts.some((t) => Math.abs(t - ring) < 0.03), 'the ring');
    near(marked, actTimeOf(a, CO2.whirl.warn), 0.03, 'its ring marked');
  });
});

test('4. the hook: caught as it bites, dragged in, and the blow waiting', () => {
  on(() => {
    const { g, m } = room(5, 'hook');
    let held = -1;
    let inAt = 99;
    const hurts = watch(g, HOOK_BLOW + 0.4, (t) => {
      if (held < 0 && (g.hero.held ?? 0) > 0) held = t;
      if (Math.abs(t - HOOK_BACK) < 0.01) inAt = Math.hypot(g.hero.x - m.x, g.hero.y - m.y);
    });
    near(held, HOOK_BITE, 0.08, 'caught as it bites');
    assert.ok(inAt < 2.2, `dragged in to ${inAt.toFixed(2)} tiles`);
    assert.equal(hurts.length, 2, `struck at ${hurts.map((t) => t.toFixed(2)).join(', ')}`);
    near(hurts[1], HOOK_BLOW, 0.03, 'the blow waiting');
  });
});

test('5. the ball: marked; struck where it lands; out of the mark, not', () => {
  on(() => {
    const a = room(4.5, 'ball');
    let marked = -1;
    const hurts = watch(a.g, BALL_LAND + 0.3, (t) => {
      if (marked < 0 && a.g.zones.some((z) => z.kind === 'warn' && z.src === a.m.id)) marked = t;
    });
    near(marked, CO2.ball.warn, 0.03, 'marked');
    assert.equal(hurts.length, 1);
    near(hurts[0], BALL_LAND, 0.03, 'as it lands');
    const b = room(4.5, 'ball');
    let ran = false;
    const missed = watch(b.g, BALL_LAND + 0.3, () => {
      if (!ran && b.g.zones.some((z) => z.kind === 'warn' && z.src === b.m.id)) {
        ran = true;
        b.g.hero.y += RING.ball + 1;
      }
    });
    assert.equal(missed.length, 0, 'out of the mark');
  });
});
