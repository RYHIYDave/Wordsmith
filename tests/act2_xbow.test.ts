// THE HIGH CITY, FLOOR 19: THE CROSSBOWMEN ON THE WALLS (game/act1_rules/xbow.ts, render/act1_fx/xbow.ts, art/act1_figs/xbow.ts;
// the art chat's pictures, his yes “Yes, that's them (Recommended)”; his pick for how they move, “Stand and shoot”):
//   1. their numbers are the art's (the shot, the reload, the plant, the lane);
//   2. posted: they hold their spot, never walking, whatever he does; one shot, then the reload, every time;
//   3. the aimed shot: aimed at him, the aim held from as the line is drawn out; he is struck standing in the lane, and not if he
//      steps out of it while it is held;
//   4. the lane drawn on the floor in a deep warning red (never pink, never cyan) from as the line is drawn out to the strike, and
//      gone after; the bolt over it at the strike.
//   run: tsx --test tests/act2_xbow.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CB_PACE, CB_PLANT, CB_RELOAD, CB_SHOT } from '../src/art/keep_crossbowmen_moves';
import { CB_LANE, LINE_RED } from '../src/art/keep_crossbowmen_fx';
import { TILE3 } from '../src/art/new_mobs3';
import { act1Rules } from '../src/game/act1_rules/index';
import { XBOW_TUNE, planted } from '../src/game/act1_rules/xbow';
import { act1Fx } from '../src/render/act1_fx/index';
import { colourCatcher, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

test("1. their numbers are the art's", () => {
  const R = act1Rules('xbow')!;
  assert.ok(R, 'their rules');
  const by = (id: string) => R.acts.find((a) => a.id === id)!;
  assert.equal(by('xbow:shot').long, CB_SHOT.long);
  assert.equal(by('xbow:shot').hit, CB_SHOT.hit);
  assert.equal(by('xbow:shot').clip, 'attack');
  assert.equal(by('xbow:reload').long, CB_RELOAD.long);
  assert.ok(by('xbow:reload').forced && by('xbow:plant').forced, 'the reload and the plant are brought by the rules, not chosen');
  assert.equal(by('xbow:plant').long, CB_PLANT.long);
  assert.equal(R.gait.pace, CB_PACE);
  assert.equal(XBOW_TUNE.lane.tiles, CB_LANE.tiles);
  assert.equal(XBOW_TUNE.lane.wide, CB_LANE.wide);
  assert.ok(Math.abs(XBOW_TUNE.lane.from - CB_LANE.from / TILE3) < 0.02, `the lane begins before the pavise (${(CB_LANE.from / TILE3).toFixed(3)})`);
  assert.equal(R.acts.filter((a) => !a.forced).length, 1, 'small: one attack');
});

test('2-3. posted, they hold their spot; the shot, then the reload; struck in the lane, not out of it', () => {
  const { g, m } = room('xbow', 6);
  assert.ok(planted(m), 'planted at his post');
  const x0 = m.x;
  const y0 = m.y;
  const h = g.hero;
  // (he stands in the lane: struck once, at the bolt's moment)
  assert.ok(untilAct(g, m, 'xbow:shot' as never), 'he shoots');
  const seen = watch(g, m, CB_SHOT.long + 0.2);
  assert.equal(seen.hurts.length, 1, 'struck once, standing in the lane');
  assert.ok(Math.abs(m.x - x0) < 1e-6 && Math.abs(m.y - y0) < 1e-6, 'he has not moved');
  assert.ok(untilAct(g, m, 'xbow:reload' as never, 1), 'the reload after the shot');
  const r = watch(g, m, CB_RELOAD.long + 0.1);
  assert.equal(r.hurts.length, 0);
  // (he steps out of the lane while the line is held: not struck)
  assert.ok(untilAct(g, m, 'xbow:shot' as never), 'he shoots again');
  const step = watch(g, m, CB_SHOT.long + 0.2, (t) => {
    if (t > CB_SHOT.line[0] + 0.05 && t < CB_SHOT.line[0] + 0.1) h.y += 1.6;
  });
  assert.equal(step.hurts.length, 0, 'out of the lane as it was held: not struck');
  // (he goes far off and comes round him: the crossbowman never walks)
  watch(g, m, 6, (t) => {
    h.x = x0 - 9 + Math.cos(t) * 2;
    h.y = y0 + Math.sin(t) * 3;
  });
  assert.ok(Math.abs(m.x - x0) < 1e-6 && Math.abs(m.y - y0) < 1e-6, 'he holds his spot');
});

test('4. the lane in a deep warning red from as the line is drawn out to the strike; the bolt at the strike', () => {
  const fx = act1Fx('xbow')!;
  const { g, m } = room('xbow', 6);
  assert.ok(untilAct(g, m, 'xbow:shot' as never));
  const at = (x: number, y: number): [number, number] => [(x - y) * 16 + 400, (x + y) * 8 + 300];
  const drawn = (t: number, layer: 'ground' | 'air'): Set<string> => {
    m.act!.t = t;
    const { g: canvas, colours } = colourCatcher();
    fx[layer]!({ g: canvas as never, at, game: g, t: 0, bestiary: null as never, stand: () => {}, spot: () => {} }, m, null);
    return colours;
  };
  assert.equal(drawn(CB_SHOT.line[0] - 0.05, 'ground').size, 0, 'nothing before the line is drawn out');
  for (const t of [CB_SHOT.line[0] + 0.05, CB_SHOT.warn[0] + 0.2, CB_SHOT.steady[0] + 0.05]) {
    const c = drawn(t, 'ground');
    assert.ok(c.size > 0, `the lane at ${t.toFixed(2)}`);
    for (const k of c) assert.ok((LINE_RED as readonly string[]).includes(k), `${k}: the art's red`);
  }
  assert.equal(drawn(CB_SHOT.hit + 0.01, 'ground').size, 0, 'the lane gone as the bolt flies');
  assert.ok(drawn(CB_SHOT.hit, 'air').size > 0, 'the bolt at the strike');
  assert.equal(drawn(CB_SHOT.line[0] + 0.3, 'air').size, 0, 'no bolt before');
});
