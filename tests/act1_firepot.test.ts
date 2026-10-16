// ACT 1: THE FIREPOT THROWER IN THE GAME (game/act1_rules/firepot.ts; its pictures art/act1_figs/firepot.ts, the art
// chat's art/act1_cultists.ts; its pot and its fire drawn by render/act1_fx/firepot.ts).
//
//   1. it is built: its rules, its pictures with the clip its act names (both ways it is seen);
//   2. its numbers are its pictures' own (its pace and trudge, its lob's length and moment, where the pot leaves
//      its sling), and its size as the game goes by it;
//   3. its pot comes down where the hero stood as it was let go and bursts on him; misses one who has stepped
//      away;
//   4. the floor burns where it came down, tick by tick, for as long as it burns, and no longer; on whoever
//      stands in it, and not beside it; its fire is the enemy's, and burns;
//   5. small: its packs of four to seven, on every floor of the descent;
//   6. what it draws: the art's pot in flight and its shadow, its burst and its fire burning; nothing cyan;
//   7. a long fight: no exceptions; killed, what it threw burns out and is gone.
//   run: tsx --test tests/act1_firepot.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIREPOT_THROWER, POTS_LOB, POTS_PACE, potsPotAt } from '../src/art/act1_cultists';
import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3 } from '../src/art/new_mobs3';
import { act1Fig } from '../src/art/act1_figs/index';
import { RNG } from '../src/engine/rng';
import { act1Pack, act1Ready } from '../src/game/act1_mobs';
import { FIREPOT, RULES, potAt } from '../src/game/act1_rules/firepot';
import { act1Rules } from '../src/game/act1_rules/index';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { beside } from '../src/game/facing';
import { FX } from '../src/render/act1_fx/firepot';
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

paintWithoutCanvas();
fakeDocument();

const lob = RULES.acts[0];
/** When a pot let go from it at (x, y), facing east, at a hero at (hx, hy), comes down: seconds after the lob began. */
const landsAt = (x: number, y: number, hx: number, hy: number): number => {
  const o = beside(x, y, 1, 0, 1, FIREPOT.pot.from[0], FIREPOT.pot.from[1]);
  return lob.hit + FIREPOT.pot.fly0 + FIREPOT.pot.flyPer * Math.hypot(hx - o.x, hy - o.y);
};

test('1. it is built: its rules, its pictures with the clip its act names', () => {
  assert.ok(act1Rules('firepot') === RULES, 'its rules');
  assert.ok(act1Ready('firepot'), 'in the game: no longer stood in for');
  assert.ok(act1Fx('firepot') === FX, 'what it draws');
  assert.equal(RULES.acts.length, 1, 'small: one attack');
  const art = act1Fig('firepot')!.make();
  for (const set of [art.front, art.back]) {
    const clip = set.clips!.attack!;
    assert.equal(lob.clip, 'attack');
    near((clip.frames.length - 1) / clip.fps, lob.long, 0.05, 'its clip as long as the act');
    near(clip.hit ?? -1, lob.hit, 1e-9, "its clip's blow is the act's");
    assert.ok(set.clips?.reel && set.clips.die, 'struck, and its death');
  }
});

