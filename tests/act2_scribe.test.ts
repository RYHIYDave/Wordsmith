// ACT 2, THE HUSH: THE SILENT ORDER'S SCRIBES IN THE GAME (game/act1_rules/scribe.ts, art/act1_figs/scribe.ts; their ink on
// the floor, render/act1_fx/scribe.ts), behind ACT2 (game/act1.ts, off):
//   1. it is built: its rules, its pictures (the art chat's) with a clip by each name its act uses, the art's switch with its
//      figure, its size as its pictures stand, what it draws;
//   2. the rules' numbers are its pictures' own: its glide, its flick's length and moment, where the ink leaves the nib, the
//      ink's flight, and its pool, as wide as drawInkSplat draws it, moment by moment;
//   3. the ink is aimed where the hero stands, followed through the warning and then held: it lands at its moment and
//      strikes one still there, once; misses one who stepped out after the warning; lands no further than they throw;
//   4. THE POOL slows one who stands in it (the game's own chill), not one beside it; no harm; dried, nothing;
//   5. they keep their distance: they stand off, and back away from one who comes in on them, a while; then stand and flick;
//   6. what it draws: the ring closing on the spot, the ink in its arc, the splash and the pool; nothing cyan;
//   7. small: in packs on floors 11, 12 and 15 (the city, the sewers, the library); with the switch off, on none;
//   8. a long fight on floor 11 with a pack of them: no exceptions, its flick made.
//   run: tsx --test tests/act2_scribe.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { act1Fig } from '../src/art/act1_figs/index';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { SCRIBES_ON, quillOf } from '../src/art/scribes';
import { SCRIBE as SC_MOB, SC_DIES, SC_FLICK, SC_PACE, SC_WALK } from '../src/art/scribes_moves';
import { INK_ARC, INK_FLIGHT, INK_POOL, INK_POOL_FOR, drawInkSplat } from '../src/art/scribe_shots';
import { RNG } from '../src/engine/rng';
import { act2Pack } from '../src/game/act2_mobs';
import { SCRIBE, poolAt } from '../src/game/act1_rules/scribe';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, TUNE, sizeOf } from '../src/game/defs';
import { FX } from '../src/render/act1_fx/scribe';
import { act1Fx } from '../src/render/act1_fx/index';
import { cityFight, hush, offTheFloors } from './act2_city_room';
import { cyanish, measuredSize, room, untilAct, watch } from './act1_kinds_room_c';
import { fakeCtx } from './act1_kinds_room';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

paintWithoutCanvas();

const flick = actsOf({ kind: 'scribe' })![0];
/** The floor as the game lays it out on the screen (a tile 32 by 16), and back. */
const ISO = (x: number, y: number): [number, number] => [(x - y) * 16, (x + y) * 8];
const OSI = (sx: number, sy: number): [number, number] => [(sx / 16 + sy / 8) / 2, (sy / 8 - sx / 16) / 2];

test('1. it is built: its rules, its pictures with a clip by each name its act uses, the art\'s switch, its size, what it draws', () => {
  const r = act1Rules('scribe');
  const fig = act1Fig('scribe');
  assert.ok(r && fig, 'its rules and its pictures');
  assert.ok(fig!.switches?.includes(SCRIBES_ON), "the art chat's switch is its figure's");
  assert.ok(act1Fx('scribe') === FX && FX, 'its ink drawn');
  const art = makeBestiary().of('scribe');
  for (const set of [art.front, art.back]) {
    for (const a of r!.acts) {
      const clip = a.clip === 'attack' ? set.clips?.attack : set.clips?.moves?.[a.clip];
      assert.ok(clip && clip.frames.length > 0, `its ${a.id}: its clip ${a.clip}`);
      near((clip!.frames.length - 1) / clip!.fps, a.long, 1 / clip!.fps, `its ${a.id}'s length`);
      near(clip!.hit ?? -1, a.hit, 1e-9, "its clip's blow is the act's");
    }
    assert.ok(set.clips?.reel && set.clips?.die, 'struck and its death');
    near((set.clips!.die!.frames.length - 1) / set.clips!.die!.fps, SC_DIES.long, 0.06, 'the mask splitting, as long as its picture');
  }
  const m = measuredSize('scribe');
  assert.ok(Math.abs(m.size.top - m.head) <= 4, `the game takes it to be ${m.size.top} up; in the picture it is ${m.head}`);
  assert.ok(m.size.half <= m.reach + 1 && m.size.half >= m.reach * 0.4, `${m.size.half} to either side; the picture reaches ${m.reach}`);
  assert.deepEqual(FIGURE_SIZE.scribe, fig!.size, 'the game goes by its size');
});

