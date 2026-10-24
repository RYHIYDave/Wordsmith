// FLOOR 15'S STACKS A BLOCK HIGH, THE MAIN CHAT'S HOOKS (the art chat's art/low_stacks.ts, behind LOW_STACKS, off until he says
// to put it live). The owner, 23 Oct 2026, 11:40 (Pacific): “The library is really hard to navigate.  The rows of shelves room
// needs the rows to maybe only be one block high, and there shouldn’t be any little doodad in the isles”; to the art chat's
// pictures of it from the game, by 13:06: “Yes, send to main (Recommended)”.
//
// What is held here:
//   - the library's rules mark every tile of the stacks' rows (Land.shelves): each a wall; on no other floor;
//     the floor itself as it was (the rows stay walls in the rules);
//   - on, nothing is hung on a row (a sconce, a portrait, a banner would hang in the air over a low case); off, the floor is
//     dressed as before;
//   - the ground's rows (render/outdoor.ts lowRowsOf) only on, only on the library, and just the marked tiles; its ground painted
//     with them as floor, and the low rows laid in with the walls standing whole (withLow).
//   run: tsx --test tests/low_stacks_hooks.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { LOW_STACKS } from '../src/art/low_stacks';
import { makeDungeon } from '../src/game/level';
import { LB_PIECES } from '../src/game/act2/library';
import { T_WALL } from '../src/game/types';
import { landTerrain, lowRowsOf } from '../src/render/outdoor';

function lowSet<T>(on: boolean, run: () => T): T {
  const was = LOW_STACKS.on;
  LOW_STACKS.on = on;
  try {
    return run();
  } finally {
    LOW_STACKS.on = was;
  }
}
const HUNG = new Set<string>([LB_PIECES.sconce, ...Object.values(LB_PIECES).filter((n) => /portrait|banner|doors/.test(String(n)))].map(String));

test('the rows marked: walls, and the floor as it was', () => {
  for (const seed of [1, 2, 3, 5, 8]) {
    const L = makeDungeon(15, seed);
    const land = L.land!;
    assert.equal(land.kind, 'library');
    const m = land.shelves!;
    assert.ok(m, `seed ${seed}: marked`);
    let n = 0;
    for (let i = 0; i < m.length; i++) {
      if (!m[i]) continue;
      n++;
      assert.equal(L.floor.tiles[i], T_WALL, `seed ${seed}: a row's tile is a wall`);
    }
    assert.ok(n > 30, `seed ${seed}: ${n} tiles of rows`);
    // (the switch changes nothing of the rules' floor)
    const on = lowSet(true, () => makeDungeon(15, seed));
    assert.deepEqual([...on.floor.tiles], [...L.floor.tiles], `seed ${seed}: the same floor`);
  }
  for (const depth of [11, 12, 13, 14]) assert.equal(makeDungeon(depth, 3).land?.shelves, undefined, `floor ${depth}: no rows`);
});

test('on, nothing hung on a row; off, dressed as before', () => {
  for (const seed of [1, 2, 3, 5, 8]) {
    const off = lowSet(false, () => makeDungeon(15, seed));
    const again = lowSet(false, () => makeDungeon(15, seed));
    assert.deepEqual(again.props.map((p) => `${p.name}@${p.tx},${p.ty}`), off.props.map((p) => `${p.name}@${p.tx},${p.ty}`), 'off: the same dressing every time');
    const L = lowSet(true, () => makeDungeon(15, seed));
    const W = L.floor.w;
    const m = L.land!.shelves!;
    const row = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < L.floor.h && m[y * W + x] === 1;
    let hung = 0;
    for (const p of L.props) {
      if (!HUNG.has(String(p.name))) continue;
      hung++;
      const face = p.variant & 1;
      const onRow = face === 0 ? row(p.tx, p.ty - 1) : row(p.tx - 1, p.ty);
      assert.ok(!onRow, `seed ${seed}: ${p.name} at (${p.tx}, ${p.ty}) is not hung on a row`);
    }
    assert.ok(hung > 4, `seed ${seed}: ${hung} pieces hung on the walls still`);
  }
});

test('the ground: rows only on, only on the library, just the marked tiles; painted with them as floor', () => {
  const L = makeDungeon(15, 3);
  const land = L.land!;
  assert.equal(lowSet(false, () => lowRowsOf(land, L.floor)), null, 'off: none');
  lowSet(true, () => {
    const rows = lowRowsOf(land, L.floor)!;
    assert.ok(rows, 'on: the rows');
    const W = L.floor.w;
    for (let y = 0; y < L.floor.h; y++) for (let x = 0; x < W; x++) assert.equal(rows(x, y), land.shelves![y * W + x] === 1, `(${x}, ${y})`);
    const T = landTerrain(land, L.floor, true);
    let rowGround = 0;
    for (let y = 0; y < L.floor.h; y++) for (let x = 0; x < W; x++) if (rows(x, y) && T.ground(x + 0.5, y + 0.5)) rowGround++;
    assert.ok(rowGround > 0, 'the rows painted as floor under the low cases');
    const other = makeDungeon(14, 3);
    assert.equal(lowRowsOf(other.land!, other.floor), null, 'not on another floor');
  });
});
