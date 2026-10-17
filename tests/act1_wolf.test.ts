// ACT 1: THE FOG WOLVES (FLOOR 9) IN THE GAME (game/act1_rules/wolf.ts, art/act1_figs/wolf.ts):
//   1. it is built: its rules, its pictures (the art chat's, each with his yes) with a clip by each name its acts use,
//      its switch on with the descent, its size as its pictures stand;
//   2. the rules' numbers are its pictures' own;
//   3. its bite lands at its picture's moment, before it as far as its jaws reach, and not further;
//   4. THEY CIRCLE TO COME AT YOU FROM BEHIND (his design doc): one in front of the hero goes round him to his back
//      before it bites; a pack spreads round behind him; one that is blocked, or has circled long, comes straight in;
//      one he walks into bites;
//   5. it comes in packs of its size, on its floor;
//   6. a long fight on its floor with a pack of them: no exceptions, and its bite made.
//   run: tsx --test tests/act1_wolf.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { WOLF_BITE, WOLF_ON, WOLF_PACE, WOLF_WALK, wolfLong } from '../src/art/fog_wolves';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { act1Rules } from '../src/game/act1_rules/index';
import { WOLF, roundToBack } from '../src/game/act1_rules/wolf';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { act1Fx } from '../src/render/act1_fx/index';
import { longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

/** How far round from straight before the hero a point is (radians, 0 before him, pi behind). */
const roundFrom = (h: { x: number; y: number; fx: number; fy: number }, p: { x: number; y: number }): number => {
  const d = Math.hypot(p.x - h.x, p.y - h.y) || 1;
  return Math.acos(Math.max(-1, Math.min(1, ((p.x - h.x) * h.fx + (p.y - h.y) * h.fy) / d)));
};

test('1. it is built: its rules, its pictures with a clip by each name its acts use, its switch on with the descent, its size', () => {
  const r = act1Rules('wolf');
  const fig = act1Fig('wolf');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(WOLF_ON), "the art chat's switch is its");
  assert.equal(WOLF_ON.on, ACT1.on, 'on with the descent');
  assert.ok(FIRST5_FIGURES.includes('wolf'));
  const art = makeBestiary().of('wolf');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
  }
  const m = measuredSize('wolf');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
  assert.equal(act1Fx('wolf'), null, 'nothing drawn beyond its figure');
});

test("2. the rules' numbers are its pictures' own", () => {
  const G = gaitOf('wolf')!;
  assert.equal(G.pace, WOLF_PACE, 'its glide at the pace it is painted for');
  assert.equal(MONSTERS.wolf.speed, WOLF_PACE);
  near(G.cycle, 1 / WOLF_WALK.fps, 1e-9, 'it may stop at any frame of its glide');
  const acts = actsOf({ kind: 'wolf' })!;
  assert.equal(acts.length, 1, 'small: one attack');
  const bite = acts[0];
  assert.equal(bite.clip, 'attack');
  assert.equal(bite.hit, WOLF_BITE.hit);
  assert.equal(bite.long, wolfLong('attack'));
  near(WOLF.bite.reach, WOLF_BITE.reach / TILE3, 0.005, 'its jaws as far as they reach');
  assert.equal(MONSTERS.wolf.windup, WOLF_BITE.hit);
  assert.ok(G.stopAt < bite.far && bite.far <= WOLF.bite.reach + TUNE.heroRadius * 0.5, 'it stops inside its reach');
});