test("2. the rules' numbers are its pictures' own: its glide, its flick, the nib, the ink's flight, its pool as drawn", () => {
  const G = gaitOf('scribe')!;
  assert.equal(G.pace, SC_PACE, 'its glide at the pace it is painted for');
  assert.equal(MONSTERS.scribe.speed, SC_PACE);
  assert.equal(makeBestiary().of('scribe').front.walkFps, SC_WALK.fps, 'its glide shown at its own rate');
  near(G.cycle, 1 / SC_WALK.fps, 1e-9, 'it may stop at any frame of its glide');
  assert.equal(G.trueBack, SC_MOB.trueBack === true);
  assert.equal(actsOf({ kind: 'scribe' })!.length, 1, 'small: one attack');
  assert.equal(flick.hit, SC_FLICK.hit, 'the ink leaves the nib at its moment');
  assert.equal(flick.long, SC_FLICK.long);
  assert.equal(MONSTERS.scribe.windup, SC_FLICK.hit);
  const F = SCRIBE.flick;
  near(F.lock, SC_FLICK.warn[1], 1e-9, 'the spot held from the end of the warning');
  assert.ok(F.mark < SC_FLICK.warn[0] && F.mark > 0.1, 'the ring shows from as the quill is dipped');
  const nib = quillOf(skeletonAt(SC_MOB, 'attack', SC_FLICK.hit)).nib;
  near(F.from[0], nib[0] / TILE3, 0.005, 'the ink leaves the nib: before it');
  near(F.from[1], nib[1] / TILE3, 0.005, 'to its left');
  near(F.from[2], nib[2] / 2, 0.05, 'and so high');
  assert.equal(F.flight, INK_FLIGHT, 'in the air as long as its picture');
  assert.equal(F.arc, INK_ARC);
  assert.equal(SCRIBE.pool.r, INK_POOL, 'its pool as wide as its picture');
  assert.equal(SCRIBE.pool.last, INK_POOL_FOR, 'and as long');
  near(SCRIBE.splash.r, INK_POOL + TUNE.heroRadius * 0.5, 1e-9, 'its splash strikes who the pool lands on');
  // (THE POOL AS DRAWN: the ink laid by drawInkSplat, moment by moment, as far from its middle as the rules have it)
  for (const t of [0.4, 1.0, 1.4, 1.8, 2.2, 2.38]) {
    const cells: [number, number][] = [];
    const g = { globalAlpha: 1, fillStyle: '', fillRect(x: number, y: number): void { cells.push([x, y]); } };
    drawInkSplat(g as unknown as CanvasRenderingContext2D, ISO, 0, 0, t);
    // (the pool's own ink: the glint's few dots aside, as far as it goes)
    const far = cells.map(([x, y]) => Math.hypot(...OSI(x, y))).sort((a, b) => b - a)[3];
    near(poolAt(t), far, 0.09, `the pool ${t} s after it landed`);
  }
  assert.equal(poolAt(INK_POOL_FOR), 0, 'dried away');
  assert.ok(flick.far <= F.most, 'it flicks at no one further than it throws');
  assert.ok(G.stopAt + G.slack <= flick.far, 'and never waits for one out of its reach');
  assert.equal(MONSTERS.scribe.range, flick.far);
});

