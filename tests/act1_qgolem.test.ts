// ACT 1: THE QUARRY GOLEM IN THE GAME (game/act1_rules/qgolem.ts; its pictures art/act1_figs/qgolem.ts, the art
// chat's art/floor6_mobs.ts; what it throws drawn by render/act1_fx/qgolem.ts).
//
//   1. it is built: its rules, its pictures with the clips its acts name (both ways it is seen), what it draws;
//   2. its numbers are its pictures' own (its pace and walk, its acts' lengths and moments, where its fists strike
//      and where the chunk leaves its fist), and its size as the game goes by it;
//   3. its hammer lands at its picture's moment on a hero before it, within its reach, and not on one beside it
//      or out of it;
//   4. its chunk comes down where the hero stood as it left the fist, a moment later, and misses one who has
//      stepped away;
//   5. it is medium: its packs of three to five; it sets off, walks and stops as its pictures hand over;
//   6. what it draws: the art's chunk in flight, its shadow, its shattering; nothing cyan;
//   7. a long fight with it, its death in the middle of a throw: no exceptions, nothing of it left harming.
//   run: tsx --test tests/act1_qgolem.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CHUNK_H, QG_HIT, QG_PACE, QG_TEAR, QG_THROW, QG_THROW_HIT, QUARRY_GOLEM, chunkIn } from '../src/art/floor6_mobs';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { add, mul, norm, sub } from '../src/art/skeleton';
import { act1Fig } from '../src/art/act1_figs/index';
import { RNG } from '../src/engine/rng';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { QGOLEM, RULES, chunkAt } from '../src/game/act1_rules/qgolem';
import { act1Rules } from '../src/game/act1_rules/index';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { beside } from '../src/game/facing';
import { emptyControls } from '../src/game/state';
import { FX } from '../src/render/act1_fx/qgolem';
import { act1Fx } from '../src/render/act1_fx/index';
import { cyanIn, cyanInPx, fakeCtx, fakeDocument, firstHurt, keep, room, watch } from './act1_kinds_room';
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
fakeDocument();

const act = (id: string) => RULES.acts.find((a) => a.id === id)!;

test('1. it is built: its rules, its pictures with the clips its acts name, and what it draws', () => {
  assert.ok(act1Rules('qgolem') === RULES, 'its rules');
  assert.ok(act1Ready('qgolem'), 'in the game: no longer stood in for');
  assert.ok(act1Fx('qgolem') === FX, 'what it draws');
  const art = act1Fig('qgolem')!.make();
  for (const set of [art.front, art.back]) {
    for (const a of RULES.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id} plays its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.05, `${a.id}: its clip as long as the act`);
      near(clip!.hit ?? -1, a.hit, 1e-9, `${a.id}: its clip's blow is the act's`);
    }
    assert.ok(set.clips?.reel && set.clips.die, 'struck, and its death');
    assert.ok(set.clips?.moves?.setOff && set.clips.moves.halt, 'its setting off and its stopping');
  }
});

