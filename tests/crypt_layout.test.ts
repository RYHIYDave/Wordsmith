// THE CRYPT'S LAYOUT (game/dungeon.ts, CRYPT_LAYOUT, off): its cell blocks with their rows of cells,
// and its floors opening up the deeper they go. The owner, 10 Oct 2026, 08:26: "rows of jail cells
// along the wall.  Small rooms each with a door.  And I’d like for the current 5, as the floors get
// less and less finished, I’d like to open up more and not be so confined and claustrophobic."
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CRYPT_LAYOUT, cryptLayoutFloor, generateFloor } from '../src/game/dungeon';
import { doorTiles } from '../src/game/doors';
import { SOLID_PROPS, T_FLOOR } from '../src/game/types';
import type { Floor } from '../src/game/types';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1009 + i * 7919);

function withLayout<T>(on: boolean, f: () => T): T {
  const was = CRYPT_LAYOUT.on;
  CRYPT_LAYOUT.on = on;
  try {
    return f();
  } finally {
    CRYPT_LAYOUT.on = was;
  }
}

const inside = (r: { x: number; y: number; w: number; h: number }, x: number, y: number): boolean => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;

/** The share of a floor's floor tiles in no room (corridors), and its rooms' mean size (cells left out). */
function openness(f: Floor): { corridor: number; area: number } {
  const inRoom = new Uint8Array(f.w * f.h);
  for (const r of f.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) inRoom[y * f.w + x] = 1;
  let floor = 0;
  let corr = 0;
  for (let i = 0; i < f.tiles.length; i++) {
    if (f.tiles[i] !== T_FLOOR) continue;
    floor++;
    if (!inRoom[i]) corr++;
  }
  const rooms = f.rooms.filter((r) => !r.cell);
  return { corridor: corr / floor, area: rooms.reduce((a, r) => a + r.w * r.h, 0) / rooms.length };
}

test('the switch is off, and off no dungeon is a Crypt floor of this layout', () => {
  assert.equal(CRYPT_LAYOUT.on, false);
  for (let d = 0; d <= 7; d++) assert.equal(cryptLayoutFloor(d), 0);
  withLayout(true, () => {
    assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map(cryptLayoutFloor), [0, 1, 2, 3, 4, 5, 0, 0]);
  });
});

test('past the Crypt (the sixth dungeon and on) a dungeon is laid as it always was, the layout on or off', () => {
  for (const seed of SEEDS.slice(0, 6)) {
    for (const d of [6, 7, 11]) {
      const off = withLayout(false, () => generateFloor(d, seed));
      const on = withLayout(true, () => generateFloor(d, seed));
      assert.deepEqual(on, off, `dungeon ${d}, seed ${seed}`);
    }
  }
});

