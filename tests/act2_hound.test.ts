// ACT 2, THE HUSH: THE MUTE WATCH HOUNDS IN THE GAME (game/act1_rules/hound.ts, art/act1_figs/hound.ts; nothing of its own
// drawn beyond its figure, render/act1_fx/hound.ts), behind ACT2 (game/act1.ts, off):
//   1. it is built: its rules, its pictures (the art chat's) with a clip by each name its act uses, the art's switch with its
//      figure, its size as its pictures stand;
//   2. the rules' numbers are its pictures' own: its lope, its pounce's length and moment, and where its forepaws come down;
//   3. its pounce lands at its moment where its forepaws come down, and not beyond them, nor beside them;
//   4. AT THE WATCH'S HEELS: near one of the watch it keeps to his heels as he trudges in, and is let slip as he comes on the
//      hero (or the hero on it, or it is struck), and lopes in and pounces; with none of the watch near, it comes on as any;
//   5. small: in packs on floor 11; with the switch off, on none;
//   6. a long fight on floor 11 with a pack of them: no exceptions, its pounce made; and a yellow pack of the watch with its
//      sergeant's brace.
//   run: tsx --test tests/act2_hound.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { HOUNDS_ON, HOUND_FEET, HOUND_POUNCE, HOUND_PACE, HOUND_WALK, HOUND_DIE, houndFeet } from '../src/art/hounds';
import { TILE3 } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { act2Pack } from '../src/game/act2_mobs';
import { HOUND, heelOf, masterOf } from '../src/game/act1_rules/hound';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import type { Monster } from '../src/game/state';
import { act1Fx } from '../src/render/act1_fx/index';
import { cityFight, hush, offTheFloors } from './act2_city_room';
import { measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
interface Hooks {
  wakeUp(m: Monster): void;
}

paintWithoutCanvas();

const pounce = actsOf({ kind: 'hound' })![0];

test('1. it is built: its rules, its pictures with a clip by each name its act uses, the art\'s switch, its size', () => {
  const r = act1Rules('hound');
  const fig = act1Fig('hound');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(HOUNDS_ON), "the art chat's switch is its figure's");
  assert.equal(act1Fx('hound'), null, 'nothing drawn beyond its figure');
  const art = makeBestiary().of('hound');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
      near(clip!.hit ?? -1, a.hit, 1e-9, "its clip's blow is the act's");
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
    near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, HOUND_DIE.long, 0.06, 'its silent howl and down, as long as its picture');
  }
  const m = measuredSize('hound');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
  assert.deepEqual(FIGURE_SIZE.hound, fig!.size, 'the game goes by its size');
});

test("2. the rules' numbers are its pictures' own: its lope, its pounce, where its forepaws come down", () => {
  const G = gaitOf('hound')!;
  assert.equal(G.pace, HOUND_PACE, 'its lope at the pace it is painted for');
  assert.equal(MONSTERS.hound.speed, HOUND_PACE, 'and it goes at it: its feet do not slide');
  assert.equal(makeBestiary().of('hound').front.walkFps, HOUND_WALK.fps, 'its lope shown at its own rate');
  near(G.cycle, 1 / HOUND_WALK.fps, 1e-9, 'it may stop at any frame of its lope');
  assert.equal(actsOf({ kind: 'hound' })!.length, 1, 'small: one attack');
  assert.equal(pounce.hit, HOUND_POUNCE.hit, 'its forepaws slam down at their moment');
  assert.equal(pounce.long, HOUND_POUNCE.long);
  assert.equal(MONSTERS.hound.windup, HOUND_POUNCE.hit);
  assert.ok(HOUND_POUNCE.spring < pounce.hit, 'its warning (the crouch) before its blow');
  // (where its forepaws are as they come down: on the floor, as far before it as the rules have them, either side of its middle)
  near(HOUND.pounce.at, (HOUND_FEET[0][0] + HOUND_POUNCE.reach) / TILE3, 0.005, 'its forepaws as far as they reach');
  const feet = houndFeet('attack', HOUND_POUNCE.hit);
  for (const f of [feet[0], feet[1]]) {
    near(f[0] / TILE3, HOUND.pounce.at, 0.005, 'down there at the blow');
    near(f[2], 0, 0.01, 'on the floor');
    assert.ok(Math.abs(f[1] / TILE3) + TUNE.heroRadius <= HOUND.pounce.r, 'and the paws within its blow');
  }
  assert.ok(houndFeet('attack', HOUND_POUNCE.hit - 0.1)[0][2] > 3, 'in the air a tenth before');
  assert.ok(G.stopAt < pounce.far && pounce.far <= HOUND.pounce.at + HOUND.pounce.r, 'it stops inside its reach');
  assert.equal(MONSTERS.hound.range, pounce.far);
});