test('3. the ink is aimed where he stands, followed through the warning, then held: it lands at its moment, once; misses one who stepped out', () => {
  const landAt = SC_FLICK.hit + INK_FLIGHT;
  for (const far of [2.5, 4.5, 6]) {
    const { g, m } = room('scribe', far, 'scribe:flick');
    const s = watch(g, m, 2.5);
    assert.equal(s.hurts.length, 1, `at ${far}: struck once`);
    near(s.hurts[0].t - s.began, landAt, 0.05, 'as the ink lands');
  }
  {
    // (he walks off through the warning: the spot follows him, and the ink lands on him)
    const { g, m } = room('scribe', 4, 'scribe:flick');
    let went = -1;
    const s = watch(g, m, 2.5, (t, c) => {
      if (went < 0 && m.state === 'act') went = t;
      if (went >= 0 && t < went + SCRIBE.flick.lock - 0.1) c.my = 1;
    });
    assert.equal(s.hurts.length, 1, 'followed through the warning: struck');
  }
  {
    // (he steps out of the ring after it is held: missed)
    const { g, m } = room('scribe', 4, 'scribe:flick');
    let began = -1;
    const s = watch(g, m, 2.5, (t, c) => {
      if (began < 0 && m.state === 'act') began = t;
      if (began >= 0 && t > began + SCRIBE.flick.lock + 0.02 && t < began + landAt) c.my = 1;
    });
    assert.equal(s.hurts.length, 0, 'out of the ring once it was held: missed');
    const p = g.perils.find((q) => q.a1 === 'scribe:ink');
    assert.ok(!p || p.done === 1, 'it landed where it was aimed');
  }
  {
    // (no further than they throw)
    const { g, m } = room('scribe', 3, 'scribe:flick');
    assert.ok(untilAct(g, m, 'scribe:flick'), 'it flicks');
    g.hero.x = m.x - 9;
    watch(g, m, 0.8, undefined, () => g.perils.some((q) => q.a1 === 'scribe:ink'));
    const p = g.perils.find((q) => q.a1 === 'scribe:ink')!;
    near(Math.hypot(p.x - m.x, p.y - m.y), SCRIBE.flick.most, 0.02, 'it lands at its furthest');
  }
});

test('4. THE POOL slows one who stands in it, not one beside it; no harm; dried, nothing', () => {
  const { g, m } = room('scribe', 4, 'scribe:flick');
  const h = g.hero;
  watch(g, m, 2, undefined, () => g.perils.some((q) => q.a1 === 'scribe:ink' && q.done === 1));
  const p = g.perils.find((q) => q.a1 === 'scribe:ink')!;
  m.moveCd = [1e9];
  m.state = 'sleep';
  // (in it: slowed by the game's own chill)
  h.x = p.x + 0.2;
  h.y = p.y;
  h.chillT = 0;
  let chill = 0;
  let longest = 0;
  const s = watch(g, m, 0.5, undefined, () => {
    chill = Math.max(chill, h.chillT > 0 ? h.chill : 0);
    longest = Math.max(longest, h.chillT);
    return false;
  });
  assert.equal(chill, SCRIBE.pool.slow, 'slowed while he stands in it');
  assert.ok(longest <= SCRIBE.pool.linger + 1e-9, 'and for a moment after');
  assert.equal(s.hurts.length, 0, 'the pool does no harm');
  // (beside it: not)
  h.x = p.x + SCRIBE.pool.r + 0.3;
  h.chillT = 0;
  watch(g, m, 0.2);
  let beside = 0;
  watch(g, m, 0.3, undefined, () => {
    beside = Math.max(beside, h.chillT);
    return false;
  });
  assert.equal(beside, 0, 'beside it: not slowed');
  // (dried: nothing, and gone)
  h.x = p.x;
  watch(g, m, SCRIBE.pool.last);
  assert.ok(!g.perils.includes(p), 'dried away');
  h.chillT = 0;
  watch(g, m, 0.2);
  assert.equal(h.chillT, 0, 'and nothing where it was');
  // (and a hero who walks through it walks slower)
  const { g: g2, m: m2 } = room('scribe', 4, 'scribe:flick');
  const h2 = g2.hero;
  watch(g2, m2, 2, undefined, () => g2.perils.some((q) => q.a1 === 'scribe:ink' && q.done === 1));
  m2.moveCd = [1e9];
  m2.state = 'sleep';
  const q = g2.perils.find((x) => x.a1 === 'scribe:ink')!;
  h2.x = q.x - 0.2;
  h2.y = q.y - 0.2;
  watch(g2, m2, 0.15, (_t, c) => (c.my = 1));
  const slowed = Math.hypot(h2.x - (q.x - 0.2), h2.y - (q.y - 0.2));
  h2.x = q.x - 3;
  h2.y = q.y - 0.2;
  h2.chillT = 0;
  watch(g2, m2, 0.15, (_t, c) => (c.my = 1));
  const free = Math.hypot(h2.x - (q.x - 3), h2.y - (q.y - 0.2));
  assert.ok(slowed < free * (1 - SCRIBE.pool.slow * 0.6), `slower through the ink (${slowed.toFixed(3)} against ${free.toFixed(3)})`);
});

