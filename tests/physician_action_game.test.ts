// THE PHYSICIAN'S FIGHT DONE THE ACTION WAY, IN THE GAME (the art chat's art/physician_action.ts and physician_action_fx.ts behind
// PHYSICIAN_ACTION, his yes there: "Diagnosis (Recommended)", 31 Oct; "Bigger operation", 2 Nov; brought in by the main chat, 2 Nov 2026,
// behind the same switch, off until his yes here). With the switch on, in a practice room, only the move ready:
//   1. off, his old moves; on, the new (the tonic gone for the Diagnosis, his operation its end);
//   2. the rap: a hero in the star of cracks far before him struck as the ferrule comes down; one behind him, not;
//   3. the Draw: a hero down its lane struck and a word drawn out of him, hung over his head from as the plunger is pushed home;
//   4. THE DIAGNOSIS: a hero who stands in the open in its light: the mark full in about BEAM.fill, and he operates there and then:
//      the field locked where the hero stood, the room dark; a hero who stays in the spotlight struck once, hard, at OP_HIT; one who
//      gets out of the light as it goes dark, not;
//   5. behind cover (a bed between them), the mark never fills; he looks his while, lowers the lens, and the act is over;
//   6. the beam follows a running hero, a breath behind;
//   7. ROUNDS: each ring of the Hush, as it passes him, hushes him;
//   8. killed as he operates: the field gone, the light back.
//   run: tsx --test tests/physician_action_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { DIAG, DRAW9, DRAW9_HIT, OP_HIT, PHYSICIAN_ACTION, RAP9_HIT, ROUNDS9_HITS, ROUNDS9_LONG } from '../src/art/physician_action';
import { BEAM, ESCAPE, FIELD, OPERATION, RAP, RINGS, opDark } from '../src/art/physician_action_fx';
import { act1Rules } from '../src/game/act1_rules/index';
import { LOOK_FOR, OP_PERIL, RULES, heldWord, lensSpot, operationNow } from '../src/game/act1_rules/physician';
import { beside } from '../src/game/facing';
import type { Game } from '../src/game/game';
import type { Monster, PropInst } from '../src/game/state';
import { PATIENT } from '../src/game/act1_rules/patient';
import type { WordId } from '../src/game/types';
import { firstHurt, room, watch } from './act1_kinds_room';

function on(fn: () => void): void {
  const was = PHYSICIAN_ACTION.on;
  PHYSICIAN_ACTION.on = true;
  try {
    fn();
  } finally {
    PHYSICIAN_ACTION.on = was;
  }
}
const ids = (): string[] => act1Rules('physician')!.acts.map((a) => a.id);
/** The hero with this word set in the first socket of his first attack. */
function setWord(g: Game, w: WordId = 'fire'): void {
  const h = g.hero;
  h.skills[0].front[0] = w;
  h.words[w] = Math.max(0, (h.words[w] ?? 1) - 1);
  g.refresh();
}
/** Tiles that cannot be walked (a bed's) across the way between him and the hero, `at` tiles before him. */
function wallAcross(g: Game, m: Monster, at: number): void {
  const L = g.level;
  for (let k = -3; k <= 3; k++) {
    const x = Math.floor(m.x + at);
    const y = Math.floor(m.y + k);
    L.walk[y * L.floor.w + x] = 0;
  }
}

test('1. off, his old moves; on, the new', () => {
  assert.equal(PHYSICIAN_ACTION.on, false, 'off until his yes');
  assert.deepEqual(ids(), ['physician:rap', 'physician:draw', 'physician:tonic', 'physician:rounds']);
  on(() => assert.deepEqual(ids(), ['physician:rap', 'physician:draw', 'physician:diagnose', 'physician:operate', 'physician:rounds']));
});

