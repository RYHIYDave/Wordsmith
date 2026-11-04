// FLOOR 2 AS THE PRISON'S GROUNDS AT NIGHT, LAID (game/grounds_way.ts and game/dungeon.ts planOpen, behind GROUNDS: the art chat's
// art/grounds.ts, his “Mostly outside” and “Yes, hand it over (Recommended)”, 2 Nov 2026): off, floor 2 is what it was; on, its great
// rooms are courtyards with six tiles of cell block between two, a way three wide through the blocks, the gaoler's room small with
// the stair down from floor 1 in its back wall and his door out into the first courtyard, the long walk from his door to the way
// down to his yard, the chapel's front in a block, a well in every courtyard; nothing cut off.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { GROUNDS } from '../src/art/grounds';
import { doorTiles } from '../src/game/doors';
import { makeDungeon } from '../src/game/level';
import { GROUNDS_HALL } from '../src/game/grounds_way';
import { T_FLOOR, T_WALL } from '../src/game/types';

const SEEDS = [1, 2, 7, 4242];

test('off: floor 2 is laid as it was (no courtyards, no plan of the grounds)', () => {
  assert.equal(GROUNDS.on, false);
  for (const seed of SEEDS) {
    const L = makeDungeon(2, seed);
    assert.equal(L.grounds, undefined, `seed ${seed}`);
    assert.ok(!L.floor.rooms.some((r) => r.court), `seed ${seed}: no courtyard`);
  }
});

