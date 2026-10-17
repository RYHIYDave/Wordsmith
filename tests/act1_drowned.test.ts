// ACT 1: THE DROWNED (FLOOR 10) IN THE GAME (game/act1_rules/drowned.ts, art/act1_figs/drowned.ts, render/act1_fx/drowned.ts):
//   1. it is built: its rules, its pictures (the art chat's, each with his yes) with a clip by each name its acts use,
//      its switch on with the descent, its size as its pictures stand;
//   2. the rules' numbers are its pictures' own;
//   3. IT RISES FROM THE WATER (his design doc): it lies under the water, unseen and not to be struck, until it wakes;
//      then its rise is its first act, played whole; it may be struck once it is up; it is laid by the water's edge
//      where its floor has water near;
//   4. its grab lands at its picture's moment, before it as far as its hands reach, and not further; and SLOWS the hero
//      by the game's own chill on him;
//   5. it comes in packs of its size, on its floor;
//   6. a long fight on its floor with a pack of them: no exceptions, every act made.
//   run: tsx --test tests/act1_drowned.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIRST5_FIGURES, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { DROWNED as DROWNED_MOB, DROWNED_ON, DR_GRAB, DR_PACE, DR_RISE } from '../src/art/drowned';
import { TILE3, handAt } from '../src/art/new_mobs3';
import { RNG } from '../src/engine/rng';
import { ACT1 } from '../src/game/act1';
import { act1Pack } from '../src/game/act1_mobs';
import { DROWNED, underWater } from '../src/game/act1_rules/drowned';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { T_FLOOR, T_PIT } from '../src/game/types';
import type { Monster } from '../src/game/state';
import { clipFrame } from '../src/render/figure';
import { act1Fx } from '../src/render/act1_fx/index';
import { floor, longFight, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
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
  const r = act1Rules('drowned');
  const fig = act1Fig('drowned');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(DROWNED_ON), "the art chat's switch is its");
  assert.equal(DROWNED_ON.on, ACT1.on, 'on with the descent');
  assert.ok(FIRST5_FIGURES.includes('drowned'));
  const art = makeBestiary().of('drowned');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
  }
  const m = measuredSize('drowned');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
});

test("2. the rules' numbers are its pictures' own", () => {
  const G = gaitOf('drowned')!;
  assert.equal(G.pace, DR_PACE, 'its shamble at the pace it is painted for');
  assert.equal(MONSTERS.drowned.speed, DR_PACE);
  assert.equal(makeBestiary().of('drowned').front.walkFps, DROWNED_MOB.walkFps, 'its shamble shown at its own rate');
  assert.equal(G.trueBack, DROWNED_MOB.trueBack === true, 'its back as its pictures have it');
  const acts = actsOf({ kind: 'drowned' })!;
  assert.equal(acts.filter((a) => !a.forced).length, 1, 'small: one attack');
  const grab = acts.find((a) => a.id === 'drowned:grab')!;
  const rise = acts.find((a) => a.id === 'drowned:rise')!;
  assert.equal(grab.hit, DR_GRAB.hit, 'its hands clutch at their moment');
  assert.equal(grab.long, DR_GRAB.long);
  assert.equal(rise.long, DR_RISE.long);
  assert.equal(DROWNED.rise.up, DR_RISE.up);
  assert.ok(rise.forced, 'its rise is not chosen: it comes as it wakes');
  // (where its picture's hands are as they clutch: as far before it as the rules reach)
  const L = handAt(DROWNED_MOB, 'attack', DR_GRAB.hit, 'L');
  const R = handAt(DROWNED_MOB, 'attack', DR_GRAB.hit, 'R');
  near(DROWNED.grab.reach, Math.max(L[0], R[0]) / TILE3, 0.05, 'its hands as far as they reach');
  assert.ok(Math.abs(L[1] / TILE3) <= DROWNED.grab.half && Math.abs(R[1] / TILE3) <= DROWNED.grab.half, 'and as wide');
  assert.equal(MONSTERS.drowned.windup, DR_GRAB.hit);
  assert.ok(G.stopAt < grab.far && grab.far <= DROWNED.grab.reach + TUNE.heroRadius * 0.5 + 0.01, 'it stops inside its reach');
});

