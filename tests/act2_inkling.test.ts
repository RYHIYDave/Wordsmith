// ACT 2, THE HUSH: FLOOR 15'S INKLINGS IN THE GAME, BEHIND ACT2 (game/act1_rules/inkling.ts, art/act1_figs/inkling.ts,
// render/act1_fx/inkling.ts; the art chat's art/inklings.ts, inklings_moves.ts and inkling_shots.ts):
//   1. they are built: their rules, their pictures with a clip by each name their acts use, their size as their pictures
//      stand; the art's switch left off, and nothing of them anywhere with ACT2 off;
//   2. the rules' numbers are their pictures' own;
//   3. the ink lash lands at its picture's moment, before them as far as the claws reach, and not further;
//   4. THEY MELT INTO A POOL OF INK, SLIDE ALONG THE FLOOR AS IT, AND RISE OUT OF IT BEFORE THE HERO: the melt comes for a
//      hero further off; as a pool they cannot be struck, are not drawn as a figure (their pool is), slide toward him at
//      the pool's pace; they rise before him, facing him, and may be struck again once up;
//   5. they come in packs of their size on floor 15;
//   6. a long fight on floor 15 with a pack of them: no exceptions, every act made.
//   run: tsx --test tests/act2_inkling.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { INKLINGS_ON } from '../src/art/inklings';
import { INKLING as INKLING_MOB, IK_LASH, IK_MELT, IK_PACE, IK_RISE, IK_WALK } from '../src/art/inklings_moves';
import { TILE3, handAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT2 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { act2Pack } from '../src/game/act2_mobs';
import { INKLING, inkPool, inkSunk } from '../src/game/act1_rules/inkling';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import type { Monster } from '../src/game/state';
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
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
nodeAssert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
/** With the Hush switched on, for what is only on its floors. */
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
const damage = (g: unknown, m: Monster, n: number): void => (g as { damageMonster(m: Monster, d: number, el: string, crit: boolean, skill: number): void }).damageMonster(m, n, 'phys', false, -1);

paintWithoutCanvas();

test('1. they are built: their rules, their pictures with a clip by each name their acts use, their size; nothing of them with ACT2 off', () => {
  const r = act1Rules('inkling');
  const fig = act1Fig('inkling');
  assert.ok(r && fig && act1Fx('inkling'), 'their rules, their pictures and what they draw');
  assert.equal(INKLINGS_ON.on, false, "the art chat's switch left off: nothing of the game draws them while ACT2 is off");
  assert.ok(FIRST5_FIGURES.includes('inkling'), 'held as the descent\'s kinds are (frames painted ahead)');
  assert.equal(sizeOf('inkling'), 'small');
  const art = makeBestiary().of('inkling');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
  }
  const m = measuredSize('inkling');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
  // (with ACT2 off, no floor lays them: floors 11 to 15 are not the Hush)
  assert.equal(ACT2.on, false);
  const rng = new RNG(4);
  for (let d = 11; d <= 15; d++) for (let i = 0; i < 60; i++) assert.ok(act1Pack(d, rng, 'normal').kind !== 'inkling', `none on floor ${d} with ACT2 off`);
});

test("2. the rules' numbers are their pictures' own", () => {
  const G = gaitOf('inkling')!;
  assert.equal(G.pace, IK_PACE, 'their scuttle at the pace it is painted for');
  assert.equal(MONSTERS.inkling.speed, IK_PACE);
  assert.equal(makeBestiary().of('inkling').front.walkFps, IK_WALK.fps, 'shown at its own rate');
  near(G.cycle, 1 / IK_WALK.fps, 1e-9, 'stopped a frame at a time');
  assert.equal(G.trueBack, INKLING_MOB.trueBack === true, 'their back as their pictures have it');
  const acts = actsOf({ kind: 'inkling' })!;
  assert.equal(acts.filter((a) => !a.forced).length, 1, 'small: one attack');
  const lash = acts.find((a) => a.id === 'inkling:lash')!;
  const melt = acts.find((a) => a.id === 'inkling:melt')!;
  const rise = acts.find((a) => a.id === 'inkling:rise')!;
  assert.equal(lash.hit, IK_LASH.hit, 'the claws cross at their moment');
  assert.equal(lash.long, IK_LASH.long);
  assert.equal(INKLING_MOB.hit, IK_LASH.hit);
  assert.equal(MONSTERS.inkling.windup, IK_LASH.hit);
  assert.equal(melt.long, IK_MELT.long);
  assert.equal(rise.long, IK_RISE.long);
  assert.ok(melt.forced && rise.forced, 'the melt and the rise are brought by the rules');
  assert.ok(INKLING.melt.gone > IK_MELT.run[0] && INKLING.melt.gone < IK_MELT.run[1], 'out of reach once run half down into its pool');
  assert.ok(INKLING.rise.up > IK_RISE.up[0] && INKLING.rise.up < IK_RISE.up[1], 'in reach again once pulled half up out of it');
  // (where the claws are as they rake: at the blow, carried on, and how wide they come in from)
  const at = (t: number, side: 'L' | 'R') => handAt(INKLING_MOB, 'attack', t, side);
  near(Math.max(at(IK_LASH.hit, 'L')[0], at(IK_LASH.hit, 'R')[0]) / TILE3, 0.69, 0.03, 'the claws at the blow');
  near(Math.max(at(0.7, 'L')[0], at(0.7, 'R')[0]) / TILE3, INKLING.lash.reach, 0.03, 'carried on as far as the rules reach');
  const wide = Math.max(Math.abs(at(0.5, 'L')[1]), Math.abs(at(0.5, 'R')[1])) / TILE3;
  assert.ok(wide <= INKLING.lash.half && wide >= INKLING.lash.half - 0.15, `coming in from ${wide.toFixed(2)} either side, the rules' strip ${INKLING.lash.half}`);
  assert.ok(G.stopAt < lash.far && lash.far <= INKLING.lash.reach + TUNE.heroRadius * 0.5 + 0.01, 'it stops inside its reach');
  assert.ok(INKLING.pool.speed > IK_PACE, 'a pool is quicker than their scuttle');
});

