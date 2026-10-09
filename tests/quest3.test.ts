// Tests for THE MASTER RUNE-STONE AND THE RING POWERING UP (art/quest3.ts, with art/ring3.ts and
// art/townscene.ts: a mock-up behind a switch that is off; the art chat, 8 and 9 Oct 2026). The
// owner, to the main chat (as it posted his words on the board), 20:39: "I'd like the fallen
// wordsmith to drop a quest item that you give to the wordsmith in town to unlock the ability to
// wordsmith."; 20:41: "And I'd like the quest item to power up the runes around the wordsmith.  Like
// a battery being put in.  These animations should go to the art team". In the art chat, asked
// what it should be: "A master rune-stone". To its pictures: "Yes, keep it (Recommended)"; to the
// ring powering up, "Looks great except for the hole in the table.  Just a big black hole?"; and
// by 00:01 on 9 Oct, to the hollow carved: "Yes, keep it (Recommended)".
//   run: tsx --test tests/quest3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CYAN } from '../src/art/kit';
import { VAULT } from '../src/art/ground';
import { POWER, QUEST3, SLATE, catchesAt, floatingOf, fuseOf, makeStoneArt, paintHollow, paintStone, roundFromSlab, slabRunesOf } from '../src/art/quest3';
import { SLAB_AT, STONE_AT } from '../src/art/ring3';
import type { Ring3Art } from '../src/art/ring3';
import { SMITH3, darkOf } from '../src/art/smith3';
import { makeTownProps } from '../src/art/town';
import { columnSprite, ringPower, smithAct, swirlNow, townSprite } from '../src/art/townscene';
import type { TownArt } from '../src/art/townscene';
import { makeTownsfolk } from '../src/art/townsfolk';
import { Px } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { TOWN } from '../src/game/level';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

/** The switches as they are in the game: both off, the stone not given. */
const reset = (): void => {
  SMITH3.on = false;
  Object.assign(QUEST3, { on: false, dark: true, givenAt: -1, stone: 'lying', takenAt: -1, carried: false });
};

/** The town with the wordsmith and his ring made new, and the stone's switch on: for a test, then both off again. */
const withRing = (fn: (art: TownArt, r: Ring3Art) => void): void => {
  SMITH3.on = true;
  const art: TownArt = { town: makeTownProps(VAULT), folk: makeTownsfolk() };
  try {
    const r = art.town.ring3;
    assert.ok(r !== undefined, 'the new ring painted');
    QUEST3.on = true;
    fn(art, r as Ring3Art);
  } finally {
    // (he is turned to no one again, as the town remembers who he was last turned to)
    townSprite(art, 'wordsmith', 0, 0, null);
    reset();
  }
};

/** Which of a list of frames a sprite is, or -1. */
const which = (frames: ReadonlyArray<Sprite>, s: Sprite | null): number => (s === null ? -1 : frames.indexOf(s));