test("2. its numbers are its pictures' own, and its size as the game goes by it", () => {
  const G = RULES.gait;
  assert.equal(G.pace, QG_PACE, 'the pace its walk is painted for');
  assert.equal(MONSTERS.qgolem.speed, QG_PACE, 'and it goes at it: its feet do not slide');
  near(G.cycle, QUARRY_GOLEM.walkFrames / QUARRY_GOLEM.walkFps, 1e-9, 'its walk goes round');
  const last = (k: string): number => {
    const ks = QUARRY_GOLEM.more![k].motion.keys;
    return ks[ks.length - 1].at;
  };
  near(G.setOff, last('setOff'), 1e-9, 'setting off');
  near(G.halt, last('halt'), 1e-9, 'stopping');
  assert.equal(G.trueBack, !!QUARRY_GOLEM.trueBack, 'from behind as its pictures are painted');
  const hammer = act('qgolem:hammer');
  const thr = act('qgolem:throw');
  near(hammer.long, QUARRY_GOLEM.attack.motion.keys[QUARRY_GOLEM.attack.motion.keys.length - 1].at, 1e-9, 'the hammer is as long as its picture');
  assert.equal(hammer.hit, QG_HIT, 'and lands at its moment');
  assert.equal(thr.long, QG_THROW, 'the throw is as long as its picture');
  assert.equal(thr.hit, QG_THROW_HIT, 'the chunk leaves its fist at its moment');
  assert.equal(QGOLEM.chunk.tear, QG_TEAR, 'and is torn off at its');
  // (where its two fists strike the floor: tiles before it, on its middle line)
  const s = skeletonAt(QUARRY_GOLEM, 'attack', QG_HIT);
  const fist = (side: 'L' | 'R') => {
    const hand = side === 'L' ? s.handL : s.handR;
    const el = side === 'L' ? s.elbowL : s.elbowR;
    return add(hand, mul(norm(sub(hand, el), [0, 0, -1]), QUARRY_GOLEM.build.armR[2] * 1.3));
  };
  const L = fist('L');
  const R = fist('R');
  near(QGOLEM.hammer.at, (L[0] + R[0]) / 2 / TILE3, 0.01, 'its fists strike the floor there');
  near((L[1] + R[1]) / 2 / TILE3, 0, 0.01, 'on its middle line');
  assert.ok(Math.min(L[2], R[2]) < 12, 'and are down on the floor then');
  // (where the chunk leaves its fist)
  const t = skeletonAt(QUARRY_GOLEM, 'throw', QG_THROW_HIT);
  const c = chunkIn(t.handL, norm(sub(t.handL, t.elbowL), [0, 0, -1]));
  near(QGOLEM.chunk.from[0], c[0] / TILE3, 0.005, 'the chunk leaves its fist: before it');
  near(QGOLEM.chunk.from[1], c[1] / TILE3, 0.005, 'to its left');
  near(QGOLEM.chunk.from[2], c[2] / 2, 0.05, 'and so high');
  near(QGOLEM.chunk.rest, CHUNK_H[2] / 2, 1e-9, 'it lies on the floor on its own half height');
  // ITS SIZE, measured as tests/first5_bosses.test.ts measures the others'
  const art = makeBestiary();
  const size = FIGURE_SIZE.qgolem;
  assert.deepEqual(size, act1Fig('qgolem')!.size, 'the game goes by its own');
  const sp = art.of('qgolem').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game takes its head to be ${size.top} up; in the picture it is ${head}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. its hammer lands at its moment on a hero before it, within its reach; not on one beside it or beyond it', () => {
  const hammer = act('qgolem:hammer');
  {
    const { g, m } = room('qgolem', 1.4, 'qgolem:hammer');
    const s = watch(g, m, 1.8);
    assert.ok(s.began > 0 && s.began < 0.05, 'it strikes at once');
    near(firstHurt(s) - s.began, hammer.hit, 0.04, 'the hammer lands as its fists strike the floor');
    assert.equal(s.hurts.length, 1, 'once');
    assert.ok(s.events.some((e) => e.t === 'shake'), 'the floor shakes');
  }
  {
    // (as far as it reaches, and no further)
    const { g, m } = room('qgolem', QGOLEM.hammer.at + QGOLEM.hammer.r - 0.05, 'qgolem:hammer');
    assert.equal(watch(g, m, 1.8).hurts.length, 1, 'it reaches a hero at the edge of its blow');
  }
  {
    const { g, m } = room('qgolem', 1.4, 'qgolem:hammer');
    // (he steps aside, up the floor, during its wind-up)
    const s = watch(g, m, 1.8, (t) => (t > 0.1 && t < 0.6 ? { mx: 0, my: -1 } : null));
    assert.equal(s.hurts.length, 0, 'stepped aside in time, the hammer misses');
  }
  {
    const { g, m } = room('qgolem', 1.4, 'qgolem:hammer');
    g.bosses.startAct(m, RULES.acts, 0);
    // (he is behind it as its fists come down)
    g.hero.x = m.x - 1.2;
    const s = watch(g, m, 1.5);
    assert.equal(s.hurts.length, 0, 'behind it, the hammer misses');
  }
});

