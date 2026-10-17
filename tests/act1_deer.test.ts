// ACT 1: THE TWISTED DEER (FLOOR 9) IN THE GAME (game/act1_rules/deer.ts, art/act1_figs/deer.ts, render/act1_fx/deer.ts):
//   1. it is built: its rules, its pictures (the art chat's, each with his yes) with a clip by each name its acts use,
//      its switch on with the descent, its size as its pictures stand;
//   2. the rules' numbers are its pictures' own;
//   3. its gore lands at its picture's moment, before it as far as its antlers reach, and not further;
//   4. its stomp's thorns burst up at their moment in a ring round it, as far as they reach, and not further; its
//      warning on the floor before them, in the enemy's colours, never cyan;
//   5. it comes in packs of its size, on its floor, in place of the stand-ins;
//   6. a long fight on its floor with a pack of them: no exceptions, and every act made.
//   run: tsx --test tests/act1_deer.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { TILE3 } from '../src/art/new_mobs3';
import { DEER_GORE, DEER_PACE, DEER_STOMP, DEER_WALK, TWISTED_DEER_ON, deerLong } from '../src/art/twisted_deer';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { DEER } from '../src/game/act1_rules/deer';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { act1Fx } from '../src/render/act1_fx/index';
import { colourCatcher, cyanish, longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

test('1. it is built: its rules, its pictures with a clip by each name its acts use, its switch on with the descent, its size', () => {
  const r = act1Rules('deer');
  const fig = act1Fig('deer');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(TWISTED_DEER_ON), "the art chat's switch is its");
  assert.equal(TWISTED_DEER_ON.on, ACT1.on, 'on with the descent');
  assert.ok(FIRST5_FIGURES.includes('deer'), 'held as the bosses and the cult are (frames painted ahead)');
  const art = makeBestiary().of('deer');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      // (each act as long as its clip)
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
  }
  const m = measuredSize('deer');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; over its floor point it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
  assert.ok(!fig!.heavy, 'not a boss: not heavy');
});

test("2. the rules' numbers are its pictures' own", () => {
  const G = gaitOf('deer')!;
  assert.equal(G.pace, DEER_PACE, 'its limp at the pace it is painted for');
  assert.equal(MONSTERS.deer.speed, DEER_PACE, 'and the rules carry it at that pace (its feet grip)');
  near(G.cycle, 1 / DEER_WALK.fps, 1e-9, 'it may stop at any frame of its limp (the art: "its limp stops at any frame")');
  assert.equal(G.trueBack, false, 'its back painted turned over');
  const acts = actsOf({ kind: 'deer' })!;
  const gore = acts.find((a) => a.id === 'deer:gore')!;
  const stomp = acts.find((a) => a.id === 'deer:stomp')!;
  assert.equal(gore.clip, 'attack');
  assert.equal(gore.hit, DEER_GORE.hit, 'the gore at its hit');
  assert.equal(gore.long, deerLong('attack'));
  near(DEER.gore.reach, DEER_GORE.reach / TILE3, 0.005, 'its antlers as far as they reach');
  assert.equal(stomp.clip, 'stomp');
  assert.equal(stomp.hit, DEER_STOMP.hit, 'the stomp at its hit');
  assert.equal(stomp.long, deerLong('stomp'));
  near(DEER.stomp.thorns, DEER_STOMP.hit + DEER_STOMP.freeze, 1e-9, 'its thorns burst up as its freeze ends');
  near(DEER.stomp.reach, (DEER_STOMP.reach * 1.15 + 2) / TILE3, 0.05, 'out to its furthest thorn');
  assert.ok(gore.cooldown === 0 && stomp.cooldown > 0, 'its basic blow, and its big one with a cooldown');
  assert.equal(MONSTERS.deer.windup, DEER_GORE.hit);
  assert.ok(MONSTERS.deer.range === DEER.gore.reach);
  assert.ok(gaitOf('deer')!.stopAt < gore.far && gore.far <= DEER.gore.reach + TUNE.heroRadius * 0.5 + 0.01, 'it stops inside its reach');
});