const hex = (p: Px, i: number): string => '#' + [p.d[i], p.d[i + 1], p.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
const light = (c: string): number => {
  const v = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};

test('the switch is off: the ring burns as it always has, and nothing of the stone shows', () => {
  reset();
  assert.equal(QUEST3.on, false);
  assert.equal(ringPower(0), null, 'no power-up to follow');
  SMITH3.on = true;
  try {
    const art: TownArt = { town: makeTownProps(VAULT), folk: makeTownsfolk() };
    const r = art.town.ring3 as Ring3Art;
    for (const t of [0, 3.3, 7.9]) {
      assert.ok(which(r.floor, townSprite(art, 'runeRing', 0, t)) >= 0, `${t}: the circle burning`);
      // (the slab he said yes to with the wordsmith: the town's own, with no hollow and no stone)
      assert.ok(which(art.town.runeSlab, townSprite(art, 'runeSlab', 0, t)) >= 0, `${t}: the town's own slab`);
      assert.ok(columnSprite(art, t) !== null, `${t}: the column`);
      assert.equal(swirlNow(art, t).length, 14, `${t}: the letters`);
      const smith = townSprite(art, 'wordsmith', 0, t, null);
      assert.ok(smith !== null && which(darkOf(art.folk.wordsmith).idle, smith) < 0, `${t}: his runes burning`);
    }
  } finally {
    reset();
  }
});

test('the ring\'s stones and slab, as the town has them', () => {
  const ring = TOWN.wordsmith;
  assert.deepEqual(STONE_AT.map((a) => [...a]), TOWN.runeStones.map((a) => [...a]), 'the six stones, by their variant');
  assert.deepEqual([...SLAB_AT], [TOWN.runeSlab.x - ring.x, TOWN.runeSlab.y - ring.y], 'the slab');
  // (the light starts from the slab's side of the circle, and the far side of it is half way round)
  assert.equal(roundFromSlab(SLAB_AT[0], SLAB_AT[1]), 0);
  assert.ok(Math.abs(roundFromSlab(-SLAB_AT[0], -SLAB_AT[1]) - 1) < 1e-9);
});

test('given, the stone rises out of the hero, floats over, lies down and is laid in; then its rune, the slab\'s runes, the circle, and the flare, in that order', () => {
  const order = [0, POWER.risen, POWER.over, POWER.lain, POWER.set, POWER.lit, POWER.slab, POWER.round, POWER.done];
  for (let i = 1; i < order.length; i++) assert.ok(order[i] > order[i - 1], `step ${i} after step ${i - 1}`);
  assert.ok(POWER.flare >= POWER.round && POWER.flare < POWER.done, 'it flares when the light has gone all round');
  const hero: [number, number] = [11, 15.2];
  const slab: [number, number] = [9.5, 15.5];
  assert.equal(floatingOf(-0.1, hero, slab, 11), null, 'not before it is given');
  const first = floatingOf(0, hero, slab, 11);
  assert.ok(first !== null && first.x === hero[0] && first.y === hero[1] && first.lie === 0, 'out of the hero, standing');
  const last = floatingOf(POWER.set - 1e-6, hero, slab, 11);
  assert.ok(last !== null && last.x === slab[0] && last.y === slab[1] && Math.abs(last.z - 11) < 1e-3 && last.lie === 90, 'down on the slab\'s top, lying on its back');
  assert.equal(floatingOf(POWER.set, hero, slab, 11), null, 'then in the slab, not in the air');
  let runes = 0;
  let fuse = 0;
  for (let g = 0; g <= POWER.done + 0.5; g += 0.01) {
    const n = slabRunesOf(g);
    const f = fuseOf(g);
    assert.ok(n >= runes && f >= fuse, `${g.toFixed(2)}: nothing goes out again`);
    if (g < POWER.lit) assert.equal(n, 0);
    if (g <= POWER.slab) assert.equal(f, 0, `${g.toFixed(2)}: the light not yet out of the slab`);
    runes = n;
    fuse = f;
  }
  assert.equal(slabRunesOf(POWER.slab), 4, 'the slab\'s four runes alight before the light leaves it');
  assert.equal(fuseOf(POWER.round), 1, 'and the light all round');
});

test('each standing stone catches as the light running round the circle reaches it: the nearest the slab first', () => {
  const by = STONE_AT.map(([dx, dy], v) => ({ v, at: catchesAt(dx, dy), far: Math.hypot(dx - SLAB_AT[0], dy - SLAB_AT[1]) }));
  for (const s of by) assert.ok(s.at >= POWER.slab && s.at <= POWER.round, `stone ${s.v} catches while the light runs round`);
  const sorted = [...by].sort((a, b) => a.at - b.at);
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].far >= sorted[i - 1].far - 1e-9, `stone ${sorted[i].v} is no nearer the slab than stone ${sorted[i - 1].v}, which caught before it`);
});

