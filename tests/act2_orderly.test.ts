// ACT 2, THE HUSH: FLOOR 14'S ORDERLIES IN THE GAME (game/act1_rules/orderly.ts; their pictures art/act1_figs/orderly.ts, the art
// chat's art/orderlies.ts and orderlies_moves.ts; the mark of their blow, render/act1_fx/orderly.ts, the art's orderly_shots.ts).
//
//   1. they are built: their rules, their pictures with the clips their acts name (both ways they are seen), what they draw;
//   2. their numbers are their pictures' own (their pace and trudge, the mallet blow's length and moments, where its head goes
//      into the floor), and their size as the game goes by it;
//   3. the mallet blow lands at its moment on a hero under it, before them as far as its head goes in, and knocks him back;
//      not on one beside them, behind them or beyond it;
//   4. its mark lies on the floor where it went in, as long as the art's cracks, and is drawn there; nothing cyan;
//   5. medium: their packs of three to five on floor 14, the lair's guardians there, with the Hush on; never with it off;
//   6. a pack of them in a long fight: no exceptions.
//   run: tsx --test tests/act2_orderly.test.ts

// @ts-ignore
import { test as nodeTest } from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FIGURE_SIZE, makeBestiary } from '../src/art/bestiary';
import { GRAIN } from '../src/art/kit';
import { TILE3, skeletonAt } from '../src/art/new_mobs3';
import { ORDERLIES_ON, malletOf } from '../src/art/orderlies';
import { ORDERLY as ORDERLY_MOB, OD_BLOW, OD_PACE, OD_WALK } from '../src/art/orderlies_moves';
import { SLAM_CRACKS_FOR } from '../src/art/orderly_shots';
import { FIG } from '../src/art/act1_figs/orderly';
import { act1Fig } from '../src/art/act1_figs/index';
import { RNG } from '../src/engine/rng';
import { ACT2 } from '../src/game/act1';
import { ACT2_GUARD, act2Pack, act2Ready } from '../src/game/act2_mobs';
import { ORDERLY, ORDERLY_ACTS, ORDERLY_GAIT, RULES, slamSpot } from '../src/game/act1_rules/orderly';
import { act1Rules } from '../src/game/act1_rules/index';
import { actsOf, gaitOf } from '../src/game/bosses';
import { MONSTERS, PACK_BY_SIZE, sizeOf } from '../src/game/defs';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { FX } from '../src/render/act1_fx/orderly';
import { act1Fx } from '../src/render/act1_fx/index';
import { cyanIn, fakeCtx, fakeDocument, firstHurt, room, watch } from './act1_kinds_room';
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

const blow = ORDERLY_ACTS[0];

test('1. they are built: their rules, their pictures with the clips their acts name, what they draw', () => {
  assert.ok(act1Rules('orderly') === RULES && RULES, 'their rules');
  assert.ok(act2Ready('orderly'), 'in the game with the Hush: no longer stood in for');
  assert.ok(act1Fx('orderly') === FX && FX, 'what they draw');
  assert.ok(act1Fig('orderly') === FIG && FIG, 'their pictures');
  assert.ok(FIG!.switches!.includes(ORDERLIES_ON), "the art chat's switch for them");
  const art = FIG!.make();
  for (const set of [art.front, art.back]) {
    const clip = set.clips!.attack!;
    assert.ok(clip.frames.length > 0, 'the mallet blow');
    near((clip.frames.length - 1) / clip.fps, blow.long, 0.05, 'its clip as long as the act');
    near(clip.hit!, blow.hit, 1e-9, "its clip's blow is the act's");
    assert.ok(set.clips?.reel && set.clips.die, 'struck, and their death');
  }
  const { m } = room('orderly', 3);
  assert.ok(gaitOf(m.kind) === ORDERLY_GAIT && actsOf(m) === ORDERLY_ACTS, 'run by their rules');
  // (his rule gives a medium monster two attacks; the art drew them one: the second is not made here, the planning chat's to ask for)
  assert.equal(ORDERLY_ACTS.length, 1, 'one attack, the one the art drew');
});