test("2. its numbers are its pictures' own, and its size as the game goes by it", () => {
  const G = RULES.gait;
  assert.equal(G.pace, POTS_PACE, 'the pace its trudge is painted for');
  assert.equal(MONSTERS.firepot.speed, POTS_PACE, 'and it goes at it: its feet do not slide');
  near(G.cycle, FIREPOT_THROWER.walkFrames / FIREPOT_THROWER.walkFps, 1e-9, 'its walk goes round');
  assert.equal(G.trueBack, !!FIREPOT_THROWER.trueBack, 'from behind as its pictures are painted');
  assert.equal(lob.long, POTS_LOB.long, 'its lob is as long as its picture');
  assert.equal(lob.hit, POTS_LOB.hit, 'and the pot is let go at its moment');
  const p = potsPotAt();
  near(FIREPOT.pot.from[0], p[0] / TILE3, 0.005, 'the pot leaves the sling: before it');
  near(FIREPOT.pot.from[1], p[1] / TILE3, 0.005, 'to its left');
  near(FIREPOT.pot.from[2], p[2] / 2, 0.05, 'and so high');
  assert.ok(G.stopAt + G.slack <= lob.far, 'it never waits for one out of its reach');
  assert.equal(MONSTERS.firepot.element, 'fire', 'its fire is the enemy\'s');
  const art = makeBestiary();
  const size = FIGURE_SIZE.firepot;
  assert.deepEqual(size, act1Fig('firepot')!.size, 'the game goes by its own');
  const sp = art.of('firepot').front.idle[0];
  const pp = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < pp.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (pp.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game takes its head to be ${size.top} up; in the picture it is ${head}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. its pot comes down where the hero stood as it was let go, and bursts on him; misses one who steps away', () => {
  for (const far of [2, 4.5, 7]) {
    const { g, m } = room('firepot', far, 'firepot:lob');
    const when = landsAt(m.x, m.y, g.hero.x, g.hero.y);
    const s = watch(g, m, when + 0.1);
    assert.equal(s.hurts.length, 1, `a pot at a hero ${far} tiles off bursts on him`);
    near(firstHurt(s) - s.began, when, 0.04, 'as it comes down');
    const [lo, hi] = [m.dmgMin * lob.dmg * 0.3, m.dmgMax * lob.dmg * 1.01];
    assert.ok(s.hurts[0].n >= lo && s.hurts[0].n <= hi, `its blow (${s.hurts[0].n})`);
  }
  {
    const { g, m } = room('firepot', 5, 'firepot:lob');
    const s = watch(g, m, 4, (t) => (t > lob.hit + 0.05 && t < lob.hit + 0.45 ? { mx: 0, my: 1 } : null));
    assert.equal(s.hurts.length, 0, 'stepped away while it flew: nothing of it touches him');
    assert.ok(g.perils.some((p) => p.a1 === 'firepot:pot' && p.done > 0), 'and it burns where he stood');
  }
});

test('4. the floor burns where it came down, tick by tick, on whoever stands in it, and no longer than it burns', () => {
  const F = FIREPOT.fire;
  const { g, m } = room('firepot', 4, 'firepot:lob');
  const when = landsAt(m.x, m.y, g.hero.x, g.hero.y);
  // (it lobs only once here)
  const s = watch(g, m, when + FIREPOT.burst.long + F.burn + 1, undefined, () => {
    if (m.act === undefined && m.moveCd) m.moveCd[0] = 1e9;
    return false;
  });
  const burns = s.hurts.slice(1);
  const ticks = Math.floor((F.burn - F.fade) / F.tick) + 1;
  assert.ok(Math.abs(burns.length - ticks) <= 1, `it burns him ${burns.length} times as he stands in it (${ticks})`);
  for (let i = 1; i < burns.length; i++) near(burns[i].t - burns[i - 1].t, F.tick, 0.04, 'every tick');
  assert.ok(burns.every((b) => b.n < s.hurts[0].n), 'each burning less than the burst');
  const last = burns[burns.length - 1].t - s.began;
  assert.ok(last <= when + FIREPOT.burst.long + F.burn + 0.05, `and no longer than it burns (${last.toFixed(2)})`);
  assert.equal(g.perils.filter((p) => p.a1 === 'firepot:pot').length, 0, 'and it is gone');
  // (beside it, out of it, nothing)
  {
    const k = room('firepot', 4, 'firepot:lob');
    const w = landsAt(k.m.x, k.m.y, k.g.hero.x, k.g.hero.y);
    const s2 = watch(k.g, k.m, w + 3, (t) => (t > w + 0.05 && t < w + 0.05 + (F.r + TUNE.heroRadius + 0.3) / TUNE.heroSpeed + 0.1 ? { mx: 0, my: 1 } : null), () => {
      if (k.m.act === undefined && k.m.moveCd) k.m.moveCd[0] = 1e9;
      return false;
    });
    assert.equal(s2.hurts.length, 1, 'struck by its burst, he steps out of the fire: it burns him no more');
  }
});

test('5. small: its packs of four to seven, on every floor of the descent', () => {
  assert.equal(sizeOf('firepot'), 'small');
  for (const depth of [6, 7, 8, 9, 10]) {
    const rng = new RNG(depth + 20);
    let seen = 0;
    for (let i = 0; i < 600; i++) {
      const p = act1Pack(depth, rng, 'normal');
      if (p.kind !== 'firepot') continue;
      seen++;
      assert.ok(p.size >= PACK_BY_SIZE.small[0] && p.size <= PACK_BY_SIZE.small[1], `a pack of ${p.size}`);
    }
    assert.ok(seen > 10, `floor ${depth} has them (${seen})`);
  }
});

test('6. what it draws: the art\'s pot in flight and its shadow, its burst and its fire; nothing cyan', () => {
  const { g, m } = room('firepot', 5, 'firepot:lob');
  watch(g, m, 2, undefined, () => g.perils.some((p) => p.a1 === 'firepot:pot'));
  const p = g.perils.find((q) => q.a1 === 'firepot:pot')!;
  for (const t of [0.05, p.hit * 0.5, p.hit - 0.01, p.hit + 0.05, p.hit + 0.35, p.hit + 1.2, p.dur - 0.2]) {
    p.t = t;
    for (const fx of [1, -1]) {
      p.fx = fx;
      p.fy = 0;
      const { c, drawn } = fakeCtx(g, t);
      FX.ground!(c, null, p);
      FX.standing!(c, null, p);
      if (t < p.hit) {
        assert.equal(drawn.images.length, 1, `in flight (${t.toFixed(2)}): the pot`);
        assert.deepEqual(drawn.fills, ['#07050a'], 'and its shadow, the game\'s black');
      } else assert.ok(drawn.images.length >= 1, `come down (${t.toFixed(2)}): its fire`);
      assert.ok(drawn.spots > 0, 'its light');
      if (t >= p.hit) assert.ok(drawn.glows > 0, 'its own glow, the cult\'s fire');
      // (turned over, its picture is a canvas made from the one checked)
      if (fx > 0) for (const img of drawn.images) assert.equal(cyanInPx(img), 0, 'nothing cyan');
    }
  }
  const { c, drawn } = fakeCtx(g, 0);
  FX.ground!(c, m, null);
  FX.standing!(c, m, null);
  assert.equal(drawn.images.length + drawn.fills.length, 0, 'nothing for the thrower itself: its pictures are all');
  const art = act1Fig('firepot')!.make();
  for (const set of [art.front, art.back]) for (const sp of [set.idle[0], set.walk[3], set.clips!.attack!.frames[20], set.clips!.reel!.frames[3]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on it');
});

test('7. a long fight: no exceptions; killed, what it threw burns out and is gone', () => {
  const { g, m } = room('firepot', 4);
  m.life = m.maxLife = 500;
  const s = watch(g, m, 30, (t) => ({ mx: Math.cos(t * 0.6), my: Math.sin(t * 0.9) }));
  assert.ok(s.acts.length > 4, `it lobs, again and again (${s.acts.length})`);
  const k = room('firepot', 5, 'firepot:lob');
  watch(k.g, k.m, 2, undefined, () => k.g.perils.some((p) => p.a1 === 'firepot:pot'));
  k.g.kill(k.m);
  watch(k.g, k.m, FIREPOT.burst.long + FIREPOT.fire.burn + 2);
  assert.equal(k.g.perils.length, 0, 'what it threw burns out, and is gone');
});