test('dark: the circle, the stones and his runes cold, the slab\'s hollow empty, no column and no letters, and he does not work', () => {
  withRing((art, r) => {
    QUEST3.dark = true;
    const m = art.folk.wordsmith;
    const cold = darkOf(m);
    assert.equal(darkOf(m), cold, 'painted once');
    assert.equal(cold.idle.length, m.idle.length);
    assert.equal(cold.act.length, 0, 'cold, he has no work to do');
    for (let t = 0; t < 30; t += 0.37) {
      assert.equal(townSprite(art, 'runeRing', 0, t), r.floorDark, `${t.toFixed(2)}: the circle dark`);
      assert.equal(townSprite(art, 'runeSlab', 0, t), r.slabEmpty, `${t.toFixed(2)}: the hollow empty`);
      for (let v = 0; v < 6; v++) assert.ok(which(r.stones[v][0], townSprite(art, 'runeStone', v, t)) >= 0, `${t.toFixed(2)}: stone ${v} cold`);
      assert.ok(which(cold.idle, townSprite(art, 'wordsmith', 0, t, null)) >= 0, `${t.toFixed(2)}: his runes cold`);
      assert.equal(columnSprite(art, t), null);
      assert.equal(swirlNow(art, t).length, 0);
      assert.equal(smithAct(art, t), -1);
    }
  });
});

test('powering up: the stone laid in, its rune and the slab\'s runes catching, the light running round, each stone catching as it comes, then the ring he said yes to', () => {
  withRing((art, r) => {
    const T0 = 100;
    QUEST3.givenAt = T0;
    const m = art.folk.wordsmith;
    const at = (g: number, kind: string, v = 0): Sprite | null => townSprite(art, kind, v, T0 + g, null);
    assert.equal(at(POWER.set - 0.05, 'runeSlab'), r.slabEmpty, 'the hollow empty until the stone is in it');
    assert.ok(which(r.slabSet, at(POWER.set + 0.05, 'runeSlab')) >= 0, 'then the stone in it');
    assert.equal(which(r.slabSet, at(POWER.set + 0.01, 'runeSlab')), 0, 'its rune cold as it goes in ...');
    assert.equal(which(r.slabSet, at(POWER.lit - 0.01, 'runeSlab')), r.slabSet.length - 1, '... and alight by `lit`');
    assert.equal(which(r.slabRunes, at(POWER.lit + 0.01, 'runeSlab')), -1, 'none of the slab\'s runes alight as the stone\'s catches');
    assert.equal(which(r.slabRunes, at(POWER.slab - 0.01, 'runeSlab')), 2, 'they catch one by one: three alight ...');
    assert.ok(which(r.slab, at(POWER.slab + 0.01, 'runeSlab')) >= 0, '... and the fourth as the slab begins to burn');
    assert.equal(at(POWER.slab - 0.01, 'runeRing'), r.floorDark, 'the circle dark until the light leaves the slab');
    for (let g = POWER.slab + 0.02; g < POWER.round; g += 0.1) assert.ok(which(r.fuse, at(g, 'runeRing')) >= 0, `${g.toFixed(2)}: the light running round`);
    STONE_AT.forEach(([dx, dy], v) => {
      const c = catchesAt(dx, dy);
      assert.ok(which(r.stones[v][0], at(c - 0.02, 'runeStone', v)) >= 0, `stone ${v} cold until the light reaches it`);
      assert.ok(which(r.stones[v][3], at(c + 0.02, 'runeStone', v)) >= 0, `stone ${v} blazes as it catches`);
      assert.ok(which(r.stones[v][3], at(POWER.flare + 0.1, 'runeStone', v)) >= 0, `stone ${v} flares with the rest`);
    });
    // (his runes stay cold until it flares; the column and the letters come with the flare)
    assert.ok(which(darkOf(m).idle, at(POWER.flare - 0.05, 'wordsmith')) >= 0);
    assert.ok(which(darkOf(m).idle, at(POWER.flare + 0.05, 'wordsmith')) < 0, 'his runes catch fire');
    assert.equal(columnSprite(art, T0 + POWER.flare - 0.05), null);
    assert.ok(which(r.columnRising, columnSprite(art, T0 + POWER.flare + 0.1)?.s ?? null) >= 0, 'the column rising');
    assert.equal(swirlNow(art, T0 + POWER.flare - 0.05).length, 0);
    assert.equal(swirlNow(art, T0 + POWER.flare + 0.05).length, 14, 'the letters bursting out');
    // (and after: as the ring always burns, and he goes back to his work)
    let worked = false;
    for (let g = POWER.done + 0.01; g < POWER.done + 30; g += 0.25) {
      assert.ok(which(r.floor, at(g, 'runeRing')) >= 0);
      assert.ok(which(r.slab, at(g, 'runeSlab')) >= 0);
      if (smithAct(art, T0 + g) >= 0) worked = true;
    }
    assert.ok(worked, 'at his work again');
  });
});

