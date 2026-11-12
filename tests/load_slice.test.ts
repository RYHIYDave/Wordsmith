// THE LOADING SCREEN'S WORK IN SLICES (main.ts LOAD_SLICE; the queue's smooth-the-loading-screens-long-frames): what the loading
// screen waits for, made a step at a time so that its ring goes on turning. Held here:
//   1. a part put by (engine/steps.ts Ahead) is taken once, made then where none was put by, and let go of with `clear`;
//   2. an effect's list made a frame a step (render/fx_lists.ts) is the very list made whole: the same frames, made by the same
//      calls in the same order, none made twice; asked for whole meanwhile, it is finished then;
//   3. THE CASTLE HALL made a part a step (art/castle_hall.ts castleHallSteps): every picture of its own pieces, tiles, pillar,
//      owl, the town's things in its stone and its waypoint the same, pixel for pixel, as the hall made at once; nothing left put by;
//   4. A FLOOR'S WAYS made a part a step (art/crypt.ts cryptWaySteps): its two stairwells and its waypoint the same, pixel for pixel;
//   5. FLOOR 1'S TWO STAIRWELLS a step each (art/floors.ts lookStairSteps): the same;
//   6. THE CHAPEL'S BREAK-IN a frame a step (art/chapel.ts chapelStretchSteps): the same;
//   7. AN ACT 1 FLOOR'S PIECES a list a step (render/act1_pieces.ts act1PieceSteps): the same pieces, by name, in the same order.
//   run: tsx --test tests/load_slice.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
import { Ahead } from '../src/engine/steps';
import type { LoadStep } from '../src/engine/steps';
import { FxLists } from '../src/render/fx_lists';
import type { Sprite } from '../src/engine/px';
import { castleHallSteps, forgetMade as forgetHall, hallPartsHeld, makeCastleHallArt } from '../src/art/castle_hall';
import { CRYPT_FLOORS, cryptWaySteps, cryptWays } from '../src/art/crypt';
import { makeStairwell, makeWaypointArt } from '../src/art/crypt_ways';
import { lookStairSteps, lookStairs } from '../src/art/floors';
import { tombStairwell, TOMB } from '../src/art/tomb';
import { chapelStretchSteps, forgetMade as forgetChapel, makeChapelArt } from '../src/art/chapel';
import { act1PieceSteps, act1Pieces, forgetAct1 } from '../src/render/act1_pieces';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const assert: Assert = nodeAssert;
const test: (name: string, fn: () => void) => void = nodeTest;

paintWithoutCanvas();

/** Every step done, as main.ts runSteps does them (one that gives back more has them done next); how many there were. */
function runAll(steps: LoadStep[]): number {
  const q = [...steps];
  let n = 0;
  while (q.length) {
    const more = q.shift()!();
    n++;
    if (more && more.length) q.unshift(...more);
  }
  return n;
}
/** The same picture: the same size, anchor and every pixel. */
function same(a: Sprite, b: Sprite, what: string, fresh = true): void {
  // (`fresh`: made again by the steps, not a picture kept by its own module and given both times)
  if (fresh) assert.ok(a !== b, `${what}: made again, not the same object`);
  assert.equal(a.w, b.w, `${what}: width`);
  assert.equal(a.h, b.h, `${what}: height`);
  assert.equal(a.ax, b.ax, `${what}: anchor x`);
  assert.equal(a.ay, b.ay, `${what}: anchor y`);
  const pa = paintingOf(a).d;
  const pb = paintingOf(b).d;
  assert.equal(pa.length, pb.length, `${what}: its painting's size`);
  let differ = 0;
  for (let i = 0; i < pa.length; i++) if (pa[i] !== pb[i]) differ++;
  assert.equal(differ, 0, `${what}: pixels unlike`);
}
function sameList(a: readonly Sprite[], b: readonly Sprite[], what: string): void {
  assert.equal(a.length, b.length, `${what}: frames`);
  for (let i = 0; i < a.length; i++) same(a[i], b[i], `${what} ${i}`);
}