test("2. their numbers are their pictures' own, and their size as the game goes by it", () => {
  const G = ORDERLY_GAIT;
  assert.equal(G.pace, OD_PACE, 'the pace their trudge is painted for');
  assert.equal(MONSTERS.orderly.speed, OD_PACE, 'and they go at it: their feet do not slide');
  near(G.cycle, 1 / OD_WALK.fps, 1e-9, 'they stop at any frame of it, as their pictures hand over from any');
  assert.equal(G.trueBack, !!ORDERLY_MOB.trueBack);
  const keys = ORDERLY_MOB.attack.motion.keys;
  near(blow.long, keys[keys.length - 1].at, 1e-9, 'the blow is as long as its picture');
  assert.equal(blow.hit, OD_BLOW.hit, 'and lands at its moment');
  assert.equal(ORDERLY.blow.hit, OD_BLOW.hit);
  assert.equal(ORDERLY.blow.floor, OD_BLOW.floor, 'in the floor at its moment');
  assert.equal(MONSTERS.orderly.windup, OD_BLOW.hit, "their blow's moment");
  // (where its head goes into the floor: art/orderlies.ts malletOf, at 27/30)
  const k = malletOf(skeletonAt(ORDERLY_MOB, 'attack', OD_BLOW.floor));
  near(ORDERLY.blow.at[0], k.head[0] / TILE3, 0.002, 'its head goes in before them');
  near(ORDERLY.blow.at[1], k.head[1] / TILE3, 0.002, 'a little to their right, the mallet in their right hand');
  assert.ok(Math.min(k.faceA[2], k.faceB[2]) < 2, 'down on the boards then');
  near(ORDERLY.blow.at[0], 1.4, 0.1, '"its head about 1.4 tiles before them" (the art chat)');
  assert.equal(ORDERLY.blow.mark, SLAM_CRACKS_FOR, 'its mark lies as long as its cracks');
  assert.ok(G.stopAt < blow.far && blow.far <= ORDERLY.blow.at[0] + ORDERLY.blow.r + 0.2, 'they stop within its reach, and strike from no further');
  const art = makeBestiary();
  const size = FIGURE_SIZE.orderly;
  assert.deepEqual(size, FIG!.size, 'the game goes by their own');
  const sp = art.of('orderly').front.idle[0];
  const p = paintingOf(sp);
  const ax = Math.round(sp.ax * GRAIN);
  const ay = Math.round(sp.ay * GRAIN);
  let head = 0;
  for (let y = 0; y < p.h && head === 0; y++) for (let x = ax - 3; x <= ax + 3; x++) if (p.has(x, y)) head = (ay - y) / GRAIN;
  assert.ok(Math.abs(size.top - head) <= 4, `the game takes their top to be ${size.top} up; in the picture it is ${head}`);
  const reach = Math.max(sp.ax, sp.w - sp.ax);
  assert.ok(size.half <= reach + 1 && size.half >= reach * 0.4, `${size.half} to either side; the picture reaches ${reach}`);
});

test('3. the mallet blow lands at its moment on a hero under it, and knocks him back; not beside, behind or beyond', () => {
  for (const D of [1.0, 1.45]) {
    const { g, m } = room('orderly', D, 'orderly:blow');
    let knocked = false;
    const s = watch(g, m, 2.4, () => {
      if (g.hero.step) knocked = true;
      return null;
    });
    assert.ok(s.began >= 0 && s.began < 0.05, `it strikes at once at ${D} tiles`);
    assert.equal(s.hurts.length, 1, 'once');
    near(firstHurt(s) - s.began, blow.hit, 0.04, 'as it comes down over the top');
    assert.ok(knocked, 'and he is knocked back');
    assert.ok(s.events.some((e) => e.t === 'shake'), 'the floor shakes as it goes in');
  }
  for (const [dx, dy, what] of [[0.6, 1.3, 'beside them'], [-1.2, 0, 'behind them'], [2.6, 0, 'beyond where it goes in']] as const) {
    const { g, m } = room('orderly', 1.2, 'orderly:blow');
    g.bosses.startAct(m, ORDERLY_ACTS, 0);
    g.hero.x = m.x + dx;
    g.hero.y = m.y + dy;
    assert.equal(watch(g, m, 2.2).hurts.length, 0, `${what}, it misses`);
  }
  {
    // (stepped aside, up the floor, during its warning)
    const { g, m } = room('orderly', 1.3, 'orderly:blow');
    const s = watch(g, m, 2.2, (t) => (t > 0.05 && t < 0.75 ? { mx: 0, my: -1 } : null));
    assert.equal(s.hurts.length, 0, 'stepped aside in time, it misses');
  }
});