test('the hollow in the slab: cut in the slab\'s own stone, the great rune\'s print in its floor, and covered by the stone when it is laid in', () => {
  // (painted on a top of one colour, as the slab's is, where the slab lays the stone)
  const TOP = '#7d79bb';
  const tone = { floor: '#000001', crease: '#000002', print: '#000003', lit: '#000004', mid: '#000005', shade: '#000006' };
  const p = new Px(68, 76);
  p.rect(0, 0, 68, 76, TOP);
  paintHollow(p, 34, 40, -45, 90, tone);
  const stone = new Px(68, 76);
  paintStone(stone, new Px(68, 76), 34, 40, -45, 90, 0);
  const used = new Set<string>();
  for (let y = 0; y < 76; y++) {
    for (let x = 0; x < 68; x++) {
      const c = p.get(x, y);
      if (c === TOP) continue;
      used.add(c as string);
      assert.ok(Object.values(tone).includes(c as string), `(${x}, ${y}) in one of the hollow's own colours`);
      assert.ok(stone.has(x, y), `(${x}, ${y}): under the stone when it is laid in`);
    }
  }
  for (const k of ['floor', 'print', 'lit', 'shade'] as const) assert.ok(used.has(tone[k]), `its ${k}`);
  // (and in the town's slab: nothing in the hollow darker than the slab's own side in shade, so no black hole)
  SMITH3.on = true;
  try {
    const ring = makeTownProps(VAULT).ring3 as Ring3Art;
    const empty = paintingOf(ring.slabEmpty);
    const set = paintingOf(ring.slabSet[0]);
    assert.ok(empty.w === set.w && empty.h === set.h && ring.slabEmpty.ax === ring.slabSet[0].ax && ring.slabEmpty.ay === ring.slabSet[0].ay, 'the same slab, in the same place');
    const darkest = light(VAULT.shade[2]);
    let hollow = 0;
    for (let i = 0; i < empty.d.length; i += 4) {
      if (empty.d[i + 3] === 0 || set.d[i + 3] === 0) continue;
      if (hex(empty, i) === hex(set, i)) continue;
      hollow++;
      assert.ok(light(hex(empty, i)) >= darkest - 1e-9, `in the hollow, ${hex(empty, i)} is no darker than the slab's shaded side`);
    }
    assert.ok(hollow > 150, `a hollow the stone's size (${hollow} pixels)`);
  } finally {
    reset();
  }
});

test('the stone\'s own pictures: lying and throbbing, standing, laid back step by step, carried, and its burst of light; all its light the friend\'s cyan', () => {
  const q = makeStoneArt();
  assert.equal(q.lying.length, 8);
  assert.equal(q.standing.length, 12);
  assert.equal(q.laying.length, 6);
  // (laid back step by step: standing, it is taller than it is wide; on its back, wider than it is tall)
  const tall = (s: Sprite): number => {
    const b = paintingOf(s).bounds();
    return b ? b.h / b.w : 0;
  };
  assert.ok(tall(q.laying[0]) > 1 && tall(q.laying[q.laying.length - 1]) < 1);
  // (what glows is the friend's cyan, white at its heart: the rulebook; the rest is its slate)
  const allowed = new Set([...SLATE, CYAN[2], CYAN[3], '#ffffff'].map((c) => c.toLowerCase()));
  for (const s of [...q.lying, ...q.standing, ...q.laying, q.icon, q.flash]) {
    const p = paintingOf(s);
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3] !== 0) assert.ok(allowed.has(hex(p, i)), `${hex(p, i)} in the stone`);
    for (const l of s.lights ?? []) assert.equal(l.color, CYAN[2], 'its light cyan');
  }
});