test('2. the rap: in the star far before him, struck as the ferrule comes down; behind him, not', () => {
  on(() => {
    {
      const { g, m } = room('physician', RAP.ahead + 0.6, 'physician:rap');
      const s = watch(g, m, RAP9_HIT + 0.5);
      assert.ok(s.acts[0]?.startsWith('physician:rap'), 'he raps');
      assert.equal(s.hurts.length, 1, 'struck');
      assert.ok(Math.abs(firstHurt(s) - s.began - RAP9_HIT) < 0.05, 'as the ferrule comes down');
    }
    {
      const { g, m } = room('physician', 2, 'physician:rap');
      watch(g, m, 0.3);
      g.hero.x = m.x - 1.4;
      g.hero.y = m.y;
      assert.equal(watch(g, m, RAP9_HIT).hurts.length, 0, 'behind him, not');
    }
    assert.ok(RAP.ahead + RAP.r > 3, 'further than the old (1.57)');
  });
});

test('3. the Draw: down its lane, struck and a word drawn out; it hangs over his head from as the plunger is pushed home', () => {
  on(() => {
    const { g, m } = room('physician', 3, 'physician:draw');
    setWord(g, 'fire');
    const s = watch(g, m, DRAW9_HIT + 0.1);
    assert.ok(s.acts[0]?.startsWith('physician:draw'), 'he lunges');
    assert.equal(s.hurts.length, 1, 'struck');
    assert.equal(heldWord(m), 'fire', 'the word drawn out of him');
    assert.equal(g.hero.skills[0].front[0], null, 'out of its socket');
    watch(g, m, DRAW9.push[0] - DRAW9_HIT + 0.05);
    assert.ok((m.a1!.upT ?? -1) >= 0, 'hung over his head');
  });
});

test('4. THE DIAGNOSIS: in the open, the mark fills, he operates: in the spotlight struck once, hard; out of the light, not', () => {
  on(() => {
    for (const run of [false, true]) {
      const { g, m } = room('physician', 6, 'physician:diagnose');
      const h = g.hero;
      const x0 = h.x;
      const y0 = h.y;
      let full = -1;
      let dark = 0;
      let k = 0;
      const s = watch(
        g,
        m,
        DIAG.up + BEAM.fill + 0.6 + OP_HIT + 0.4,
        (t) => (run && full >= 0 && t > full + OPERATION.fall[1] ? { mx: 0, my: 1 } : null),
        () => {
          k++;
          if (full < 0 && m.act?.id === 'physician:operate') full = k / 60;
          const op = operationNow(g.perils);
          if (op) dark = Math.max(dark, opDark(op.t));
          return false;
        },
      );
      assert.ok(s.acts[0]?.startsWith('physician:diagnose'), 'he looks through his lens');
      assert.ok(s.acts.some((a) => a.startsWith('physician:operate')), 'the mark full, he operates');
      const op = g.perils.find((p) => p.a1 === OP_PERIL);
      assert.ok(op, 'the field');
      assert.ok(Math.hypot(op!.x - x0, op!.y - y0) < 0.05, 'locked where the hero stood');
      assert.equal(dark, 1, 'the room dark');
      if (!run) {
        assert.equal(s.hurts.length, 1, 'in the spotlight, struck once');
        assert.ok(s.hurts[0].n > 30, `hard (${s.hurts[0].n.toFixed(0)})`);
      } else {
        assert.ok(Math.hypot(h.x - op!.x, h.y - op!.y) > FIELD.r, 'out of the light');
        assert.equal(s.hurts.length, 0, 'not struck');
      }
    }
    assert.ok(ESCAPE >= 1.1, 'time to get out of it');
  });
});

test('4b. the mark full in about BEAM.fill of standing in the light', () => {
  on(() => {
    const { g, m } = room('physician', 6, 'physician:diagnose');
    let up = -1;
    let full = -1;
    let t = 0;
    watch(g, m, DIAG.up + BEAM.fill + 1, undefined, () => {
      t += 1 / 60;
      if (up < 0 && m.a1?.dOn) up = t;
      if (full < 0 && m.act?.id === 'physician:operate') full = t;
      return full >= 0;
    });
    assert.ok(up >= 0 && full >= 0, 'up, and full');
    assert.ok(Math.abs(full - up - BEAM.fill) < 0.15, `full in ${(full - up).toFixed(2)} s`);
  });
});

