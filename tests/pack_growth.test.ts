// PACKS GROW WITH THE LEVELS (game/defs.ts PACK_GROWTH, Game.fillPack; since Version 23.5). His words to the main chat,
// 20 Oct 2026, 21:31 Pacific: “And we need pack size to scale up with levels as well”; asked as a pop-up, by 21:38, where:
// “Every floor, on into endless (Recommended)”, and how fast: “5% each level (Recommended)” (offered as: floor 15 packs
// about 70% bigger, double by Endless 6, then held at double so phones keep up).
//   1. the switch is on, the numbers his: 5% bigger each level past the first, held at double;
//   2. on the floors: every pack as many times as big as its level has them (rounded up or down), the first floor as it was;
//      off, every pack as before;
//   3. on an endless level, by its power: bigger than the floor it is would have them.
//   run: tsx --test tests/pack_growth.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { PACK_GROWTH, packGrowth } from '../src/game/defs';
import { ENDLESS, endlessPower } from '../src/game/endless';
import { lastFloor } from '../src/game/act1';
import { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { seasoned } from './helpers';

const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b}`);

/** Dungeon `depth` of a character who has been down before. */
function dungeon(seed: number, depth: number): Game {
  const g = seasoned(new Game('warrior', seed), 1);
  g.depth = depth;
  g.cleared = depth;
  g.enterDungeon();
  return g;
}

/** The monsters of each of the floor's packs (the boss and the like left out). */
function packsOf(g: Game): Map<number, Monster[]> {
  const out = new Map<number, Monster[]>();
  for (const m of g.monsters) {
    if (m.boss || m.packId < 0 || m.packId >= g.level.floor.packs.length) continue;
    const list = out.get(m.packId) ?? [];
    list.push(m);
    out.set(m.packId, list);
  }
  return out;
}

function growing<T>(on: boolean, fn: () => T): T {
  const was = PACK_GROWTH.on;
  PACK_GROWTH.on = on;
  try {
    return fn();
  } finally {
    PACK_GROWTH.on = was;
  }
}

const total = (g: Game): number => [...packsOf(g).values()].reduce((s, ms) => s + ms.length, 0);

test('1. the switch is on, the numbers his: 5% bigger each level past the first, held at double', () => {
  assert.equal(PACK_GROWTH.on, true);
  assert.equal(PACK_GROWTH.each, 0.05);
  assert.equal(PACK_GROWTH.most, 2);
  near(packGrowth(1), 1, 1e-9, 'the first floor as it was');
  near(packGrowth(2), 1.05, 1e-9, 'floor 2');
  near(packGrowth(15), 1.7, 1e-9, 'floor 15 about 70% bigger');
  near(packGrowth(endlessPower(6)), 2, 1e-9, 'double by Endless 6');
  near(packGrowth(endlessPower(5)), 1.95, 1e-9, 'Endless 5 a little short of it');
  near(packGrowth(endlessPower(40)), 2, 1e-9, 'and held there');
  growing(false, () => near(packGrowth(15), 1, 1e-9, 'off: as before'));
});

test('2. on the floors, every pack as many times as big as its level has them; the first floor as it was; off, as before', () => {
  for (const depth of [1, 2, 6, 9, 12, 15]) {
    for (const seed of [3, 11]) {
      const was = growing(false, () => dungeon(seed * 13 + depth, depth));
      const now = dungeon(seed * 13 + depth, depth);
      const G = packGrowth(depth);
      const packs = now.level.floor.packs;
      assert.equal(packs.length, was.level.floor.packs.length, `floor ${depth}: the same packs where they were`);
      const a = packsOf(was);
      for (const [id, ms] of packsOf(now)) {
        const p = packs[id];
        const before = a.get(id)?.length ?? 0;
        assert.ok(ms.length <= Math.ceil(p.size * G), `floor ${depth}, pack ${id}: ${ms.length}, of ${p.size}, no more than ${G.toFixed(2)} times`);
        assert.ok(ms.length >= before || depth === 1, `floor ${depth}, pack ${id}: no smaller`);
      }
      const ratio = total(now) / Math.max(1, total(was));
      if (depth === 1) assert.equal(total(now), total(was), 'the first floor as it was');
      else assert.ok(ratio >= G * 0.82 && ratio <= G * 1.08, `floor ${depth}, seed ${seed}: ${total(was)} in its packs now ${total(now)}, ${ratio.toFixed(2)} times (${G.toFixed(2)})`);
    }
  }
});

test('3. on an endless level, by its power: bigger than the floor it is would have them', () => {
  const was = ENDLESS.on;
  ENDLESS.on = true;
  try {
    const at = (on: boolean): Game => growing(on, () => {
      const g = seasoned(new Game('warrior', 21), 30);
      g.depth = lastFloor();
      g.cleared = lastFloor() - 1;
      g.wayDepth = lastFloor();
      g.enterDungeon();
      const take = (to: string): void => (g as unknown as { takeWay(t: string): void }).takeWay(to);
      take('on');
      take('way');
      return g;
    });
    const off = at(false);
    const on = at(true);
    assert.equal(on.inEndless, true);
    assert.equal(on.depth, off.depth, 'the same floor');
    const G = packGrowth(on.power);
    near(G, packGrowth(endlessPower(1)), 1e-9, 'by the endless level\'s power');
    assert.ok(G > packGrowth(on.depth), 'more than the floor itself would have');
    const ratio = total(on) / Math.max(1, total(off));
    assert.ok(ratio >= G * 0.82 && ratio <= G * 1.08, `${total(off)} in its packs now ${total(on)}, ${ratio.toFixed(2)} times (${G.toFixed(2)})`);
  } finally {
    ENDLESS.on = was;
  }
});
