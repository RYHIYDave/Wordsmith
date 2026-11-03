// THE RAT KING'S FIGHT DONE THE ACTION WAY, IN THE GAME (the art chat's art/ratking_action.ts behind RATKING_ACTION, his yes there; his fix
// of 2 Nov 2026: the sluices an arena hazard, his roll back and bigger; brought in by the main chat, 2 Nov 2026, behind the same switch,
// off until his yes here). With the switch on, in a practice room, only the move ready:
//   1. off, his old moves; on, the new;
//   2. his bite: a hero in the wedge bitten; one behind him, not;
//   3. his roll: a hero in his lane run down once; at its end, one near where he bursts open struck;
//   4. his word: a hero who stands struck as it bursts on him;
//   5. the sluices: on their own clock, the flood down the lanes strikes a hero in one and carries him; a hero on a dry ledge, not.
//   run: tsx --test tests/ratking_action_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { BITE9, RATKING_ACTION, ROLL9, ROLL9_FAR, WORDS9_HIT } from '../src/art/ratking_action';
import { FLOOD, SLUICES, lanesFor } from '../src/art/ratking_action_fx';
import { act1Rules } from '../src/game/act1_rules/index';
import { SLUICE_PERIL, fromCistern } from '../src/game/act1_rules/ratking';
import { firstHurt, room, watch } from './act1_kinds_room';

function on(fn: () => void): void {
  const was = RATKING_ACTION.on;
  RATKING_ACTION.on = true;
  try {
    fn();
  } finally {
    RATKING_ACTION.on = was;
  }
}

test('1. off, his old moves; on, the new', () => {
  assert.equal(RATKING_ACTION.on, false, 'off until his yes');
  on(() => {
    const acts = act1Rules('ratking')!.acts;
    assert.deepEqual(acts.map((a) => a.id), ['ratking:bite', 'ratking:words', 'ratking:roll', 'ratking:unknot']);
    assert.equal(acts[2].long, ROLL9.long, 'his roll one clip');
  });
});

test('2. his bite: in the wedge, bitten; behind him, not', () => {
  on(() => {
    {
      const { g, m } = room('ratking', 2.5, 'ratking:bite');
      const s = watch(g, m, BITE9.long + 0.2);
      assert.ok(s.acts[0]?.startsWith('ratking:bite'), 'he bites');
      assert.equal(s.hurts.length, 1, 'bitten');
    }
    {
      const { g, m } = room('ratking', 2.5, 'ratking:bite');
      watch(g, m, 0.2);
      g.hero.x = m.x - 2;
      assert.equal(watch(g, m, BITE9.long).hurts.length, 0, 'behind him, not');
    }
  });
});

test('3. his roll: run down in his lane, once; near where he bursts open at its end, struck', () => {
  on(() => {
    {
      const { g, m } = room('ratking', 5, 'ratking:roll');
      const s = watch(g, m, ROLL9.long + 0.2);
      assert.ok(s.acts[0]?.startsWith('ratking:roll'), 'he rolls');
      assert.ok(s.hurts.length >= 1, 'run down');
    }
    {
      // (the hero beyond where he stops, near it, out of his lane's way as he comes)
      const { g, m } = room('ratking', ROLL9_FAR + 1.2, 'ratking:roll');
      const s = watch(g, m, ROLL9.long + 0.2);
      assert.ok(s.hurts.some((h) => h.t - s.began >= ROLL9.stop - 0.05), 'struck as he bursts open');
    }
  });
});

test('4. his word: a hero who stands struck as it bursts on him', () => {
  on(() => {
    const { g, m } = room('ratking', 6, 'ratking:words');
    const s = watch(g, m, WORDS9_HIT + 1.2);
    assert.ok(s.acts[0]?.startsWith('ratking:words'), 'he spits it');
    // (one blow: what a poison word leaves on him after ticks a little)
    assert.equal(s.hurts.filter((x) => x.n > s.hurts[0].n * 0.5).length, 1, 'struck');
    assert.ok(firstHurt(s) - s.began > WORDS9_HIT, 'as it comes');
  });
});

test('5. the sluices: on their own clock; in a lane, struck and carried; on a dry ledge, not', () => {
  on(() => {
    for (const where of ['lane', 'ledge'] as const) {
      const { g, m } = room('ratking', 6, 'ratking:bite');
      g.bossMet = true;
      m.moveCd = m.moveCd!.map(() => 1e9);
      m.cd = 1e9;
      watch(g, m, SLUICES.first + 0.1);
      const p = g.perils.find((q) => q.a1 === SLUICE_PERIL);
      assert.ok(p, 'the sluices open on their own, the first time after SLUICES.first');
      const C = { x: p!.x, y: p!.y, alongY: p!.c === 1 };
      const lanes = lanesFor(p!.b).lanes;
      const v = where === 'lane' ? lanes[0].y : (lanes[0].y + lanes[1].y) / 2;
      const [x, y] = fromCistern(C, 0, v);
      g.hero.x = x;
      g.hero.y = y;
      const x0 = g.hero.x;
      const y0 = g.hero.y;
      const s = watch(g, m, SLUICES.burst + 1.5);
      if (where === 'lane') {
        assert.ok(s.hurts.length >= 2, `struck, and again (${s.hurts.length})`);
        assert.ok(Math.hypot(g.hero.x - x0, g.hero.y - y0) > FLOOD.carry * 0.5, 'carried with the water');
      } else assert.equal(s.hurts.length, 0, 'on a dry ledge, not');
    }
  });
});
