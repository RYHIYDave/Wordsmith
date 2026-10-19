// ACT 2, THE HUSH: THE HUSHED TOWNSFOLK IN THE GAME (game/act1_rules/hushed.ts, art/act1_figs/hushed.ts; nothing of its own
// drawn beyond its figure, render/act1_fx/hushed.ts), behind ACT2 (game/act1.ts, off):
//   1. it is built: its rules, its pictures (the art chat's, his yes to each) with a clip by each name its act uses, the
//      art's switch with its figure, its size as its pictures stand, the three of the crowd;
//   2. the rules' numbers are its pictures' own;
//   3. A CROWD OF THREE: the porter, the goodwife and the baker in turn, each shown as its own figure, its death too;
//   4. its grab lands at its picture's moment, before it as far as its hands reach, and not further, nor beside it;
//   5. one the Crier calls in, spawned plain, shuffles in at its pace and grabs;
//   6. the act's common mob: in packs of its size on every floor of the Hush; with the switch off, on none;
//   7. a long fight on floor 11 with a pack of them: no exceptions, its grab made.
//   run: tsx --test tests/act2_hushed.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, figureOf, makeBestiary } from '../src/art/bestiary';
import { act1Fig, act1Look } from '../src/art/act1_figs/index';
import { HUSHED_ON } from '../src/art/hushed';
import { HUSHED_ALL, HUSHED_PORTER, HU_DIES, HU_GRAB, HU_PACE, HU_WALK } from '../src/art/hushed_moves';
import { TILE3, handAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { act2Pack, act2Ready } from '../src/game/act2_mobs';
import { HUSHED } from '../src/game/act1_rules/hushed';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import type { GameEvent, Monster } from '../src/game/state';
import { act1Fx } from '../src/render/act1_fx/index';
import { hush, cityFight, offTheFloors } from './act2_city_room';
import { measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

test('1. it is built: its rules, its pictures with a clip by each name its act uses, the art\'s switch, its size, the three of the crowd', () => {
  const r = act1Rules('hushed');
  const fig = act1Fig('hushed');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(act2Ready('hushed'), 'in the Hush: no longer stood in for');
  assert.ok(fig!.switches?.includes(HUSHED_ON), "the art chat's switch is its figure's");
  assert.equal(fig!.looks?.length, 2, 'and two looks more: the goodwife and the baker');
  assert.equal(act1Fx('hushed'), null, 'nothing drawn beyond its figure');
  const B = makeBestiary();
  for (const f of ['hushed', 'hushed1', 'hushed2'] as const) {
    const art = B.of(f);
    for (const set of [art.front, art.back]) {
      for (const a of r!.acts) {
        const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
        assert.ok(clip && clip.frames.length > 0, `${f}: its ${a.id}: its clip ${a.clip}`);
        near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `${f}: its ${a.id}'s length`);
        near(clip!.hit ?? -1, a.hit, 1e-9, `${f}: its clip's blow is the act's`);
      }
      assert.ok(set.clips?.reel && set.clips?.die, `${f}: struck and its death`);
      near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, HU_DIES.long, 0.06, `${f}: the Hush leaving them, as long as its picture`);
    }
    const m = measuredSize(f);
    assert.ok(Math.abs(m.size.top - m.head) <= 4, `${f}: the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
    assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${f}: ${m.size.half} to either side; the picture reaches ${m.reach}`);
    assert.deepEqual(FIGURE_SIZE[f], fig!.size, `${f}: the game goes by its size`);
  }
});

test("2. the rules' numbers are its pictures' own", () => {
  const G = gaitOf('hushed')!;
  assert.equal(G.pace, HU_PACE, 'its shuffle at the pace it is painted for');
  assert.equal(MONSTERS.hushed.speed, HU_PACE, 'and it goes at it: its feet do not slide');
  assert.equal(makeBestiary().of('hushed').front.walkFps, HU_WALK.fps, 'its shuffle shown at its own rate');
  near(G.cycle, 1 / HU_WALK.fps, 1e-9, 'it may stop at any frame of its shuffle');
  assert.equal(G.trueBack, HUSHED_PORTER.trueBack === true, 'its back as its pictures have it');
  const acts = actsOf({ kind: 'hushed' })!;
  assert.equal(acts.length, 1, 'small: one attack');
  const grab = acts[0];
  assert.equal(grab.hit, HU_GRAB.hit, 'its hands clutch at their moment');
  assert.equal(grab.long, HU_GRAB.long);
  assert.ok(HU_GRAB.warn[1] < grab.hit, 'its warning before its blow');
  assert.equal(MONSTERS.hushed.windup, HU_GRAB.hit);
  // (where its picture's hands are as they clutch, each of the three: as far before it as the rules reach, and as wide)
  for (const mob of HUSHED_ALL) {
    const L = handAt(mob, 'attack', HU_GRAB.hit, 'L');
    const R = handAt(mob, 'attack', HU_GRAB.hit, 'R');
    near(HUSHED.grab.reach, Math.max(L[0], R[0]) / TILE3, 0.005, `${mob.name}: its hands as far as they reach`);
    assert.ok(Math.abs(L[1] / TILE3) <= HUSHED.grab.half && Math.abs(R[1] / TILE3) <= HUSHED.grab.half, `${mob.name}: and as wide`);
    // (and not before: they come in on the lunge)
    const before = handAt(mob, 'attack', HU_GRAB.hit - 0.1, 'L');
    assert.ok(before[0] / TILE3 < HUSHED.grab.reach - 0.3, `${mob.name}: still coming in a tenth before`);
  }
  assert.ok(G.stopAt < grab.far && grab.far <= HUSHED.grab.reach + TUNE.heroRadius * 0.5 + 0.01, 'it stops inside its reach');
  assert.ok(MONSTERS.hushed.range === grab.far, 'its reach in the monsters\' table is its grab\'s');
});

