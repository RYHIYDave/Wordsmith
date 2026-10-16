// ACT 1: THE CHANTER IN THE GAME (game/act1_rules/chanter.ts; its pictures art/act1_figs/chanter.ts, the art
// chat's art/act1_cultists.ts; its bolt and its ward drawn by render/act1_fx/chanter.ts).
//
//   1. it is built: its rules, its pictures with the clip its act names (both ways it is seen);
//   2. its numbers are its pictures' own (its pace and procession, its bolt's length and moment, where the bolt
//      leaves its book), and its size as the game goes by it;
//   3. its bolt leaves the book at its picture's moment, flies at the hero and strikes him; misses one who has
//      stepped out of its way; bursts at a wall;
//   4. ITS WARD: the cult near it takes less harm while it lives and is awake; not itself, not another chanter,
//      not one beyond its reach; and once it is dead, none;
//   5. small: its packs of four to seven, on every floor of the descent;
//   6. what it draws: the art's bolt, its ward once under each it shields; nothing cyan;
//   7. a long fight: no exceptions; killed, nothing of it left harming.
//   run: tsx --test tests/act1_chanter.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CHANTER as CH_MOB, CH_BOLT, CH_PACE, chanterBookAt } from '../src/art/act1_cultists';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { RNG } from '../src/engine/rng';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { CHANTER, RULES, wardOf } from '../src/game/act1_rules/chanter';
import { act1Rules, act1Ward } from '../src/game/act1_rules/index';
import { MONSTERS, PACK_BY_SIZE, sizeOf } from '../src/game/defs';
import type { Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/chanter';
import { act1Fx } from '../src/render/act1_fx/index';
import { cyanIn, cyanInPx, fakeCtx, fakeDocument, firstHurt, room, watch } from './act1_kinds_room';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);
type Hurts = { damageMonster(m: Monster, n: number, el: string, c: boolean, k: number): void };

paintWithoutCanvas();
fakeDocument();

const bolt = RULES.acts[0];

test('1. it is built: its rules, its pictures with the clip its act names', () => {
  assert.ok(act1Rules('chanter') === RULES, 'its rules');
  assert.ok(act1Ready('chanter'), 'in the game: no longer stood in for');
  assert.ok(act1Fx('chanter') === FX, 'what it draws');
  assert.equal(RULES.acts.length, 1, 'small: one attack');
  const art = act1Fig('chanter')!.make();
  for (const set of [art.front, art.back]) {
    const clip = set.clips!.attack!;
    assert.equal(bolt.clip, 'attack');
    near((clip.frames.length - 1) / clip.fps, bolt.long, 0.05, 'its clip as long as the act');
    near(clip.hit ?? -1, bolt.hit, 1e-9, "its clip's blow is the act's");
    assert.ok(set.clips?.reel && set.clips.die, 'struck, and its death');
  }
});