test('5. they keep their distance: they stand off; and back away from one who comes in on them, a while, then stand and flick', () => {
  {
    // (they come no nearer than they stand off)
    const { g, m } = room('scribe', 9);
    m.moveCd = [1e9];
    watch(g, m, 8);
    const d = Math.hypot(m.x - g.hero.x, m.y - g.hero.y);
    assert.ok(d >= gaitOf('scribe')!.stopAt - 0.3 && d <= gaitOf('scribe')!.stopAt + gaitOf('scribe')!.slack + 0.1, `it stands off (${d.toFixed(2)} tiles)`);
  }
  const { g, m } = room('scribe', 1.2);
  const h = g.hero;
  m.cd = 0.4;
  let farthest = 0;
  let backing = 0;
  const s = watch(g, m, 6, undefined, () => {
    farthest = Math.max(farthest, Math.hypot(m.x - h.x, m.y - h.y));
    if (m.a1 && m.a1.back > 0) backing = Math.max(backing, m.a1.back);
    return m.state === 'act';
  });
  assert.ok(farthest > 1.2 + 0.6, `it backed away from him (to ${farthest.toFixed(2)} tiles)`);
  assert.ok(backing <= SCRIBE.keep.most + 0.02, 'for a while at the most');
  assert.ok(s.began > 0, 'then stood and flicked');
});

test('6. what it draws: the ring closing on the spot, the ink in its arc, the splash and the pool; nothing cyan', () => {
  const { g, m } = room('scribe', 4, 'scribe:flick');
  assert.ok(untilAct(g, m, 'scribe:flick'));
  const colours = (draw: (c: ReturnType<typeof fakeCtx>['c']) => void): string[] => {
    const seen: string[] = [];
    const { c } = fakeCtx(g, 0.3);
    const cv = c.g as unknown as { fillRect: (x: number, y: number) => void; fillStyle: string };
    cv.fillRect = () => void seen.push(cv.fillStyle);
    draw(c);
    return seen;
  };
  // (before the ring shows, nothing; through the warning, the ring)
  assert.equal(colours((c) => FX!.ground!(c, m, null)).length, 0, 'nothing yet as it begins');
  watch(g, m, 1, undefined, () => m.act!.t >= SC_FLICK.warn[0]);
  const ring = colours((c) => FX!.ground!(c, m, null));
  assert.ok(ring.length > 10, 'the ring on the floor');
  // (the ink in the air: its arc over what stands, the ring closed under it)
  watch(g, m, 1, undefined, () => g.perils.some((q) => q.a1 === 'scribe:ink'));
  const p = g.perils.find((q) => q.a1 === 'scribe:ink')!;
  watch(g, m, 0.1);
  const flying = colours((c) => FX!.air!(c, null, p));
  assert.ok(flying.length > 3, 'the gob in its arc');
  assert.ok(colours((c) => FX!.ground!(c, null, p)).length > 10, 'the ring closed, under it');
  watch(g, m, 0.5);
  assert.equal(colours((c) => FX!.air!(c, null, p)).length, 0, 'landed: nothing in the air');
  const pool = colours((c) => FX!.ground!(c, null, p));
  assert.ok(pool.length > 50, 'the pool on the floor');
  for (const col of [...ring, ...flying, ...pool]) assert.ok(!cyanish(col), `nothing cyan (${col})`);
});

test('7. small: in packs on floors 11, 12 and 15; with the switch off, on none', () => {
  assert.equal(sizeOf('scribe'), 'small');
  const [lo, hi] = PACK_BY_SIZE.small;
  hush(() => {
    for (const d of [11, 12, 15]) {
      const rng = new RNG(d);
      let seen = 0;
      for (let k = 0; k < 600; k++) {
        const p = act2Pack(d, rng, 'normal');
        if (p.kind !== 'scribe') continue;
        seen++;
        assert.ok(p.size >= lo && p.size <= hi, `a pack of ${p.size}`);
      }
      assert.ok(seen > 10, `floor ${d} has them (${seen})`);
    }
  });
  assert.deepEqual(offTheFloors('scribe'), [], 'the switch off: nothing of it in the game');
});

test('8. a long fight on floor 11 with a pack of them: no exceptions, its flick made', () => {
  const { acts } = cityFight('scribe', 11, 40);
  assert.ok(acts.has('scribe:flick'), 'it flicked');
});