test('3. A CROWD OF THREE: the porter, the goodwife and the baker in turn, each its own figure, its death too', () => {
  const { g, all } = room('hushed', 4, null, 6);
  const forms = all.map((m) => m.form ?? 0);
  assert.deepEqual([...new Set(forms)].sort(), [0, 1, 2], `all three in a crowd of six (${forms.join(',')})`);
  for (let i = 1; i < all.length; i++) assert.ok(forms[i] !== forms[i - 1], 'one after another, each unlike the last');
  const figs = all.map((m) => figureOf(m));
  for (const m of all) assert.equal(figureOf(m), ['hushed', 'hushed1', 'hushed2'][m.form ?? 0], 'its look is its figure');
  assert.equal(act1Look('hushed', 1), 'hushed1');
  assert.equal(act1Look('hushed', 3), null, 'no fourth');
  assert.equal(act1Look('wolf', 1), null, 'a kind of one look has none');
  // (each figure's pictures are its own: the porter, the goodwife and the baker do not look alike)
  const B = makeBestiary();
  const first = (f: 'hushed' | 'hushed1' | 'hushed2'): Uint8ClampedArray => paintingOf(B.of(f).front.idle[0]).d;
  const same = (a: Uint8ClampedArray, b: Uint8ClampedArray): boolean => a.length === b.length && a.every((v, i) => v === b[i]);
  assert.ok(!same(first('hushed'), first('hushed1')) && !same(first('hushed1'), first('hushed2')) && !same(first('hushed'), first('hushed2')), 'three looks');
  void figs;
  // (killed, each falls as its own look: the death carries it)
  const deaths: GameEvent[] = [];
  for (const m of all) {
    (g as unknown as { kill(m: Monster): void }).kill(m);
    deaths.push(...g.events.filter((e) => e.t === 'die'));
    g.events.length = 0;
  }
  assert.equal(deaths.length, all.length);
  deaths.forEach((e, i) => assert.equal(figureOf(e as { kind: 'hushed'; champion: boolean; form?: number }), figureOf(all[i]), 'it dies as it looked'));
});

test('4. its grab lands at its moment, before it as far as its hands reach, and not further, nor beside it', () => {
  for (const [fwd, side, hurt] of [[0.65, 0, true], [1.05, 0, true], [0.8, 0.4, true], [1.25, 0, false], [0.7, 0.75, false]] as const) {
    const { g, m } = room('hushed', 0.9, 'hushed:grab');
    assert.ok(untilAct(g, m, 'hushed:grab'), 'it grabs');
    const h = g.hero;
    h.x = m.x + m.fx * fwd - m.fy * side;
    h.y = m.y + m.fy * fwd + m.fx * side;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.6, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd} before it, ${side} aside: caught once`);
      near(s.hurts[0].t + t0, HU_GRAB.hit, 1.5 / 60, 'as its hands clutch');
    } else assert.equal(s.hurts.length, 0, `at ${fwd} before it, ${side} aside: beyond its hands`);
  }
});

test('5. one the Crier calls in, spawned plain, shuffles in at its pace and grabs', () => {
  const { g } = room('hushed', 3);
  g.monsters.length = 0;
  const h = g.hero;
  const m = g.spawn('hushed', h.x + 6, h.y, -7, 0, false, new RNG(4));
  m.state = 'chase';
  m.life = m.maxLife = 1e9;
  m.words = [];
  const x0 = m.x;
  let walked = 0;
  const s = watch(g, m, 9, undefined, () => {
    if (m.anim === 'walk') walked++;
    return m.state === 'act';
  });
  assert.ok(s.began > 0, 'it came to him and grabbed');
  assert.equal(s.act, 'hushed:grab');
  const pace = (x0 - m.x) / (walked / 60);
  near(pace, HU_PACE, 0.12, 'at the pace its shuffle is painted for');
  assert.ok(Math.hypot(m.x - h.x, m.y - h.y) <= HUSHED.grab.reach + TUNE.heroRadius * 0.5, 'within its reach as it grabs');
});

test('6. the act\'s common mob: in packs of its size on every floor of the Hush; with the switch off, on none', () => {
  assert.equal(sizeOf('hushed'), 'small');
  const [lo, hi] = PACK_BY_SIZE.small;
  hush(() => {
    for (let d = 11; d <= 15; d++) {
      const rng = new RNG(d);
      let seen = 0;
      for (let k = 0; k < 600; k++) {
        const p = act2Pack(d, rng, 'normal');
        if (p.kind !== 'hushed') continue;
        seen++;
        assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
      }
      assert.ok(seen > 10, `floor ${d} has them (${seen})`);
    }
  });
  assert.deepEqual(offTheFloors('hushed'), [], 'the switch off: nothing of it in the game');
});

test('7. a long fight on floor 11 with a pack of them: no exceptions, its grab made', () => {
  const { acts } = cityFight('hushed', 11, 40);
  assert.ok(acts.has('hushed:grab'), 'it grabbed');
});