test('3. the ink lash lands at its moment, before them as far as the claws reach, and not further', () => {
  for (const [fwd, left, hurt] of [[0.6, 0, true], [0.9, 0, true], [0.75, 0.35, true], [1.2, 0, false], [0.6, 0.75, false]] as const) {
    const { g, m } = room('inkling', 0.7, 'inkling:lash');
    m.a1 = { ...(m.a1 ?? {}), mcd: 99 };
    assert.ok(untilAct(g, m, 'inkling:lash'), 'it lashes');
    const h = g.hero;
    const hand = m.act!.hand;
    h.x = m.x + m.fx * fwd + m.fy * hand * left;
    h.y = m.y + m.fy * fwd - m.fx * hand * left;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.2, undefined, () => !!m.act && m.act.t >= IK_LASH.hit + 0.05);
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd}, ${left} to its left: struck once`);
      near(s.hurts[0].t + t0, IK_LASH.hit, 1.5 / 60, 'as the claws cross');
    } else assert.equal(s.hurts.length, 0, `at ${fwd}, ${left} to its left: beyond the claws, not struck`);
  }
});

test('4. they melt into a pool of ink, slide along the floor as it, and rise out of it before the hero', () => {
  const { g, m } = room('inkling', 5.5);
  m.a1 = { ...(m.a1 ?? {}), mcd: 0 };
  const h = g.hero;
  const fx = act1Fx('inkling')!;
  // (a hero further off: it melts)
  assert.ok(untilAct(g, m, 'inkling:melt', 3), 'it melts for a hero further off');
  watch(g, m, 2, undefined, () => inkPool(m));
  assert.ok(inkPool(m) && inkSunk(m), 'only its pool left');
  // (a pool: not to be struck, its figure not drawn, its pool drawn on the floor)
  const life = m.life;
  damage(g, m, 50);
  assert.equal(m.life, life, 'a blow does nothing to a pool of ink');
  assert.ok(fx.hidden!(m), 'nothing of its figure seen: not its shadow, ring, bar or name');
  // (it slides toward him at the pool's pace)
  const d0 = Math.hypot(h.x - m.x, h.y - m.y);
  watch(g, m, 0.5);
  const d1 = Math.hypot(h.x - m.x, h.y - m.y);
  assert.ok(inkPool(m), 'still a pool');
  near((d0 - d1) / 0.5, INKLING.pool.speed, 0.25, 'sliding toward him at its pace');
  const { c } = fakeCtx(g);
  const caught = colourCatcher();
  fx.ground!({ ...c, g: caught.g }, m, null);
  assert.ok(caught.colours.size > 0, 'its pool drawn on the floor');
  assert.ok([...caught.colours].every((k) => !cyanish(k)), 'the Order\'s ink and its pink eyes, nothing cyan');
  // (before him, it rises, turned to him; up, it may be struck again)
  assert.ok(untilAct(g, m, 'inkling:rise', 4), 'it rises');
  const dRise = Math.hypot(h.x - m.x, h.y - m.y);
  assert.ok(dRise <= INKLING.pool.near + 0.1, `before him (${dRise.toFixed(2)} off)`);
  assert.ok(((h.x - m.x) * m.fx + (h.y - m.y) * m.fy) / dRise > 0.95, 'facing him');
  assert.ok(inkSunk(m), 'not yet up');
  watch(g, m, 1.5, undefined, () => !inkSunk(m));
  assert.ok(!inkSunk(m) && !fx.hidden!(m), 'up: seen, and to be struck');
  damage(g, m, 50);
  assert.ok(m.life < life, 'struck once up');
  // (and its lash may follow; it melts no more until its while has gone by)
  watch(g, m, 2.5, undefined, () => !!m.act && m.act.id === 'inkling:lash');
  assert.equal(m.act?.id, 'inkling:lash', 'risen before him, it lashes');
  assert.ok((m.a1?.mcd ?? 0) > 4, 'and melts no more for a while');
});

test('5. they come in packs of their size, on floor 15', () => hush(() => {
  assert.equal(sizeOf('inkling'), 'small');
  const [lo, hi] = PACK_BY_SIZE.small;
  const rng = new RNG(6);
  let seen = 0;
  for (let k = 0; k < 400; k++) {
    const p = act2Pack(15, rng, 'normal');
    if (p.kind !== 'inkling') continue;
    seen++;
    assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'their own packs on floor 15, no stand-in');
}));

test('6. a long fight on floor 15 with a pack of them: no exceptions, every act made', () => hush(() => {
  const { acts } = longFight('inkling', 15, 40);
  for (const id of ['inkling:lash', 'inkling:melt', 'inkling:rise']) assert.ok(acts.has(id), `they made their ${id}`);
}));