test('5. behind cover the mark never fills: he looks his while, lowers the lens, and is done', () => {
  on(() => {
    const { g, m } = room('physician', 6, 'physician:diagnose');
    // (he begins in the open; then a bed between them)
    watch(g, m, DIAG.up + 0.2);
    assert.equal(m.act?.id, 'physician:diagnose', 'he looks');
    wallAcross(g, m, 3);
    let most = 0;
    const s = watch(g, m, LOOK_FOR + DIAG.long, undefined, () => {
      most = Math.max(most, m.a1?.dFill ?? 0);
      return m.state !== 'act';
    });
    assert.ok(most < 0.4, `hid, it drains (${most.toFixed(2)})`);
    assert.ok(!s.acts.some((a) => a.startsWith('physician:operate')), 'no operation');
    assert.notEqual(m.state, 'act', 'he lowers it and is done');
    assert.ok(!operationNow(g.perils), 'no dark');
  });
});

test('6. the beam follows a running hero a breath behind', () => {
  on(() => {
    const { g, m } = room('physician', 6, 'physician:diagnose');
    watch(g, m, DIAG.up + 0.1);
    const L = lensSpot(m, m.act!.hand);
    // (he runs across the beam)
    watch(g, m, 0.6, () => ({ mx: 0, my: 1 }));
    const h = g.hero;
    const want = Math.atan2(h.y - L.y, h.x - L.x);
    const aim = m.a1!.dAim;
    const off = Math.abs(Math.atan2(Math.sin(want - aim), Math.cos(want - aim)));
    assert.ok(off < BEAM.half, `still on him (${off.toFixed(3)})`);
    assert.ok(off > 0.001, 'a breath behind');
  });
});

test('7. ROUNDS: each ring of the Hush that passes him hushes him', () => {
  on(() => {
    const { g, m } = room('physician', 4, 'physician:rounds');
    // (a ward bed by him, for a patient to rise from: he makes his rounds only with someone to raise)
    const L = g.level;
    const tx = Math.floor(m.x) - 2;
    const ty = Math.floor(m.y) - 3;
    const bed: PropInst = { kind: 'piece', name: PATIENT.bed.piece, tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: 2 };
    L.props.push(bed);
    L.walk[ty * L.floor.w + tx] = 0;
    let hushed = 0;
    let was = 0;
    const s = watch(g, m, ROUNDS9_LONG, undefined, () => {
      if (g.hushT > was + 1e-6) hushed++;
      was = g.hushT;
      return false;
    });
    assert.ok(s.acts[0]?.startsWith('physician:rounds'), 'he makes his rounds');
    assert.ok(hushed >= 1, `hushed (${hushed})`);
    const S = beside(m.x, m.y, m.fx, m.fy, m.act?.hand ?? 1, RINGS.ahead, RINGS.left);
    assert.ok(Math.hypot(g.hero.x - S.x, g.hero.y - S.y) < RINGS.reach, 'within its reach');
    assert.equal(ROUNDS9_HITS.length, 3);
  });
});

test('8. killed as he operates: the field gone, the light back', () => {
  on(() => {
    const { g, m } = room('physician', 6, 'physician:diagnose');
    watch(g, m, DIAG.up + BEAM.fill + 0.5, undefined, () => m.act?.id === 'physician:operate');
    assert.equal(m.act?.id, 'physician:operate');
    watch(g, m, 0.3);
    assert.ok(operationNow(g.perils), 'dark');
    RULES!.died!(g.bosses, m);
    m.dead = true;
    assert.equal(operationNow(g.perils), null, 'the light back');
  });
});
