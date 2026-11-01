// THE HEADSMAN'S YARD IN THE GAME (game/yard.ts lays it, render/yard.ts draws it; behind YARD, off until he has seen it in play).
// His words, 28 Oct 2026: “And I think I want the headman’s yard to be outdoors.  Like you go out to a big open area like a
// prison yard but there’s the gallows and the chopping block where the headsman’s boss area is at.”; 1 Nov 2026, to put it in:
// “Yes, put it in now (Recommended)”. Held here:
//   1. off: no floor is laid with the yard;
//   2. on: every second floor's boss hall is the yard: YARD_N tiles each way, a plain square walled round, come into by its far
//      wall along x and by no other way, the boss's gate in that doorway; nothing of the Crypt's lying or standing in it;
//   3. on: its pieces all laid (the scaffold, the gallows, the bell, the grindstone, the stocks, the gibbet), none before the
//      doorway, none on another; every tile of the yard not under a piece walked to from the doorway; the Headsman's place on
//      open floor; the places the stairwell may open off its pieces; no other floor laid with it;
//   4. on, a played floor: the pieces stand where they are laid and nobody walks on their tiles; nothing of the Crypt's set in
//      the prison wall.
//   run: tsx --test tests/yard_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { YARD } from '../src/art/yard';
import { generateFloor } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { YARD_N, inYard, yardBlocks } from '../src/game/yard';
import { T_FLOOR } from '../src/game/types';
import type { Floor } from '../src/game/types';

const SEEDS = Array.from({ length: 16 }, (_, i) => 2003 + i * 7919);

function withYard<T>(f: () => T): T {
  const was = YARD.on;
  YARD.on = true;
  try {
    return f();
  } finally {
    YARD.on = was;
  }
}

/** The yard's tiles walked to from the doorway (four ways, its pieces' tiles not walked on). */
function reached(f: Floor): Set<number> {
  const Y = f.yard!;
  const blocks = yardBlocks(f);
  const seen = new Set<number>();
  const q = [Y.y * f.w + Y.x + Y.door + 1];
  seen.add(q[0]);
  for (let k = 0; k < q.length; k++) {
    const i = q[k];
    const x = i % f.w;
    const y = (i - x) / f.w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const j = (y + dy) * f.w + x + dx;
      if (seen.has(j) || !inYard(f, x + dx, y + dy) || blocks.has(j) || f.tiles[j] !== T_FLOOR) continue;
      seen.add(j);
      q.push(j);
    }
  }
  return seen;
}

test('1. off: no floor is laid with the yard', () => {
  assert.equal(YARD.on, false);
  for (const seed of SEEDS.slice(0, 4)) assert.equal(generateFloor(2, seed).yard, undefined);
});

test('2. on: the boss hall of every second floor is the yard, walled round, come into by its far wall along x alone, its gate there, nothing of the Crypt in it', () => {
  withYard(() => {
    for (const seed of SEEDS) {
      const f = generateFloor(2, seed);
      const Y = f.yard!;
      assert.ok(Y, `seed ${seed}: the yard`);
      const boss = f.rooms.find((r) => r.kind === 'boss')!;
      assert.deepEqual([boss.x, boss.y, boss.w, boss.h], [Y.x, Y.y, YARD_N, YARD_N], `seed ${seed}: the boss hall is the yard`);
      for (let y = Y.y; y < Y.y + Y.n; y++) for (let x = Y.x; x < Y.x + Y.n; x++) assert.equal(f.tiles[y * f.w + x], T_FLOOR, `seed ${seed}: (${x}, ${y}) floor`);
      for (let y = Y.y; y < Y.y + Y.n; y++) assert.ok(!(f.height && f.height[y * f.w + Y.x + 3]) && !(f.cut && f.cut[y * f.w + Y.x]), `seed ${seed}: plain`);
      const ways: string[] = [];
      for (let k = -1; k <= Y.n; k++) {
        if (f.tiles[(Y.y - 1) * f.w + Y.x + k] === T_FLOOR) ways.push(`far-x ${k}`);
        if (f.tiles[(Y.y + k) * f.w + Y.x - 1] === T_FLOOR) ways.push(`far-y ${k}`);
        if (f.tiles[(Y.y + k) * f.w + Y.x + Y.n] === T_FLOOR) ways.push(`near-x ${k}`);
        if (f.tiles[(Y.y + Y.n) * f.w + Y.x + k] === T_FLOOR) ways.push(`near-y ${k}`);
      }
      assert.deepEqual(ways, [0, 1, 2].map((k) => `far-x ${Y.door + k}`), `seed ${seed}: come into by its far wall along x alone`);
      const gate = (f.doors ?? []).find((d) => d.kind === 'bossgate');
      assert.ok(gate && gate.alongX && gate.plane === Y.y && gate.a === Y.x + Y.door, `seed ${seed}: the boss's gate in its doorway`);
      const crypt = f.props.filter((p) => inYard(f, p.x, p.y) && !['brazier', 'barrel', 'urn'].includes(p.kind));
      assert.deepEqual(crypt, [], `seed ${seed}: nothing of the Crypt's in it`);
      assert.equal(f.packs.filter((p) => inYard(f, p.x, p.y)).length, 0, `seed ${seed}: no pack in it`);
    }
    for (const d of [1, 3]) assert.equal(generateFloor(d, SEEDS[0]).yard, undefined, `floor ${d} has no yard`);
  });
});

