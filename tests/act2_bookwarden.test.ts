// ACT 2, THE HUSH: FLOOR 15'S BOOKWARDENS IN THE GAME, BEHIND ACT2 (game/act1_rules/bookwarden.ts, art/act1_figs/
// bookwarden.ts, render/act1_fx/bookwarden.ts; the art chat's art/bookwardens.ts, bookwardens_moves.ts and
// bookwarden_shots.ts):
//   1. they are built: their rules, their pictures with a clip by each name their acts use, their size as their pictures
//      stand; the art's switch left off;
//   2. the rules' numbers are their pictures' own: their trudge, the slam's moments, where the tome comes down flat (as the
//      art lays it), how far its dust is shoved out, how long its mark lies;
//   3. THE TOME SLAM lands as the tome comes flat on the floor, on whoever is in its dust, and shoves him back; not before
//      the book's near edge, not beyond its dust, not behind; its mark laid where it came down, for its while;
//   4. what they draw: the art's mark, nothing cyan;
//   5. they come in packs of their size on floor 15, and guard its lair;
//   6. a long fight on floor 15 with a pack of them: no exceptions, the slam made.
//   run: tsx --test tests/act2_bookwarden.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { BOOKWARDENS_ON, tomeAt } from '../src/art/bookwardens';
import { BOOKWARDEN as WARDEN_MOB, WB_PACE, WB_SLAM, WB_WALK, tomeWayOf } from '../src/art/bookwardens_moves';
import { TOME_MARK_FOR, TOME_REACH } from '../src/art/bookwarden_shots';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT2 } from '../src/game/act1';
import { ACT2_GUARD, act2Pack } from '../src/game/act2_mobs';
import { BOOKWARDEN, inDust, tomeSpot } from '../src/game/act1_rules/bookwarden';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, sizeOf } from '../src/game/defs';
import { act1Fx } from '../src/render/act1_fx/index';
import { colourCatcher, cyanish, longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { fakeCtx } from './act1_kinds_room';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

paintWithoutCanvas();

test('1. they are built: their rules, their pictures with a clip by each name their acts use, their size', () => {
  const r = act1Rules('bookwarden');
  const fig = act1Fig('bookwarden');
  assert.ok(r && fig && act1Fx('bookwarden'), 'their rules, their pictures and what they draw');
  assert.equal(BOOKWARDENS_ON.on, false, "the art chat's switch left off: nothing of the game draws them while ACT2 is off");
  assert.ok(FIRST5_FIGURES.includes('bookwarden'));
  assert.equal(sizeOf('bookwarden'), 'medium');
  const art = makeBestiary().of('bookwarden');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
  }
  const m = measuredSize('bookwarden');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
});

test("2. the rules' numbers are their pictures' own", () => {
  const G = gaitOf('bookwarden')!;
  assert.equal(G.pace, WB_PACE, 'their trudge at the pace it is painted for');
  assert.equal(MONSTERS.bookwarden.speed, WB_PACE);
  assert.equal(makeBestiary().of('bookwarden').front.walkFps, WB_WALK.fps);
  near(G.cycle, 1 / WB_WALK.fps, 1e-9, 'stopped a frame at a time');
  assert.equal(G.trueBack, WARDEN_MOB.trueBack === true);
  const slam = actsOf({ kind: 'bookwarden' })!.find((a) => a.id === 'bookwarden:slam')!;
  const S = BOOKWARDEN.slam;
  assert.equal(slam.long, WB_SLAM.long);
  assert.equal(slam.hit, WB_SLAM.hit, 'its blow at its moment');
  assert.equal(S.floor, WB_SLAM.floor, 'flat on the floor at its moment');
  assert.equal(WARDEN_MOB.hit, WB_SLAM.hit);
  assert.equal(MONSTERS.bookwarden.windup, WB_SLAM.hit);
  // (where the book lies as it comes flat on the floor, as the art's tome is)
  const k = tomeAt(skeletonAt(WARDEN_MOB, 'attack', WB_SLAM.floor), tomeWayOf('attack', WB_SLAM.floor));
  near(k.mid[0] / TILE3, S.at[0], 0.02, 'the book before them');
  near(k.mid[1] / TILE3, S.at[1], 0.02, 'and to their right, the haft in their right hand');
  assert.ok(k.mid[2] < 4, 'flat on the floor');
  assert.equal(S.reach, TOME_REACH, "its dust's reach the art's");
  assert.equal(S.mark, TOME_MARK_FOR, "its mark's while the art's");
  assert.ok(G.stopAt < slam.far && slam.far <= S.at[0] + S.reach * S.along, 'it stops where the slam reaches him');
});