test('4. its chunk comes down where the hero stood as it left the fist, and misses one who steps away', () => {
  const thr = act('qgolem:throw');
  for (const far of [3, 5.5, 7.5]) {
    const { g, m } = room('qgolem', far, 'qgolem:throw');
    const at = { x: g.hero.x, y: g.hero.y };
    const from = beside(m.x, m.y, 1, 0, 1, QGOLEM.chunk.from[0], QGOLEM.chunk.from[1]);
    const s = watch(g, m, 3.5);
    assert.ok(s.acts.length >= 1 && s.acts[0].startsWith('qgolem:throw'), `it throws at a hero ${far} tiles off`);
    const fly = QGOLEM.chunk.fly0 + QGOLEM.chunk.flyPer * Math.hypot(at.x - from.x, at.y - from.y);
    assert.equal(s.hurts.length, 1, 'it strikes once');
    near(firstHurt(s) - s.began, thr.hit + fly, 0.04, 'as it comes down, a moment after it left the fist');
  }
  {
    // (the chunk is in the air: he steps out from under it)
    const { g, m } = room('qgolem', 5, 'qgolem:throw');
    const s = watch(g, m, 3.5, (t) => (t > thr.hit + 0.05 && t < thr.hit + 0.5 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'out from under it in time, it misses');
    assert.ok(g.perils.some((p) => p.a1 === 'qgolem:chunk' && p.done === 1), 'and lies shattered where he stood');
  }
  // (it is thrown at one who stands off, not at one at its feet)
  assert.ok(thr.near > QGOLEM.hammer.at + QGOLEM.hammer.r, 'the throw is for a hero beyond its hammer');
  // (where it is on its way: from the fist to where he stood, up and down)
  const { g, m } = room('qgolem', 5, 'qgolem:throw');
  watch(g, m, 3, undefined, () => g.perils.some((p) => p.a1 === 'qgolem:chunk'));
  const p = g.perils.find((q) => q.a1 === 'qgolem:chunk')!;
  const t0 = p.t;
  p.t = 0;
  const w0 = chunkAt(p);
  near(w0.z, QGOLEM.chunk.from[2], 1e-6, 'it leaves the fist at its height');
  p.t = p.hit / 2;
  assert.ok(chunkAt(p).z > QGOLEM.chunk.from[2], 'it rises over its way');
  p.t = p.hit;
  const w1 = chunkAt(p);
  near(w1.x, p.x, 1e-9, 'and comes down where it was thrown');
  near(w1.z, QGOLEM.chunk.rest, 1e-9, 'on the floor');
  p.t = t0;
});

test('5. medium: its packs of three to five; it sets off, walks and stops as its pictures hand over, at its pace', () => {
  assert.equal(sizeOf('qgolem'), 'medium');
  const rng = new RNG(3);
  let seen = 0;
  for (let i = 0; i < 400; i++) {
    const p = act1Pack(6, rng, 'normal');
    if (p.kind !== 'qgolem') continue;
    seen++;
    assert.ok(p.size >= PACK_BY_SIZE.medium[0] && p.size <= PACK_BY_SIZE.medium[1], `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'and floor 6 has them');
  const G = RULES.gait;
  const { g, m } = room('qgolem', 7);
  m.moveCd = RULES.acts.map(() => 1e9);
  m.cd = 1e9;
  const c = emptyControls();
  const modes: string[] = ['stand'];
  let was = 'stand';
  for (let k = 0; k < 60 * 12; k++) {
    const x0 = m.x;
    const y0 = m.y;
    g.update(1 / 60, c);
    const mode = m.gait ? m.gait.mode : '';
    const step = Math.hypot(m.x - x0, m.y - y0);
    if (was === 'setOff' || was === 'walk' || was === 'halt') near(step, G.pace / 60, 1e-6, `carried at its pace while ${was}`);
    else assert.equal(step, 0, 'still while it stands');
    if (mode !== was) modes.push(mode);
    was = mode;
    if (modes.includes('halt') && mode === 'stand') break;
  }
  assert.deepEqual(modes, ['stand', 'setOff', 'walk', 'halt', 'stand'], 'stands, sets off, walks, stops, stands');
  const d = Math.hypot(g.hero.x - m.x, g.hero.y - m.y);
  assert.ok(d <= G.stopAt + 0.05 && d >= G.stopAt - G.pace * G.cycle - 0.05, `it stops about where it likes to stand (${d.toFixed(2)})`);
  assert.ok(d <= act('qgolem:hammer').far, 'within its hammer');
  assert.ok(G.stopAt + G.slack <= act('qgolem:hammer').far, 'and it never waits beyond its hammer\'s reach for him');
  // (wherever its walk lets it stop, from stopAt to a walk's round nearer, or against him, its hammer falls on him)
  const H = QGOLEM.hammer;
  assert.ok(Math.max(G.stopAt - G.pace * G.cycle, MONSTERS.qgolem.radius + TUNE.heroRadius) >= H.at - H.r && G.stopAt <= H.at + H.r, 'wherever it stops, its hammer reaches him');
});

test('6. what it draws: the art\'s chunk in flight and its shadow, its shattering; nothing cyan', () => {
  const { g, m } = room('qgolem', 5, 'qgolem:throw');
  watch(g, m, 3, undefined, () => g.perils.some((p) => p.a1 === 'qgolem:chunk'));
  const p = g.perils.find((q) => q.a1 === 'qgolem:chunk')!;
  for (const t of [0.05, p.hit * 0.5, p.hit - 0.01, p.hit + 0.1, p.hit + 0.5, p.dur - 0.3]) {
    p.t = t;
    for (const fx of [1, -1]) {
      p.fx = fx;
      p.fy = 0;
      const { c, drawn } = fakeCtx(g, t);
      FX.ground!(c, null, p);
      FX.standing!(c, null, p);
      if (t < p.hit) {
        assert.equal(drawn.images.length, 1, `in flight (${t.toFixed(2)}): the chunk`);
        assert.deepEqual(drawn.fills, ['#07050a'], 'and its shadow, the game\'s black');
      } else assert.equal(drawn.images.length, 1, `come down (${t.toFixed(2)}): its pieces`);
      // (turned over, its picture is a canvas made from the one checked)
      if (fx > 0) for (const img of drawn.images) assert.equal(cyanInPx(img), 0, 'nothing cyan');
    }
  }
  // (and nothing of a monster's: it draws only its chunk)
  const { c, drawn } = fakeCtx(g, 0);
  FX.ground!(c, m, null);
  FX.standing!(c, m, null);
  assert.equal(drawn.images.length + drawn.fills.length, 0, 'nothing for the golem itself: its pictures are all');
  const art = act1Fig('qgolem')!.make();
  for (const sp of [art.front.idle[0], art.back.walk[3], art.front.clips!.attack!.frames[28], art.front.clips!.moves!.throw.frames[30]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on it');
});

test('7. a long fight with it, and its death in the middle of a throw: no exceptions, nothing of it left harming', () => {
  const { g, m } = room('qgolem', 4);
  m.life = m.maxLife = 2000;
  // (he circles it, and comes in and goes out; it is struck now and then)
  let k0 = 0;
  const s = watch(g, m, 45, (t) => ({ mx: Math.cos(t * 0.7), my: Math.sin(t * 1.1) }), () => {
    if (++k0 % 50 === 0) (g as unknown as { damageMonster(m: unknown, n: number, el: string, c: boolean, k: number): void }).damageMonster(m, 5, 'phys', false, -1);
    return false;
  });
  assert.ok(s.acts.some((a) => a.startsWith('qgolem:hammer')) && s.acts.some((a) => a.startsWith('qgolem:throw')), `it uses both its blows (${[...new Set(s.acts.map((a) => a.split('#')[0]))].join(', ')})`);
  const k = room('qgolem', 5, 'qgolem:throw');
  keep(k.m, 'qgolem:throw');
  watch(k.g, k.m, 3, undefined, () => k.m.act !== undefined && k.m.act.t > 0.8);
  k.g.kill(k.m);
  const after = watch(k.g, k.m, 8);
  assert.ok(after.hurts.length <= 1, 'what it had torn off is dropped or comes down once');
  assert.equal(k.g.perils.filter((p) => p.a1 === 'qgolem:chunk').length, 0, 'and nothing of it lies there long');
});