test('3. on: its pieces all laid, none before the doorway or on another; all of it walked to; the Headsman on open floor', () => {
  withYard(() => {
    for (const seed of SEEDS) {
      const f = generateFloor(2, seed);
      const Y = f.yard!;
      assert.deepEqual(Y.pieces.map((p) => p.name).sort(), ['the great bell', 'the grindstone', 'the gibbet', 'the long gallows', 'the scaffold, draped', 'the stocks'].sort(), `seed ${seed}: its pieces`);
      const all = Y.pieces.flatMap((p) => p.blocks);
      assert.equal(new Set(all).size, all.length, `seed ${seed}: no piece on another`);
      for (const p of Y.pieces) {
        assert.ok(p.blocks.includes(Math.floor(p.y) * f.w + Math.floor(p.x)), `seed ${seed}: ${p.name} stands on its own tiles`);
        for (const i of p.blocks) {
          const x = (i % f.w) - Y.x;
          const y = Math.floor(i / f.w) - Y.y;
          assert.ok(x >= 0 && y >= 0 && x < Y.n && y < Y.n, `seed ${seed}: ${p.name} in the yard`);
          assert.ok(!(x >= Y.door - 1 && x <= Y.door + 3 && y <= 3), `seed ${seed}: ${p.name} before the doorway`);
        }
      }
      const props = new Set(f.props.filter((p) => inYard(f, p.x, p.y)).map((p) => p.y * f.w + p.x));
      for (const i of all) assert.ok(!props.has(i), `seed ${seed}: a brazier or barrel on a piece`);
      const open = reached(f);
      let free = 0;
      for (let y = Y.y; y < Y.y + Y.n; y++) for (let x = Y.x; x < Y.x + Y.n; x++) if (!all.includes(y * f.w + x) && !props.has(y * f.w + x)) free++;
      assert.ok(open.size >= free, `seed ${seed}: ${open.size} of ${free} open tiles walked to`);
      const b = Math.floor(f.boss.y) * f.w + Math.floor(f.boss.x);
      assert.ok(inYard(f, f.boss.x, f.boss.y) && open.has(b), `seed ${seed}: the Headsman's place on open floor`);
    }
  });
});

test("4. on, a played floor: the pieces stand and nobody walks on their tiles; the stairwell's places off them; nothing of the Crypt set in the prison wall", () => {
  withYard(() => {
    for (const seed of [7919, 15838, 23757]) {
      const g = new Game('warrior', seed);
      g.depth = 2;
      g.wayDepth = 2;
      g.enterDungeon();
      const L = g.level;
      const f = L.floor;
      const Y = f.yard!;
      assert.ok(Y, `seed ${seed}: the yard`);
      for (const p of Y.pieces) {
        assert.ok(L.props.some((q) => q.kind === 'piece' && q.name === p.name && q.solid), `seed ${seed}: ${p.name} stands`);
        for (const i of p.blocks) assert.equal(L.walk[i], 0, `seed ${seed}: ${p.name}'s tile walked on`);
      }
      const blocks = yardBlocks(f);
      for (const s of L.ways?.stairs ?? []) {
        for (let y = s.y; y <= s.y + 1; y++) for (let x = s.x; x <= s.x + 2; x++) assert.ok(!blocks.has(y * f.w + x), `seed ${seed}: a stairwell's place on a piece`);
      }
      const ring = (i: number): boolean => {
        const x = i % f.w;
        const y = Math.floor(i / f.w);
        return x >= Y.x - 1 && x <= Y.x + Y.n && y >= Y.y - 1 && y <= Y.y + Y.n;
      };
      assert.deepEqual((L.dress?.wall ?? []).filter((w) => ring(w.i)).map((w) => w.name), [], `seed ${seed}: the Crypt's pieces in the prison wall`);
    }
  });
});