test('3. the tome slam lands as the tome comes flat on the floor, on whoever is in its dust; its mark laid there', () => {
  // (tiles before them, to their left; whether struck)
  for (const [fwd, left, hurt] of [[1.9, 0, true], [1.2, -0.3, true], [2.6, 0, true], [1.9, 1.0, true], [1.9, -1.5, true], [0.4, 0, false], [3.2, 0, false], [1.9, 1.9, false], [-1, 0, false]] as const) {
    const { g, m } = room('bookwarden', 1.9, 'bookwarden:slam');
    assert.ok(untilAct(g, m, 'bookwarden:slam'), 'it slams');
    const h = g.hero;
    const hand = m.act!.hand;
    h.x = m.x + m.fx * fwd + m.fy * hand * left;
    h.y = m.y + m.fy * fwd - m.fx * hand * left;
    const x0 = h.x;
    const y0 = h.y;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.4, undefined, () => !!m.act && m.act.t >= WB_SLAM.floor + 0.1);
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd}, ${left}: struck once`);
      near(s.hurts[0].t + t0, WB_SLAM.floor, 1.5 / 60, 'as the tome comes flat on the floor');
      const b = tomeSpot(m, hand);
      assert.ok(Math.hypot(h.x - b.x, h.y - b.y) > Math.hypot(x0 - b.x, y0 - b.y) - 0.01, 'shoved back off the book');
      const mark = g.perils.find((p) => p.a1 === 'bookwarden:mark');
      assert.ok(mark && Math.hypot(mark.x - b.x, mark.y - b.y) < 1e-6 && mark.dur === BOOKWARDEN.slam.mark, 'its mark where it came down, for its while');
    } else assert.equal(s.hurts.length, 0, `at ${fwd}, ${left}: out of its dust`);
  }
  // (the dust as the art's, stretched: wider out of its sides than along their way)
  assert.ok(inDust(0, 0, 1, 0, 0, 1.3) && !inDust(0, 0, 1, 0, 1.3, 0), 'out of the sides further than along the way');
});

test('4. what they draw is the art\'s mark, and nothing cyan', () => {
  const { g, m } = room('bookwarden', 1.9, 'bookwarden:slam');
  untilAct(g, m, 'bookwarden:slam');
  watch(g, m, 1.2, undefined, () => g.perils.some((p) => p.a1 === 'bookwarden:mark'));
  const p = g.perils.find((q) => q.a1 === 'bookwarden:mark')!;
  const fx = act1Fx('bookwarden')!;
  const { c } = fakeCtx(g);
  for (const t of [0.05, 0.4, 1.2, 1.7]) {
    const caught = colourCatcher();
    p.t = t;
    fx.ground!({ ...c, g: caught.g }, null, p);
    assert.ok(caught.colours.size > 0, `drawn at ${t}`);
    assert.ok([...caught.colours].every((k) => !cyanish(k)), `nothing cyan at ${t}`);
  }
});

test('5. they come in packs of their size on floor 15, and guard its lair', () => hush(() => {
  assert.equal(ACT2_GUARD[15], 'bookwarden');
  const [lo, hi] = PACK_BY_SIZE.medium;
  const rng = new RNG(8);
  let seen = 0;
  for (let k = 0; k < 400; k++) {
    const p = act2Pack(15, rng, 'normal');
    if (p.kind !== 'bookwarden') continue;
    seen++;
    assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'their own packs on floor 15');
  assert.equal(act2Pack(15, rng, 'champion').kind, 'bookwarden', 'the lair\'s guardians');
}));

test('6. a long fight on floor 15 with a pack of them: no exceptions, the slam made', () => hush(() => {
  const { acts } = longFight('bookwarden', 15, 40);
  assert.ok(acts.has('bookwarden:slam'), 'they slammed');
}));