test('1. a part put by is taken once, made where none was put by, and let go of with clear', () => {
  const A = new Ahead();
  let made = 0;
  const make = (): number => ++made;
  runAll([A.step('a', make)]);
  assert.equal(made, 1);
  assert.ok(A.has('a'));
  runAll([A.step('a', make)]);
  assert.equal(made, 1, 'a part put by already is not made again by its step');
  assert.equal(A.take('a', make), 1, 'taken: the one put by');
  assert.ok(!A.has('a'), 'taken once: not held after');
  assert.equal(A.take('a', make), 2, 'none put by: made then');
  runAll([A.step('b', make)]);
  A.clear();
  assert.ok(!A.has('b'), 'let go of with clear');
});

test('2. an effect list made a frame a step is the very list made whole, and is finished when asked for whole', () => {
  const calls: number[] = [];
  const paint = (i: number): Sprite => {
    calls.push(i);
    return { w: i + 1, h: 1, ax: 0, ay: 0, img: null } as unknown as Sprite;
  };
  const whole = new FxLists();
  const a = whole.loop('x', 5, paint);
  const wholeCalls = calls.splice(0);
  const ahead = new FxLists();
  const steps = ahead.steps([() => ahead.loop('x', 5, paint)]);
  assert.equal(runAll(steps), 5, 'five steps: a frame a step');
  assert.deepEqual(calls.splice(0), wholeCalls, 'the same frames painted, in the same order');
  assert.equal(ahead.state('x'), 'kept');
  const b = ahead.loop('x', 5, paint);
  assert.equal(calls.length, 0, 'none painted again');
  assert.deepEqual(b.map((s) => s.w), a.map((s) => s.w));
  // (begun ahead, then asked for whole by a draw: finished then, nothing painted twice)
  const half = new FxLists();
  const st = half.steps([() => half.loop('y', 4, paint)]);
  const q = [...st];
  for (let k = 0; k < 2; k++) {
    const more = q.shift()!();
    if (more && more.length) q.unshift(...more);
  }
  assert.equal(half.state('y'), 'begun');
  const c = half.loop('y', 4, paint);
  assert.deepEqual(calls.splice(0), [0, 1, 2, 3], 'each frame painted once');
  assert.equal(c.length, 4);
  assert.equal(half.state('y'), 'kept');
  runAll(q);
  assert.equal(calls.length, 0, 'its steps left find it kept');
});

test('3. the castle hall made a part a step: every picture the same as the hall made at once, nothing left put by', () => {
  forgetHall();
  const A = makeCastleHallArt();
  const town = A.town;
  const way = A.way;
  forgetHall();
  const n = runAll(castleHallSteps());
  assert.ok(n > 40, `made in many steps (${n})`);
  const B = makeCastleHallArt();
  assert.ok(B.townMade() && B.wayMade(), 'its town and waypoint made by the steps');
  assert.equal(B.pieces.length, A.pieces.length);
  for (let i = 0; i < A.pieces.length; i++) {
    assert.equal(B.pieces[i].name, A.pieces[i].name);
    sameList(B.pieces[i].frames ?? [], A.pieces[i].frames ?? [], A.pieces[i].name);
  }
  for (let i = 0; i < A.tiles.length; i++) sameList(B.tiles[i].frames ?? [], A.tiles[i].frames ?? [], A.tiles[i].name);
  same(B.gate.pillar as unknown as Sprite, A.gate.pillar as unknown as Sprite, 'the gate pillar');
  assert.equal(B.owl.frames, A.owl.frames, "the owl's frames, kept once made (art/hall_owl.ts)");
  const T = B.town;
  for (const k of ['forge', 'runeSlab', 'runeRing', 'lexicon'] as const) sameList(T[k], town[k], `the town's ${k}`);
  for (const k of ['anvil', 'rack', 'trough', 'tentBack', 'tentTable', 'rug', 'stash'] as const) same(T[k], town[k], `the town's ${k}`);
  T.runeStone.forEach((q, v) => {
    same(q.dim, town.runeStone[v].dim, `rune stone ${v} dim`);
    same(q.alight, town.runeStone[v].alight, `rune stone ${v} alight`);
  });
  if (town.ring3) {
    const r = T.ring3!;
    const o = town.ring3;
    r.stones.forEach((ways, v) => ways.forEach((list, b) => sameList(list, o.stones[v][b], `the ring's stone ${v}, blaze ${b}`)));
    for (const k of ['floor', 'slabSet', 'slabRunes', 'slab', 'fuse'] as const) sameList(r[k], o[k], `the ring's ${k}`);
    for (const k of ['floorDark', 'slabEmpty'] as const) same(r[k], o[k], `the ring's ${k}`);
  }
  same(B.way.asleep, way.asleep, 'the waypoint asleep');
  sameList(B.way.awake, way.awake, 'the waypoint awake');
  sameList(B.way.motes, way.motes, "the waypoint's motes");
  sameList(B.way.warp, way.warp, "the waypoint's warp");
  // (nothing left put by: every part made ahead was taken; made, its steps make nothing)
  assert.equal(hallPartsHeld(), 0, 'every part made ahead was taken');
  runAll(castleHallSteps());
  assert.equal(hallPartsHeld(), 0, 'made: its steps put nothing by');
  forgetHall();
});