test('on: courtyards, the blocks between them six deep, ways three wide through them, the gaoler\'s room and his door, the stair, the chapel', () => {
  GROUNDS.on = true;
  try {
    for (const seed of SEEDS) {
      const L = makeDungeon(2, seed);
      const f = L.floor;
      const P = L.grounds!;
      assert.ok(P, `seed ${seed}: a plan`);
      const courts = f.rooms.filter((r) => r.court);
      assert.equal(courts.length, 12, `seed ${seed}: twelve courtyards`);
      for (const r of courts) {
        assert.ok(r.w >= GROUNDS_HALL.room[0] && r.w <= GROUNDS_HALL.room[1] && r.h >= GROUNDS_HALL.row[0] && r.h <= GROUNDS_HALL.row[1], `seed ${seed}: a courtyard ${r.w} by ${r.h}`);
        // (every tile of it floor: no corner cut, no terrace)
        for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) assert.equal(f.tiles[y * f.w + x], T_FLOOR, `seed ${seed}: (${x}, ${y}) floor`);
      }
      assert.ok(!f.height || f.height.every((v) => v === 0), `seed ${seed}: level`);
      // (every way: its three tiles of mouth floor, the walls either side of them wall)
      const gaol = P.gates.filter((g) => g.kind === 'gaol');
      assert.equal(gaol.length, 1, `seed ${seed}: the gaoler's door`);
      assert.ok(P.gates.length >= 12, `seed ${seed}: ${P.gates.length} ways`);
      for (const g of P.gates) {
        const at = (k: number, d: number): number => (g.alongX ? (g.line - 1 - d) * f.w + g.a + k : (g.a + k) * f.w + g.line - 1 - d);
        for (let k = 0; k < 3; k++) assert.equal(f.tiles[at(k, 0)], T_FLOOR, `seed ${seed}: a way's mouth`);
        for (const k of [-1, 3]) assert.equal(f.tiles[at(k, 0)], T_WALL, `seed ${seed}: the wall beside a way`);
      }
      assert.ok(P.gaol.w === GROUNDS_HALL.gaol && P.gaol.h === GROUNDS_HALL.gaol, `seed ${seed}: the gaoler's room six by six`);
      assert.ok(P.wayIn && P.chapel, `seed ${seed}: the stair and the chapel`);
      // (he comes in a tile and a half before the stair)
      const w = P.wayIn!;
      const sx = w.alongX ? w.a + 1.5 : w.plane + 1.7;
      const sy = w.alongX ? w.plane + 1.7 : w.a + 1.5;
      assert.ok(Math.hypot(f.start.x - sx, f.start.y - sy) < 0.6, `seed ${seed}: he comes in before the stair`);
      // (no door in a courtyard's way, no gate that falls)
      assert.ok(!L.doors.some((d) => d.spot.kind === 'trapgate'), `seed ${seed}: no gate that falls`);
      for (const d of L.doors) assert.ok(!f.rooms.find((r) => r.id === d.spot.room)?.court, `seed ${seed}: no door into a courtyard`);
      // THE WALK: floor, joined, from the gaoler's door to the doorway of his yard
      const walk: number[] = [];
      for (let i = 0; i < P.walk.length; i++) if (P.walk[i]) walk.push(i);
      assert.ok(walk.length > 40, `seed ${seed}: the walk ${walk.length}`);
      for (const i of walk) assert.equal(f.tiles[i], T_FLOOR, `seed ${seed}: the walk on floor`);
      const seen = new Set<number>([walk[0]]);
      const q = [walk[0]];
      while (q.length) {
        const i = q.pop()!;
        for (const d of [1, -1, f.w, -f.w]) if (P.walk[i + d] && !seen.has(i + d)) {
          seen.add(i + d);
          q.push(i + d);
        }
      }
      assert.equal(seen.size, walk.length, `seed ${seed}: the walk one road`);
      const g0 = gaol[0];
      assert.ok(P.walk[(g0.a + 1) * f.w + g0.line], `seed ${seed}: the walk begins at his door`);
      const Y = f.yard!;
      assert.ok(P.walk[(Y.y - 1) * f.w + Y.x + Y.door + 1], `seed ${seed}: the walk ends in his yard's doorway`);
      // THE WELLS: one in every courtyard
      for (const r of P.courts) assert.ok(L.props.some((p) => p.name === 'the well' && p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h), `seed ${seed}: a well`);
      // NOTHING CUT OFF: every tile walked on is reached from where he comes in (through every door, as once it is open)
      const doorAt = new Set<number>();
      for (const d of L.doors) for (const i of doorTiles(f, d.spot)) doorAt.add(i);
      const pass = (i: number): boolean => L.walk[i] === 1 || doorAt.has(i);
      const reach = new Uint8Array(f.w * f.h);
      const s = Math.floor(f.start.y) * f.w + Math.floor(f.start.x);
      reach[s] = 1;
      const st = [s];
      while (st.length) {
        const i = st.pop()!;
        for (const d of [1, -1, f.w, -f.w]) if (pass(i + d) && !reach[i + d]) {
          reach[i + d] = 1;
          st.push(i + d);
        }
      }
      for (let i = 0; i < L.walk.length; i++) if (L.walk[i]) assert.equal(reach[i], 1, `seed ${seed}: (${i % f.w}, ${Math.floor(i / f.w)}) reached`);
    }
  } finally {
    GROUNDS.on = false;
  }
});

// (25.0.2: his word, 3 Nov 2026, 21:51: “The waypoint in floor two is gone”: the grounds' gaoler's room, small and furnished, left
// none of the waypoint's usual places clear; it goes now to the nearest clear place walked to from where he comes in)
import { Game as Game2502 } from '../src/game/game';
test('25.0.2: floor 2 as the grounds always has its waypoint, walked to from where he comes in', () => {
  const was = GROUNDS.on;
  GROUNDS.on = true;
  try {
    for (let seed = 1; seed <= 16; seed++) {
      const g = new Game2502('warrior', seed);
      g.depth = 2;
      g.cleared = 1;
      g.wayDepth = 2;
      g.enterDungeon();
      assert.ok(g.level.grounds, `seed ${seed}: the grounds`);
      const w = g.level.ways?.way;
      assert.ok(w, `seed ${seed}: a waypoint`);
      const s = g.level.floor.start;
      assert.ok(Math.hypot(w!.x - s.x, w!.y - s.y) <= 6.01, `seed ${seed}: near where he comes in`);
    }
  } finally {
    GROUNDS.on = was;
  }
});
