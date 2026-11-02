// FLOORS 6 TO 8'S NEW MOVES, IN THE GAME (the art chat's art/action_f6_*.ts behind their switches, his yes to each there; brought in by
// the main chat, 2 Nov 2026, behind the same switches, off until his yes here). Each with its switch on, in a practice room, the
// monster awake before the hero, only that move ready:
//   1. off, the old moves; on, the new;
//   2. the firepot's lob: a hero who stands is struck as it bursts, and burns; one who is gone from where it was thrown, not;
//   3. the Chanter's chain lightning: a hero in its ring is struck; one who steps out of it before it strikes, not;
//   4. the quarry golem's hammer reaches a hero before it, not one behind it; its boulder strikes a hero in its lane, not one who
//      has stepped out of it;
//   5. the canyon scorpion's spit: a hero who stands is struck as it splashes and poisoned in its pool; one gone from under it, not;
//   6. the dust devil's twister: a hero who stands by it is struck and dragged.
//   run: tsx --test tests/action_f6_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CAST_HIT, CHAIN, CHANTER_LIGHTNING, FIREPOT_BLAZE } from '../src/art/action_f6_cult';
import { DEVIL_TWISTER, SCORPION_SPIT, SPIT, TW, TW_HIT } from '../src/art/action_f6_canyon';
import { BOULDER, GOLEM_BOULDER, HAMMER, HAMMER_HIT, ROLL_HIT } from '../src/art/action_f6_golem';
import { act1Rules } from '../src/game/act1_rules/index';
import { firepotNums } from '../src/game/act1_rules/firepot';
import { firstHurt, room, watch } from './act1_kinds_room';

/** With `sw` on for `fn`. */
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
  for (const sw of [FIREPOT_BLAZE, CHANTER_LIGHTNING, GOLEM_BOULDER, SCORPION_SPIT, DEVIL_TWISTER]) assert.equal(sw.on, false, 'off until his yes');
  assert.deepEqual(ids('chanter'), ['chanter:bolt']);
  assert.deepEqual(ids('qgolem'), ['qgolem:hammer', 'qgolem:throw']);
  assert.deepEqual(ids('scorpion'), ['scorpion:snap', 'scorpion:sting']);
  on(CHANTER_LIGHTNING, () => assert.deepEqual(ids('chanter'), ['chanter:cast']));
  on(GOLEM_BOULDER, () => assert.deepEqual(ids('qgolem'), ['qgolem:hammer', 'qgolem:boulder']));
  on(SCORPION_SPIT, () => assert.deepEqual(ids('scorpion'), ['scorpion:snap', 'scorpion:spit']));
  on(DEVIL_TWISTER, () => assert.deepEqual(ids('devil'), ['devil:twister']));
  const old = firepotNums();
  on(FIREPOT_BLAZE, () => {
    const N = firepotNums();
    assert.deepEqual(ids('firepot'), ['firepot:lob']);
    assert.notDeepEqual(N, old, 'its own numbers');
    assert.equal(act1Rules('firepot' as never)!.acts[0].hit, N.hit);
  });
});

test('2. the firepot\'s lob: struck as it bursts and burning, standing; not, gone from where it was thrown', () => {
  on(FIREPOT_BLAZE, () => {
    const N = firepotNums();
    const far = 5;
    {
      const { g, m } = room('firepot', far, 'firepot:lob');
      const s = watch(g, m, N.hit + N.fly(far) + 2);
      assert.ok(s.acts[0]?.startsWith('firepot:lob'), 'it lobs');
      const t = firstHurt(s) - s.began;
      assert.ok(t > N.hit && t < N.hit + N.fly(far) + 0.2, `struck as it bursts (${t.toFixed(2)})`);
      assert.ok(s.hurts.length >= 2, 'and burning after');
    }
    {
      const { g, m } = room('firepot', far, 'firepot:lob');
      const s = watch(g, m, N.hit + N.fly(far) + 2, (t) => (t > N.hit + 0.05 && t < N.hit + 0.6 ? { mx: 0, my: 1 } : null));
      assert.ok(Math.abs(g.hero.y - m.y) > N.burst.r + 0.3, 'he got clear');
      assert.equal(s.hurts.length, 0, 'gone from where it was thrown, not struck');
    }
  });
});