test("2. its numbers are its pictures' own, and its size as the game goes by it", () => {
  const G = RULES.gait;
  assert.equal(G.pace, CH_PACE, 'the pace its procession is painted for');
  assert.equal(MONSTERS.chanter.speed, CH_PACE, 'and it goes at it: its feet do not slide');
  near(G.cycle, CH_MOB.walkFrames / CH_MOB.walkFps, 1e-9, 'its walk goes round');
  assert.equal(G.trueBack, !!CH_MOB.trueBack, 'from behind as its pictures are painted');
  assert.equal(bolt.long, CH_BOLT.long, 'its bolt is as long as its picture');
  assert.equal(bolt.hit, CH_BOLT.hit, 'and leaves the book at its moment');
  const b = chanterBookAt();
  near(CHANTER.bolt.from[0], b[0] / TILE3, 0.005, 'the bolt leaves the book: before it');
  near(CHANTER.bolt.from[1], b[1] / TILE3, 0.005, 'to its left');
  near(CHANTER.bolt.from[2], b[2] / 2, 0.05, 'and so high');
  assert.ok(bolt.far < CHANTER.bolt.reach, 'it casts at no one its bolt would not reach');
  assert.ok(G.stopAt + G.slack <= bolt.far, 'and never waits for one out of its reach');
  const art = makeBestiary();
  const size = FIGURE_SIZE.chanter;
  assert.deepEqual(size, act1Fig('chanter')!.size, 'the game goes by its own');
  const sp = art.of('chanter').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game takes its head to be ${size.top} up; in the picture it is ${head}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. its bolt leaves the book at its moment, flies at the hero and strikes him; misses one out of its way', () => {
  for (const far of [2, 5, 6.8]) {
    const { g, m } = room('chanter', far, 'chanter:bolt');
    const s = watch(g, m, 2.5);
    const fly = (far - CHANTER.bolt.from[0] - CHANTER.bolt.r) / CHANTER.bolt.speed;
    assert.equal(s.hurts.length, 1, `it strikes a hero ${far} tiles off, once`);
    near(firstHurt(s) - s.began, bolt.hit + fly, 0.05, 'as the bolt, let go from its book at its moment, reaches him');
  }
  {
    const { g, m } = room('chanter', 6, 'chanter:bolt');
    const s = watch(g, m, 2.5, (t) => (t > bolt.hit + 0.05 && t < bolt.hit + 0.45 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'out of its way in time, it misses');
    assert.equal(g.perils.filter((p) => p.a1 === 'chanter:bolt').length, 0, 'and it is gone at the end of its reach');
  }
  {
    // (a hero who rolls through it is not struck: it flies on)
    const { g, m } = room('chanter', 5, 'chanter:bolt');
    const s = watch(g, m, 2.5, () => {
      g.hero.invuln = 1;
      return null;
    });
    assert.equal(s.hurts.length, 0, 'through a hero who cannot be struck');
  }
});

test('4. its ward: the cult near it takes less harm while it lives; not itself, not another chanter, not one beyond it', () => {
  const { g, m } = room('chanter', 6);
  const hurt = (o: Monster, n: number): number => {
    const was = o.life;
    (g as unknown as Hurts).damageMonster(o, n, 'phys', false, -1);
    return was - o.life;
  };
  const near1 = g.spawn('dagger', m.x + 1.5, m.y + 1, -2, 0, false, new RNG(1));
  const far1 = g.spawn('dagger', m.x - 2, m.y + CHANTER.ward.r + 0.5, -2, 0, false, new RNG(2));
  const other = g.spawn('chanter', m.x + 1, m.y - 1, -2, 0, false, new RNG(3));
  const pots = g.spawn('firepot', m.x - 2, m.y + 2, -2, 0, false, new RNG(4));
  const skel = g.spawn('skeleton', m.x + 1, m.y, -2, 0, false, new RNG(5));
  for (const o of [near1, far1, other, pots, skel]) {
    o.state = 'chase';
    o.life = o.maxLife = 1e6;
  }
  const share = CHANTER.ward.share;
  assert.equal(hurt(near1, 100), Math.round(100 * (1 - share)), 'a dagger cultist near it takes less');
  assert.equal(hurt(pots, 100), Math.round(100 * (1 - share)), 'a firepot thrower too');
  assert.equal(hurt(far1, 100), 100, 'one beyond its reach takes all');
  assert.equal(hurt(skel, 100), 100, 'one not of the cult takes all');
  assert.equal(hurt(m, 100), 100, 'it takes all: kill it first');
  assert.equal(hurt(other, 100), 100, 'and another chanter by it takes all');
  // (the strongest ward, not the wards added up)
  assert.equal(act1Ward(g.bosses, near1), share, 'two chanters ward no more than one');
  // (asleep it does not chant)
  m.state = 'sleep';
  other.state = 'sleep';
  assert.equal(hurt(near1, 100), 100, 'asleep, it shields no one');
  m.state = 'chase';
  other.state = 'chase';
  // (dead, none)
  g.kill(m);
  g.kill(other);
  assert.equal(wardOf(m, near1), 0);
  assert.equal(hurt(near1, 100), 100, 'once it is dead, the cult takes all again');
});

test('5. small: its packs of four to seven, on every floor of the descent', () => {
  assert.equal(sizeOf('chanter'), 'small');
  for (const depth of [6, 7, 8, 9, 10]) {
    const rng = new RNG(depth);
    let seen = 0;
    for (let i = 0; i < 600; i++) {
      const p = act1Pack(depth, rng, 'normal');
      if (p.kind !== 'chanter') continue;
      seen++;
      assert.ok(p.size >= PACK_BY_SIZE.small[0] && p.size <= PACK_BY_SIZE.small[1], `a pack of ${p.size}`);
    }
    assert.ok(seen > 10, `floor ${depth} has them (${seen})`);
  }
});

test('6. what it draws: the art\'s bolt and its ward, once under each it shields; nothing cyan', () => {
  const { g, m } = room('chanter', 6, 'chanter:bolt');
  const a = g.spawn('dagger', m.x + 1, m.y + 1, -2, 0, false, new RNG(1));
  const b = g.spawn('dagger', m.x + 2, m.y - 1, -2, 0, false, new RNG(2));
  const two = g.spawn('chanter', m.x, m.y + 2, -2, 0, false, new RNG(3));
  for (const o of [a, b, two]) {
    o.state = 'chase';
    o.seen = true;
  }
  m.seen = true;
  {
    const { c, drawn } = fakeCtx(g, 0.3);
    FX.ground!(c, m, null);
    FX.ground!(c, two, null);
    assert.equal(drawn.images.length, 2, 'a ring under each of the two it shields, once, though two chanters shield them');
    for (const img of drawn.images) assert.equal(cyanInPx(img), 0, 'nothing cyan');
  }
  watch(g, m, 2, undefined, () => g.perils.some((p) => p.a1 === 'chanter:bolt'));
  const p = g.perils.find((q) => q.a1 === 'chanter:bolt')!;
  {
    const { c, drawn } = fakeCtx(g, 0.3);
    FX.ground!(c, null, p);
    FX.standing!(c, null, p);
    FX.air!(c, null, p);
    assert.equal(drawn.images.length, 1, 'the bolt in flight');
    assert.deepEqual(drawn.fills, ['#07050a'], 'its faint shadow, the game\'s black');
    assert.ok(drawn.spots > 0, 'its light');
    assert.equal(cyanInPx(drawn.images[0]), 0, 'nothing cyan');
  }
  p.done = 1;
  p.hit = p.t;
  p.dur = p.t + CHANTER.bolt.burst;
  {
    const { c, drawn } = fakeCtx(g, 0.3);
    FX.standing!(c, null, p);
    FX.air!(c, null, p);
    assert.equal(drawn.images.length, 1, 'burst: the knot of light going out');
  }
  const art = act1Fig('chanter')!.make();
  for (const set of [art.front, art.back]) for (const sp of [set.idle[0], set.walk[3], set.clips!.attack!.frames[19], set.clips!.reel!.frames[3]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on it');
});

test('7. a long fight: no exceptions; killed, nothing of it left harming', () => {
  const { g, m } = room('chanter', 4);
  m.life = m.maxLife = 500;
  const s = watch(g, m, 30, (t) => ({ mx: Math.cos(t * 0.6), my: Math.sin(t * 0.9) }));
  assert.ok(s.acts.length > 4, `it casts, again and again (${s.acts.length})`);
  const k = room('chanter', 5, 'chanter:bolt');
  watch(k.g, k.m, 2, undefined, () => k.g.perils.some((p) => p.a1 === 'chanter:bolt'));
  k.g.kill(k.m);
  watch(k.g, k.m, 3);
  assert.equal(k.g.perils.length, 0, 'its bolt, once let go, flies out and is gone');
});