test('3. its gore lands at its moment, before it, as far as its antlers reach, and not further', () => {
  for (const [far, hurt] of [[1.0, true], [1.2, true], [1.27, false]] as const) {
    const { g, m } = room('deer', 1.2, 'deer:gore');
    assert.ok(untilAct(g, m, 'deer:gore'), 'it gores');
    const h = g.hero;
    // (the hero put where the test asks, before it)
    h.x = m.x + m.fx * far + 0.02;
    h.y = m.y + m.fy * far;
    if (far > 1.25) {
      h.x = m.x + m.fx * 1.45;
      h.y = m.y + m.fy * 1.45;
    }
    const t0 = m.act!.t;
    const s = watch(g, m, 1.2, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${far} tiles: struck once`);
      near(s.hurts[0].t + t0, DEER.gore.hit, 1.5 / 60, 'at its moment');
    } else assert.equal(s.hurts.length, 0, 'out of its reach: not struck');
  }
  // (behind it, never)
  const { g, m } = room('deer', 1.2, 'deer:gore');
  untilAct(g, m, 'deer:gore');
  g.hero.x = m.x - m.fx * 0.9;
  g.hero.y = m.y - m.fy * 0.9;
  assert.equal(watch(g, m, 1.2, undefined, () => m.state !== 'act').hurts.length, 0, 'behind it: not struck');
});

test("4. its stomp: the thorns at their moment in a ring round it, as far as they reach; its warning in the enemy's colours", () => {
  for (const [where, hurt] of [['before', true], ['beside', true], ['behind', true], ['far', false]] as const) {
    const { g, m } = room('deer', 1.2, 'deer:stomp');
    assert.ok(untilAct(g, m, 'deer:stomp'), 'it stomps');
    const h = g.hero;
    const d = where === 'far' ? DEER.stomp.reach + 0.35 : 1.1;
    const [fx, fy] = where === 'beside' ? [m.fy, -m.fx] : where === 'behind' ? [-m.fx, -m.fy] : [m.fx, m.fy];
    h.x = m.x + fx * d;
    h.y = m.y + fy * d;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.6, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `${where}: struck once`);
      near(s.hurts[0].t + t0, DEER.stomp.thorns, 1.5 / 60, `${where}: as the thorns burst up`);
    } else assert.equal(s.hurts.length, 0, 'beyond its thorns: not struck');
  }
  // (its warning: drawn from as it gathers until the thorns burst, never cyan)
  const { g, m } = room('deer', 1.2, 'deer:stomp');
  untilAct(g, m, 'deer:stomp');
  const fx = act1Fx('deer')!;
  const drawn: number[] = [];
  const all = new Set<string>();
  for (const T of [0.05, 0.2, 0.5, 0.75, 0.85, 1.2]) {
    m.act!.t = T;
    const { g: c, colours } = colourCatcher();
    fx.ground!({ g: c, at: (x, y) => [x * 16, y * 8], game: g, t: T, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined }, m, null);
    if (colours.size) drawn.push(T);
    for (const k of colours) all.add(k);
  }
  assert.equal(drawn.join(','), '0.2,0.5,0.75', 'the ring from as it gathers to the thorns');
  for (const k of all) assert.ok(!cyanish(k), `its warning: a cyan colour (${k})`);
});

test('5. it comes in packs of its size, on its floor', () => {
  assert.equal(sizeOf('deer'), 'medium');
  const [lo, hi] = PACK_BY_SIZE.medium;
  const rng = new RNG(4);
  let seen = 0;
  for (let k = 0; k < 400; k++) {
    const p = act1Pack(9, rng, 'normal');
    if (p.kind !== 'deer') continue;
    seen++;
    assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'its own packs on floor 9, no stand-in');
});

test('6. a long fight on its floor with a pack of them: no exceptions, every act made', () => {
  const { acts } = longFight('deer', 9, 40);
  for (const id of ['deer:gore', 'deer:stomp']) assert.ok(acts.has(id), `it made its ${id}`);
});