test('4. its mark lies where it went in, as long as the art\'s cracks, and is drawn there; nothing cyan', () => {
  const { g, m } = room('orderly', 1.3, 'orderly:blow');
  const want = slamSpot({ x: m.x, y: m.y, fx: 1, fy: 0 }, 1);
  watch(g, m, 1.0);
  const mark = g.perils.find((p) => p.a1 === 'orderly:slam');
  assert.ok(mark, 'its mark on the floor');
  near(mark!.x, want.x, 0.05, 'where its head went in');
  near(mark!.y, want.y, 0.05, 'where its head went in');
  assert.equal(mark!.dur, SLAM_CRACKS_FOR, 'as long as its cracks');
  // (drawn through a canvas that keeps its colours)
  const colours = new Set<string>();
  let put = 0;
  const ctx = new Proxy({} as Record<string, unknown>, {
    get: (o, k) => (k in o ? o[k as string] : k === 'fillRect' ? () => void put++ : () => undefined),
    set: (o, k, v) => {
      if (k === 'fillStyle') colours.add(String(v));
      o[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  const { c } = fakeCtx(g);
  FX!.ground!({ ...c, g: ctx }, null, mark!);
  assert.ok(put > 20, 'drawn');
  for (const col of colours) {
    const v = col.replace('#', '');
    const r = parseInt(v.slice(0, 2), 16);
    const gg = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    assert.ok(!(b > r + 30 && gg > r + 30), `nothing cyan: ${col}`);
  }
  watch(g, m, 1.8);
  assert.ok(!g.perils.includes(mark!), 'and gone at its end');
  const art = FIG!.make();
  for (const set of [art.front, art.back]) for (const sp of [set.idle[0], set.walk[3], set.clips!.attack!.frames[12], set.clips!.attack!.frames[27], set.clips!.reel!.frames[4]]) assert.equal(cyanIn(sp), 0, 'nothing cyan on them');
});

test('5. medium: their packs of three to five on floor 14, the lair\'s guardians there, with the Hush on; never with it off', () => {
  assert.equal(sizeOf('orderly'), 'medium');
  assert.equal(MONSTERS.orderly.minDepth, 99, 'never drawn for a pack of the old floors');
  assert.equal(ACT2_GUARD[14], 'orderly', "floor 14's guardian");
  const was = ACT2.on;
  ACT2.on = true;
  try {
    const rng = new RNG(6);
    let seen = 0;
    for (let i = 0; i < 400; i++) {
      const p = act2Pack(14, rng, 'normal');
      if (p.kind !== 'orderly') continue;
      seen++;
      assert.ok(p.size >= PACK_BY_SIZE.medium[0] && p.size <= PACK_BY_SIZE.medium[1], `a pack of ${p.size}`);
    }
    assert.ok(seen > 60, `floor 14 has them (${seen} of 400)`);
    assert.equal(act2Pack(14, rng, 'champion').kind, 'orderly', 'its lair is theirs');
  } finally {
    ACT2.on = was;
  }
});

test('6. a pack of them in a long fight: no exceptions', () => {
  const { g, m } = room('orderly', 3);
  for (let i = 0; i < 3; i++) g.spawn('orderly', m.x - 0.8 * i, m.y + (i % 2 ? 1 : -1), -2, 0, false, new RNG(30 + i));
  for (const o of g.monsters) (g as unknown as { wakeUp(m: Monster): void }).wakeUp(o);
  const s = watch(g, m, 30, (t) => (t < 10 ? null : { mx: Math.cos(t * 0.9), my: Math.sin(t * 1.3) }));
  assert.ok(s.hurts.length > 3, `they strike him (${s.hurts.length})`);
  void emptyControls;
});
