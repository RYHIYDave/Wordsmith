// THE CRIER'S FIGHT DONE THE ACTION WAY, IN THE GAME (the art chat's art/crier_action.ts behind CRIER_ACTION, his yes there; his toll, his
// pick of 2 Nov 2026; brought in by the main chat, 2 Nov 2026, behind the same switch, off until his yes here). With the switch on, in a
// practice room, only the move ready:
//   1. off, his old moves; on, the new;
//   2. the toll: a hero who stands struck by toll after toll; one who keeps moving, hardly;
//   3. the shout off the walls: a hero before him struck by the wave; one who gets to the one spot behind him, not;
//   4. the decree: a hero down its lane struck by its roll, then burned standing on it; one who steps off the lane, not;
//   5. the crowd: the Hushed come up out of the pools.
//   run: tsx --test tests/crier_action_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CRIER_ACTION, CROWD_HIT, PROCLAIM_HIT, SHOUT_HIT, SHOUT_HOLD, TOLL_HITS, TOLL_LONG } from '../src/art/crier_action';
import { DECREE, WALLS } from '../src/art/crier_action_fx';
import { act1Rules } from '../src/game/act1_rules/index';
import { beside } from '../src/game/facing';
import { firstHurt, room, watch } from './act1_kinds_room';

function on(fn: () => void): void {
  const was = CRIER_ACTION.on;
  CRIER_ACTION.on = true;
  try {
    fn();
  } finally {
    CRIER_ACTION.on = was;
  }
}

test('1. off, his old moves; on, the new', () => {
  assert.equal(CRIER_ACTION.on, false, 'off until his yes');
  assert.deepEqual(act1Rules('crier')!.acts.map((a) => a.id), ['crier:swing', 'crier:shout', 'crier:proclaim', 'crier:crowd']);
  on(() => assert.deepEqual(act1Rules('crier')!.acts.map((a) => a.id), ['crier:toll', 'crier:shout', 'crier:proclaim', 'crier:crowd']));
});

test('2. the toll: standing, struck toll after toll; moving, hardly', () => {
  on(() => {
    {
      const { g, m } = room('crier', 4, 'crier:toll');
      const s = watch(g, m, TOLL_LONG + 0.8);
      assert.ok(s.acts[0]?.startsWith('crier:toll'), 'he tolls');
      assert.ok(s.hurts.length >= 4, `toll after toll (${s.hurts.length})`);
      assert.ok(firstHurt(s) - s.began > TOLL_HITS[0], 'each a beat after it is rung');
    }
    {
      const { g, m } = room('crier', 4, 'crier:toll');
      // (he keeps moving, round in a ring)
      const s = watch(g, m, TOLL_LONG + 0.8, (t) => ({ mx: -Math.sin(t * 1.8), my: Math.cos(t * 1.8) }));
      assert.ok(s.hurts.length <= 1, `moving, hardly (${s.hurts.length})`);
    }
  });
});

test('3. the shout off the walls: before him, struck by the wave; in the one spot behind him, not', () => {
  on(() => {
    {
      const { g, m } = room('crier', 4, 'crier:shout');
      const s = watch(g, m, SHOUT_HIT + 1.5);
      assert.ok(s.acts[0]?.startsWith('crier:shout'), 'he shouts');
      assert.ok(s.hurts.length >= 1, 'struck by the wave');
      assert.ok(firstHurt(s) - s.began >= SHOUT_HIT, 'not before the shout');
    }
    {
      const { g, m } = room('crier', 4, 'crier:shout');
      watch(g, m, SHOUT_HOLD[0]);
      // (he holds his breath: the hero gets round behind him, to the one spot)
      const w = beside(m.x, m.y, m.fx, m.fy, m.act!.hand, -(WALLS.behind + WALLS.band + 0.6), 0);
      g.hero.x = w.x;
      g.hero.y = w.y;
      const s = watch(g, m, SHOUT_HIT - SHOUT_HOLD[0] + 2);
      assert.equal(s.hurts.length, 0, 'in the one spot, none reach him');
    }
  });
});

test('4. the decree: down its lane, struck by its roll, then burned on it; off the lane, not', () => {
  on(() => {
    {
      const { g, m } = room('crier', 5, 'crier:proclaim');
      const s = watch(g, m, PROCLAIM_HIT + DECREE.unrolled + 0.05);
      assert.ok(s.acts[0]?.startsWith('crier:proclaim'), 'he flings it');
      assert.equal(s.hurts.length, 1, 'struck by its roll');
      const s2 = watch(g, m, 2);
      assert.ok(s2.hurts.length >= 2, `burned on it (${s2.hurts.length})`);
    }
    {
      const { g, m } = room('crier', 5, 'crier:proclaim');
      const s = watch(g, m, PROCLAIM_HIT + 3, (t) => (t > 0.5 && t < PROCLAIM_HIT ? { mx: 0, my: 1 } : null));
      assert.ok(Math.abs(g.hero.y - m.y) > DECREE.half + 0.3, 'off its lane');
      assert.equal(s.hurts.length, 0, 'not struck, not burned');
    }
  });
});

test('5. the crowd: the Hushed come up out of the pools', () => {
  on(() => {
    const { g, m } = room('crier', 4, 'crier:crowd');
    watch(g, m, CROWD_HIT + 2);
    const called = g.monsters.filter((o) => !o.dead && o.a1?.crierCalled);
    assert.ok(called.length >= 1, `they come (${called.length})`);
  });
});