test("4. a floor's ways made a part a step: its stairwells and waypoint the same", () => {
  for (const k of [2, 3]) {
    const theme = CRYPT_FLOORS[k - 1];
    const direct = { x: makeStairwell(theme, 'x'), y: makeStairwell(theme, 'y'), way: makeWaypointArt(theme) };
    const n = runAll(cryptWaySteps(k));
    assert.ok(n > 10, `floor look ${k} in ${n} steps`);
    const w = cryptWays(k);
    same(w.stair.x, direct.x, `look ${k} stairwell x`);
    same(w.stair.y, direct.y, `look ${k} stairwell y`);
    same(w.way.asleep, direct.way.asleep, `look ${k} waypoint asleep`);
    sameList(w.way.awake, direct.way.awake, `look ${k} waypoint awake`);
    sameList(w.way.warp, direct.way.warp, `look ${k} warp`);
    assert.equal(cryptWaySteps(k).length, 0, 'made: no steps left');
  }
});

test("5. floor 1's two stairwells, a step each: the same", () => {
  if (!TOMB.on) return;
  const x = tombStairwell('x');
  const y = tombStairwell('y');
  runAll(lookStairSteps(1));
  const s = lookStairs(1);
  same(s.x, x, "floor 1's stairwell x");
  same(s.y, y, "floor 1's stairwell y");
  assert.equal(lookStairSteps(1).length, 0, 'made: no steps left');
});

test("6. the chapel's break-in, a frame a step: the same", () => {
  forgetChapel();
  const direct = makeChapelArt().breakIn(true).frames;
  forgetChapel();
  runAll(chapelStretchSteps(true, false));
  sameList(makeChapelArt().breakIn(true).frames, direct, "the chapel's break-in along x");
  forgetChapel();
});

test("7. an Act 1 floor's pieces, a list a step: the same pieces, by name, in the same order", () => {
  for (const n of [7]) {
    forgetAct1(-1);
    const direct = [...act1Pieces(n).values()];
    forgetAct1(-1);
    const steps = act1PieceSteps(n);
    assert.ok(steps.length >= 4, `floor ${n} in ${steps.length} steps`);
    runAll(steps);
    const made = [...act1Pieces(n).values()];
    assert.deepEqual(made.map((p) => p.name), direct.map((p) => p.name), `floor ${n}: its pieces`);
    for (let i = 0; i < made.length; i++) {
      const a = made[i].frames?.[0];
      const b = direct[i].frames?.[0];
      // (some lists are kept by their own modules, art/floor6.ts and the rest: then the very picture both times)
      if (a && b) same(a, b, `floor ${n}: ${made[i].name}, its first frame`, false);
    }
    assert.equal(act1PieceSteps(n).length, 0, 'made: no steps left');
    forgetAct1(-1);
  }
});