test('3. its bite lands at its moment, before it as far as its jaws reach, and not further', () => {
  for (const [far, hurt] of [[0.8, true], [1.3, true], [1.5, false]] as const) {
    const { g, m } = room('wolf', 1.0, 'wolf:bite');
    assert.ok(untilAct(g, m, 'wolf:bite'), 'it bites');
    g.hero.x = m.x + m.fx * far;
    g.hero.y = m.y + m.fy * far;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.2, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${far}: bitten once`);
      near(s.hurts[0].t + t0, WOLF_BITE.hit, 1.5 / 60, 'as its jaws shut');
    } else assert.equal(s.hurts.length, 0, 'beyond its jaws: not bitten');
  }
});

test('4. they circle round to come at you from behind', () => {
  // (one before him, four tiles off: it is behind him when it bites; its first bite within a few seconds)
  for (const seed of [0, 1, 2, 3]) {
    const { g, m } = room('wolf', 4, null, 1);
    m.seed = seed / 4 + 0.1;
    const h = g.hero;
    let widest = 0;
    let circled = false;
    const s = watch(g, m, 8, () => {
      h.fx = 1;
      h.fy = 0;
    }, () => {
      widest = Math.max(widest, roundFrom(h, m));
      if (m.a1 && m.a1.circ > 0) circled = true;
      return m.state === 'act';
    });
    assert.ok(circled, 'it circled');
    assert.ok(s.began > 0 && s.began < 4, `it came in and bit (at ${s.began.toFixed(2)} s)`);
    assert.ok(roundFrom(h, m) > (110 * Math.PI) / 180, `seed ${seed}: it bites from behind him (${((roundFrom(h, m) * 180) / Math.PI).toFixed(0)} degrees round)`);
    assert.ok(Math.abs(roundToBack(m, h)) <= WOLF.circle.behind + 0.15, 'at its place behind him');
  }
  // (a pack spreads round behind him: not all on one spot)
  const { g, all } = room('wolf', 4, null, 5);
  const h = g.hero;
  all.forEach((m, i) => (m.seed = i / 5 + 0.05));
  const at: { x: number; y: number }[] = [];
  watch(g, all[0], 6, () => {
    h.fx = 1;
    h.fy = 0;
  }, () => {
    for (const m of all) if (m.state === 'act' && !at.some((q) => q === m)) at.push({ x: m.x, y: m.y });
    return at.length >= 3;
  });
  const bearings = all.map((m) => Math.atan2(m.y - h.y, m.x - h.x));
  const spread = Math.max(...bearings.map((b) => Math.abs(Math.atan2(Math.sin(b - Math.PI), Math.cos(b - Math.PI)))));
  assert.ok(spread > 0.25, 'spread round behind him, not one on another');
  // (a hero who keeps turning to face it is not circled for ever: it comes straight in)
  {
    const { g: g2, m } = room('wolf', 4, null, 1);
    const h2 = g2.hero;
    const s = watch(g2, m, 9, () => {
      const d = Math.hypot(m.x - h2.x, m.y - h2.y) || 1;
      h2.fx = (m.x - h2.x) / d;
      h2.fy = (m.y - h2.y) / d;
    }, () => m.state === 'act');
    assert.ok(s.began > 0 && s.began < WOLF.circle.most + 2, `it came straight in after circling a while (${s.began.toFixed(2)} s)`);
  }
  // (one he walks into bites, wherever it is round him)
  {
    const { g: g3, m } = room('wolf', 1.1, null, 1);
    const s = watch(g3, m, 2, () => {
      g3.hero.fx = 1;
      g3.hero.fy = 0;
    }, () => m.state === 'act');
    assert.ok(s.began > 0 && s.began < 0.5 && !(m.a1 && m.a1.circ > 0), 'near enough to bite: it bites, before him');
  }
});

test('5. it comes in packs of its size, on its floor', () => {
  assert.equal(sizeOf('wolf'), 'small');
  const [lo, hi] = PACK_BY_SIZE.small;
  const rng = new RNG(5);
  let seen = 0;
  for (let k = 0; k < 400; k++) {
    const p = act1Pack(9, rng, 'normal');
    if (p.kind !== 'wolf') continue;
    seen++;
    assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'its own packs on floor 9, no stand-in');
});

test('6. a long fight on its floor with a pack of them: no exceptions, its bite made', () => {
  const { acts } = longFight('wolf', 9, 40);
  assert.ok(acts.has('wolf:bite'), 'it bit');
});