test('3. the Chanter\'s chain lightning: in its ring, struck; stepped out of it before it strikes, not', () => {
  on(CHANTER_LIGHTNING, () => {
    {
      const { g, m } = room('chanter', 4.5, 'chanter:cast');
      const s = watch(g, m, CHAIN.long + 0.5);
      assert.ok(s.acts[0]?.startsWith('chanter:cast'), 'it casts');
      const t = firstHurt(s) - s.began;
      assert.ok(Math.abs(t - CAST_HIT) < 0.06, `struck as it strikes (${t.toFixed(2)})`);
    }
    {
      const { g, m } = room('chanter', 4.5, 'chanter:cast');
      const s = watch(g, m, CHAIN.long + 0.5, (t) => (t > CHAIN.aim + 0.05 && t < CAST_HIT - 0.05 ? { mx: 0, my: 1 } : null));
      assert.equal(s.hurts.length, 0, 'out of its ring in time');
    }
  });
});

test('4. the quarry golem: its hammer before it, not behind; its boulder down its lane, not beside it', () => {
  on(GOLEM_BOULDER, () => {
    {
      const { g, m } = room('qgolem', HAMMER.at, 'qgolem:hammer');
      const s = watch(g, m, HAMMER.long + 0.3);
      assert.ok(s.acts[0]?.startsWith('qgolem:hammer'));
      assert.equal(s.hurts.length, 1, 'struck once');
      assert.ok(Math.abs(firstHurt(s) - s.began - HAMMER_HIT) < 0.05, 'as its fists come down');
    }
    {
      const { g, m } = room('qgolem', HAMMER.at, 'qgolem:hammer');
      const s = watch(g, m, HAMMER.long + 0.3, () => null, () => m.state === 'act');
      // (behind it as its fists come down)
      g.hero.x = m.x - 1.5;
      const s2 = watch(g, m, HAMMER.long);
      assert.equal(s.hurts.length + s2.hurts.length, 0, 'behind it, not');
    }
    {
      const { g, m } = room('qgolem', 5, 'qgolem:boulder');
      const s = watch(g, m, ROLL_HIT + 2);
      assert.ok(s.acts[0]?.startsWith('qgolem:boulder'), 'it bowls');
      assert.equal(s.hurts.length, 1, 'struck once');
      assert.ok(firstHurt(s) - s.began > ROLL_HIT, 'as it comes by');
    }
    {
      const { g, m } = room('qgolem', 5, 'qgolem:boulder');
      const s = watch(g, m, ROLL_HIT + 2, (t) => (t > BOULDER.aim + 0.05 && t < ROLL_HIT ? { mx: 0, my: 1 } : null));
      assert.ok(Math.abs(g.hero.y - m.y) > BOULDER.half + BOULDER.r, 'he got clear of its lane and where it smashes');
      assert.equal(s.hurts.length, 0, 'out of its lane, not');
    }
  });
});

test('5. the canyon scorpion\'s spit: struck as it splashes and poisoned in its pool, standing; gone from under it, not', () => {
  on(SCORPION_SPIT, () => {
    {
      const { g, m } = room('scorpion', 3.5, 'scorpion:spit');
      const s = watch(g, m, SPIT.long + 2);
      assert.ok(s.acts[0]?.startsWith('scorpion:spit'), 'it spits');
      assert.ok(firstHurt(s) - s.began > SPIT.hit, 'struck as the glob comes down');
      assert.ok(s.hurts.length >= 2, 'and stung in its pool');
    }
    {
      const { g, m } = room('scorpion', 3.5, 'scorpion:spit');
      const s = watch(g, m, SPIT.long + 2, (t) => (t > SPIT.hit + 0.02 && t < SPIT.hit + 0.6 ? { mx: 0, my: 1 } : null));
      assert.equal(s.hurts.length, 0, 'gone from under it');
    }
  });
});

test('6. the dust devil\'s twister: a hero who stands by it is struck and dragged', () => {
  on(DEVIL_TWISTER, () => {
    const { g, m } = room('devil', 2.0, 'devil:twister');
    const x0 = g.hero.x;
    const y0 = g.hero.y;
    const s = watch(g, m, TW.long + 0.5);
    assert.ok(s.acts[0]?.startsWith('devil:twister'), 'it spins up its twister');
    assert.ok(s.hurts.length >= 1, 'struck');
    assert.ok(firstHurt(s) - s.began >= TW_HIT - 0.05, 'not before it is up');
    assert.ok(Math.hypot(g.hero.x - x0, g.hero.y - y0) > 0.3, 'dragged');
  });
});