test('3. its pounce lands at its moment where its forepaws come down, and not beyond them, nor beside them', () => {
  for (const [fwd, side, hurt] of [[0.65, 0, true], [1.2, 0, true], [0.8, 0.4, true], [1.4, 0, false], [0.7, 0.6, false]] as const) {
    const { g, m } = room('hound', 0.9, 'hound:pounce');
    assert.ok(untilAct(g, m, 'hound:pounce'), 'it pounces');
    const h = g.hero;
    h.x = m.x + m.fx * fwd - m.fy * side;
    h.y = m.y + m.fy * fwd + m.fx * side;
    const t0 = m.act!.t;
    const s = watch(g, m, 1.4, undefined, () => m.state !== 'act');
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${fwd} before it, ${side} aside: struck once`);
      near(s.hurts[0].t + t0, HOUND_POUNCE.hit, 1.5 / 60, 'as its forepaws slam down');
    } else assert.equal(s.hurts.length, 0, `at ${fwd} before it, ${side} aside: beyond its paws`);
  }
});

test("4. AT THE WATCH'S HEELS: it keeps to them as he trudges in, is let slip as he comes on the hero, and lopes in and pounces", () => {
  const { g } = room('hound', 3);
  g.monsters.length = 0;
  const h = g.hero;
  const hooks = g as unknown as Hooks;
  // (one of the watch ten tiles off, trudging in; a hound beside him; neither to be killed)
  const w = g.spawn('watch', h.x + 9.5, h.y, 50, 0, false, new RNG(2));
  const d = g.spawn('hound', h.x + 9.5, h.y + 1.6, 51, 0, false, new RNG(3));
  for (const m of [w, d]) {
    hooks.wakeUp(m);
    m.life = m.maxLife = 1e9;
    m.words = [];
    m.fx = -1;
    m.fy = 0;
  }
  w.moveCd = [1e9];
  assert.ok(masterOf(g.monsters, d, h) === w, 'it keeps to his heels');
  let there = -1;
  let slipAt = -1;
  let maxGap = 0;
  let behind = 0;
  let steps = 0;
  const s = watch(g, d, 12, undefined, () => {
    const master = masterOf(g.monsters, d, h);
    if (master) {
      const gap = Math.hypot(heelOf(d, master).x - d.x, heelOf(d, master).y - d.y);
      if (there < 0 && gap <= HOUND.heel.there + 0.05) there = steps / 60;
      if (there >= 0) {
        maxGap = Math.max(maxGap, gap);
        // (he before it, nearer the hero)
        if (Math.hypot(h.x - master.x, h.y - master.y) < Math.hypot(h.x - d.x, h.y - d.y)) behind++;
      }
    } else if (slipAt < 0) slipAt = Math.hypot(h.x - w.x, h.y - w.y);
    steps++;
    return d.state === 'act';
  });
  assert.ok(there >= 0 && there < 1.5, `it went to his heels (in ${there.toFixed(2)} s)`);
  assert.ok(maxGap < HOUND.heel.leave + 0.3, `and kept to them all the way in (never more than ${maxGap.toFixed(2)} tiles from its place)`);
  assert.ok(behind > 0, 'behind him');
  assert.ok(slipAt > 0 && slipAt <= HOUND.heel.slip + 0.1, `let slip as he came on the hero (${slipAt.toFixed(2)} tiles off him)`);
  assert.ok(s.began > 0, 'then it pounced');
  assert.equal(s.act, 'hound:pounce');
  // (with none of the watch near, it comes on as any)
  {
    const { g: g2, m } = room('hound', 6, 'hound:pounce');
    assert.equal(masterOf(g2.monsters, m, g2.hero), null, 'none to keep to');
    const s2 = watch(g2, m, 4, undefined, () => m.state === 'act');
    assert.ok(s2.began > 0 && s2.began < 3, `it lopes straight in and pounces (at ${s2.began.toFixed(2)} s)`);
  }
  // (struck: let slip at once)
  {
    const { g: g3 } = room('hound', 3);
    g3.monsters.length = 0;
    const w3 = g3.spawn('watch', g3.hero.x + 9, g3.hero.y, 60, 0, false, new RNG(2));
    const d3 = g3.spawn('hound', g3.hero.x + 9, g3.hero.y + 1.4, 61, 0, false, new RNG(3));
    for (const m of [w3, d3]) {
      (g3 as unknown as Hooks).wakeUp(m);
      m.life = m.maxLife = 1e9;
    }
    assert.ok(masterOf(g3.monsters, d3, g3.hero) === w3);
    d3.struckT = 0;
    assert.equal(masterOf(g3.monsters, d3, g3.hero), null, 'struck, it is let slip');
  }
});

test('5. small: in packs on floor 11; with the switch off, on none', () => {
  assert.equal(sizeOf('hound'), 'small');
  const [lo, hi] = PACK_BY_SIZE.small;
  hush(() => {
    const rng = new RNG(11);
    let seen = 0;
    for (let k = 0; k < 600; k++) {
      const p = act2Pack(11, rng, 'normal');
      if (p.kind !== 'hound') continue;
      seen++;
      assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
    }
    assert.ok(seen > 30, `floor 11 has them (${seen})`);
  });
  assert.deepEqual(offTheFloors('hound'), [], 'the switch off: nothing of it in the game');
});

test("6. a long fight on floor 11 with a pack of them: no exceptions, its pounce made; and the watch's yellow pack with its hounds", () => {
  const { acts } = cityFight('hound', 11, 40);
  assert.ok(acts.has('hound:pounce'), 'it pounced');
  // (a yellow pack of the watch, its sergeant and his brace, fought a while: no exceptions, the hounds pounce)
  hush(() => {
    const { g } = room('watch', 3);
    g.monsters.length = 0;
    const h = g.hero;
    const lead = g.spawn('watch', h.x + 8, h.y, 70, 1, false, new RNG(5), null, { rarity: 'leader', words: [] });
    g.spawn('watch', h.x + 8, h.y + 1.4, 70, 0, false, new RNG(6), null, { rarity: 'minion', words: [] });
    const all = g.monsters.slice();
    for (const m of all) {
      (g as unknown as Hooks).wakeUp(m);
      m.life = m.maxLife = 1e9;
    }
    const seen = new Set<string>();
    watch(g, lead, 20, (t, c) => {
      if (Math.floor(t / 2) % 2 === 0) {
        c.mx = Math.cos(t);
        c.my = Math.sin(t);
      }
    }, () => {
      for (const m of g.monsters) if (m.act) seen.add(m.act.id);
      return false;
    });
    assert.ok(seen.has('hound:pounce') && seen.has('watch:sweep'), `the watch swept and its hounds pounced (${[...seen].join(', ')})`);
  });
});