test('on every floor of the Crypt: its cell blocks, and a row of cells along the back wall of each, every cell a small room with its door', () => {
  withLayout(true, () => {
    const want = [0, 2, 2, 1, 1, 1];
    let cellsSeen = 0;
    for (let d = 1; d <= 5; d++) {
      for (const seed of SEEDS) {
        const f = generateFloor(d, seed);
        const blocks = f.rooms.filter((r) => r.block);
        const cells = f.rooms.filter((r) => r.cell);
        assert.equal(blocks.length, want[d], `dungeon ${d}, seed ${seed}: cell blocks`);
        for (const b of blocks) {
          assert.ok(b.path > 0 && b.kind !== 'boss', 'a cell block is a room of the main path, not the first nor the boss hall');
          assert.ok(Math.max(b.w, b.h) >= 22 && Math.min(b.w, b.h) <= 8, `a long hall (${b.w}x${b.h})`);
        }
        for (const c of cells) {
          cellsSeen++;
          assert.equal(c.path, -1, 'a cell is a dead end off the path');
          assert.ok(c.nextDoor, 'a cell is next door to its hall');
          // its size: four tiles along the hall, three or four deep
          const host = blocks.find((b) => (b.w >= b.h ? c.y + c.h + 3 === b.y && c.x >= b.x && c.x + c.w <= b.x + b.w : c.x + c.w + 3 === b.x && c.y >= b.y && c.y + c.h <= b.y + b.h));
          assert.ok(host, `dungeon ${d}, seed ${seed}: cell ${c.id} hangs off the back wall of a cell block, three tiles behind it`);
          const along = host!.w >= host!.h ? c.w : c.h;
          const deep = host!.w >= host!.h ? c.h : c.w;
          assert.equal(along, 4);
          assert.ok(deep === 3 || deep === 4);
          // its door, in its way in
          const doors = (f.doors ?? []).filter((dd) => dd.room === c.id);
          assert.equal(doors.length, 1, `dungeon ${d}, seed ${seed}: cell ${c.id} has one door`);
          assert.equal(doors[0].kind, 'door');
          // nothing fights in it, nor burns, nor lies in wait
          assert.ok(!f.packs.some((p) => p.roomId === c.id || inside(c, Math.floor(p.x), Math.floor(p.y))), 'no pack in a cell');
          for (const p of f.props.filter((q) => inside(c, q.x, q.y))) {
            assert.ok(!SOLID_PROPS.includes(p.kind) || p.kind === 'urn' || p.kind === 'barrel', `in a cell: ${p.kind}`);
          }
          assert.ok(!(f.hazards ?? []).some((h) => inside(c, Math.floor(h.x), Math.floor(h.y))), 'no trap in a cell');
        }
        // (and the door's tile is the middle of the cell's doorway: it stands in the cell's own wall)
        for (const dd of (f.doors ?? []).filter((q) => cells.some((c) => c.id === q.room))) {
          const t = doorTiles(f, dd)[1];
          const c = cells.find((q) => q.id === dd.room)!;
          const x = t % f.w;
          const y = Math.floor(t / f.w);
          assert.ok(x >= c.x - 1 && x <= c.x + c.w && y >= c.y - 1 && y <= c.y + c.h, 'the door stands against its cell');
        }
      }
    }
    assert.ok(cellsSeen / (SEEDS.length * 5) >= 2.5, `cells a floor: ${(cellsSeen / (SEEDS.length * 5)).toFixed(2)}`);
  });
});

test('the deeper floors open up: less of the floor in corridors, and bigger rooms, floor by floor, than the same dungeons with the layout off', () => {
  const mean = (on: boolean, d: number): { corridor: number; area: number } => {
    const all = SEEDS.map((s) => withLayout(on, () => openness(generateFloor(d, s))));
    return { corridor: all.reduce((a, o) => a + o.corridor, 0) / all.length, area: all.reduce((a, o) => a + o.area, 0) / all.length };
  };
  const on = [1, 2, 3, 4, 5].map((d) => mean(true, d));
  const off = [1, 2, 3, 4, 5].map((d) => mean(false, d));
  for (let k = 1; k < 5; k++) {
    assert.ok(on[k].corridor < off[k].corridor * 0.8, `floor ${k + 1}: corridor ${on[k].corridor.toFixed(3)} against ${off[k].corridor.toFixed(3)}`);
    assert.ok(on[k].area > off[k].area * 1.25, `floor ${k + 1}: room area ${on[k].area.toFixed(0)} against ${off[k].area.toFixed(0)}`);
  }
  // (more open the deeper: the fourth floor more than the second)
  assert.ok(on[3].corridor < on[1].corridor && on[3].area > on[1].area);
});

test('from the third floor some rooms are joined by a breach, a wide opening in the wall between them; none on the first two', () => {
  withLayout(true, () => {
    const wide = (f: Floor): number => {
      const fl = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_FLOOR;
      let n = 0;
      for (const r of f.rooms) {
        for (const [line, alongX] of [[r.y - 1, true], [r.y + r.h, true], [r.x - 1, false], [r.x + r.w, false]] as [number, boolean][]) {
          const len = alongX ? r.w : r.h;
          let run = 0;
          for (let k = 0; k <= len; k++) {
            if (k < len && (alongX ? fl(r.x + k, line) : fl(line, r.y + k))) {
              run++;
              continue;
            }
            if (run >= 5) n++;
            run = 0;
          }
        }
      }
      return n;
    };
    const per = [1, 2, 3, 4, 5].map((d) => SEEDS.reduce((a, s) => a + wide(generateFloor(d, s)), 0));
    assert.equal(per[0], 0);
    assert.equal(per[1], 0);
    assert.ok(per[2] > 0 && per[3] > per[2] * 0.9 && per[4] > 0, `wide openings by floor: ${per.join(', ')}`);
  });
});