test('3. it rises from the water: under it until it wakes, unseen and not to be struck; its rise its first act; struck once up', () => {
  const { g, m } = room('drowned', 3);
  // (as it came into the world: under the water)
  const fresh = g.spawn('drowned', g.hero.x + 5, g.hero.y, -3, 0, false, new RNG(3));
  assert.equal(fresh.a1?.under, 1, 'it comes into the world under the water');
  assert.ok(underWater(fresh) && !act1Rules('drowned')!.reachable!(fresh), 'not to be struck');
  const life = fresh.life;
  (g as unknown as { damageMonster(m: Monster, d: number, el: string, crit: boolean, skill: number): void }).damageMonster(fresh, 5, 'phys', false, -1);
  assert.equal(fresh.life, life, 'a blow does nothing to it under the water');
  // (its picture while it lies there: its rise's first, nothing of it above the water)
  const art = makeBestiary().of('drowned');
  const fx = act1Fx('drowned')!;
  assert.equal(fx.sprite!(fresh, art, art.front), clipFrame(art.front.clips!.moves!.rise, 0), "its rise's first picture");
  assert.ok(fx.hidden!(fresh), 'nothing of it seen: not its shadow, ring, bar or name');
  // (woken: its first act is to rise, played whole; it may be struck once it is up)
  const s = watch(g, m, 3, undefined, () => m.state === 'act' && m.act!.t >= DROWNED.rise.up - 0.05);
  assert.equal(s.act, 'drowned:rise', 'it rises first');
  assert.ok(!act1Rules('drowned')!.reachable!(m), 'not yet up: not yet to be struck');
  watch(g, m, 0.2);
  assert.ok(act1Rules('drowned')!.reachable!(m), 'up: it may be struck');
  watch(g, m, 2, undefined, () => m.state !== 'act');
  assert.equal(m.a1?.under, 0, 'risen');
  assert.equal(fx.sprite!(m, art, art.front), null, 'its pictures are its gait and acts once risen');
  assert.ok(!fx.hidden!(m), 'and it is seen');
  // (it is laid by the water's edge, where its floor has water near)
  const f10 = floor(10, 7);
  const L = f10.level;
  const W = L.floor.w;
  const pit = (x: number, y: number): boolean => L.floor.tiles[y * W + x] === T_PIT;
  let laid = 0;
  let tried = 0;
  for (const a of L.land!.areas) {
    const d = f10.spawn('drowned', a.blob.x, a.blob.y, -5, 0, false, new RNG(1));
    tried++;
    const tx = Math.floor(d.x);
    const ty = Math.floor(d.y);
    const edge = L.floor.tiles[ty * W + tx] === T_FLOOR && (pit(tx + 1, ty) || pit(tx - 1, ty) || pit(tx, ty + 1) || pit(tx, ty - 1));
    if (edge) {
      laid++;
      assert.ok(Math.hypot(d.x - a.blob.x, d.y - a.blob.y) <= DROWNED.water.near + 0.01, 'no further than it may be laid');
    }
  }
  assert.ok(laid > 0, `laid by the water's edge on floor 10 (${laid} of ${tried})`);
});

test('4. its grab lands at its moment, before it as far as its hands reach, and not further; and slows the hero', () => {
  for (const [far, hurt] of [[0.7, true], [1.15, true], [1.35, false]] as const) {
    const { g, m } = room('drowned', 0.9, 'drowned:grab');
    m.a1 = { under: 0 };
    assert.ok(untilAct(g, m, 'drowned:grab'), 'it grabs');
    const h = g.hero;
    h.x = m.x + m.fx * far;
    h.y = m.y + m.fy * far;
    h.chillT = 0;
    const t0 = m.act!.t;
    let slowed = 0;
    let chill = 0;
    const s = watch(g, m, 1.0, undefined, () => {
      if (h.chillT > slowed) {
        slowed = h.chillT;
        chill = h.chill;
      }
      return m.act !== undefined && m.act.t >= DR_GRAB.hit + 0.05;
    });
    if (hurt) {
      assert.equal(s.hurts.length, 1, `at ${far}: grabbed once`);
      near(s.hurts[0].t + t0, DR_GRAB.hit, 1.5 / 60, 'as its hands clutch');
      near(slowed, DROWNED.grab.secs, 0.05, 'slowed for its while');
      assert.equal(chill, DROWNED.grab.slow, "by the game's own chill");
      assert.ok(s.events.some((e) => e.t === 'text' && e.text === 'Grabbed'), 'he is told');
    } else {
      assert.equal(s.hurts.length, 0, 'beyond its hands: not grabbed');
      assert.equal(slowed, 0, 'nor slowed');
    }
  }
  // (and a hero slowed by it walks slower)
  const { g, m } = room('drowned', 3);
  m.a1 = { under: 0 };
  const h = g.hero;
  const x0 = h.x;
  watch(g, m, 0.5, (_t, c) => (c.my = 1));
  const free = Math.abs(h.y - 15);
  h.y = 15;
  h.x = x0;
  h.chill = DROWNED.grab.slow;
  h.chillT = DROWNED.grab.secs;
  watch(g, m, 0.5, (_t, c) => (c.my = 1));
  near(Math.abs(h.y - 15) / free, 1 - DROWNED.grab.slow, 0.06, 'slowed by its share');
});

test('5. it comes in packs of its size, on its floor', () => {
  assert.equal(sizeOf('drowned'), 'small');
  const [lo, hi] = PACK_BY_SIZE.small;
  const rng = new RNG(6);
  let seen = 0;
  for (let k = 0; k < 400; k++) {
    const p = act1Pack(10, rng, 'normal');
    if (p.kind !== 'drowned') continue;
    seen++;
    assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
  }
  assert.ok(seen > 20, 'its own packs on floor 10, no stand-in');
});

test('6. a long fight on its floor with a pack of them: no exceptions, every act made', () => {
  const { acts } = longFight('drowned', 10, 40);
  for (const id of ['drowned:rise', 'drowned:grab']) assert.ok(acts.has(id), `it made its ${id}`);
});
