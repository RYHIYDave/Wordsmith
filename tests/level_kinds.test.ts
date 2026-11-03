// EVERY FLOOR OPEN, LINEAR OR COMBO (game/dungeon.ts LEVEL_KINDS): the Crypt's floors laid by his picks, each at his yes to its
// maps. Here:
//   1. the switch on, floor 1 combo and floor 2 open; the floors not yet seen laid as they were; off, every floor as it was;
//   2. FLOOR 1, COMBO: ways round (a loop to walk round) on most floors; a branch more than before, each a dead end with its
//      reward; the start one way out, the boss's hall one way in by its gate; every room come to; and no door where its room can
//      be come to without passing it (game.ts shutIn holds what is in a room with a shut door out of reach);
//   3. FLOOR 2, OPEN: the great hall, rooms in a grid joined by breaches, a wall left standing now and then, the grid one space;
//      the antechamber one way out, the boss's hall one way in by its gate; its branches; no door in the hall; about as many
//      monsters as the floor had.
//   run: tsx --test tests/level_kinds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { COMBO, LEVEL_KINDS, OPEN_HALL, branchCount, generateFloor, levelKindOf } from '../src/game/dungeon';
import { onALoop } from '../src/game/doors';
import { T_FLOOR } from '../src/game/types';
import type { Floor, Room } from '../src/game/types';

const SEEDS = Array.from({ length: 12 }, (_, i) => 1009 + i * 7919);

function kindsOff<T>(f: () => T): T {
  const was = LEVEL_KINDS.on;
  LEVEL_KINDS.on = false;
  try {
    return f();
  } finally {
    LEVEL_KINDS.on = was;
  }
}

/** Rock wholly ringed by floor: the loops one can walk round. */
function loops(f: Floor): number {
  const seen = new Uint8Array(f.w * f.h);
  let n = 0;
  for (let s = 0; s < f.w * f.h; s++) {
    if (seen[s] || f.tiles[s] === T_FLOOR) continue;
    n++;
    const st = [s];
    seen[s] = 1;
    while (st.length) {
      const i = st.pop()!;
      const x = i % f.w;
      const y = (i - x) / f.w;
      for (let ny = Math.max(0, y - 1); ny <= Math.min(f.h - 1, y + 1); ny++) {
        for (let nx = Math.max(0, x - 1); nx <= Math.min(f.w - 1, x + 1); nx++) {
          const j = ny * f.w + nx;
          if (!seen[j] && f.tiles[j] !== T_FLOOR) {
            seen[j] = 1;
            st.push(j);
          }
        }
      }
    }
  }
  return n - 1;
}

/** Every room's middle walked to from the start. */
function allReached(f: Floor): boolean {
  const seen = new Uint8Array(f.w * f.h);
  const q = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
  seen[q[0]] = 1;
  for (let k = 0; k < q.length; k++) {
    const i = q[k];
    const x = i % f.w;
    const y = (i - x) / f.w;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const j = (y + dy) * f.w + x + dx;
      if (x + dx < 0 || y + dy < 0 || x + dx >= f.w || y + dy >= f.h || seen[j] || f.tiles[j] !== T_FLOOR) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return f.rooms.every((r) => {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (seen[y * f.w + x]) return true;
    return false;
  });
}

/** How many ways out of a room: the runs of floor in the ring of tiles just outside it (a door's one tile, a way's three). */
function openings(f: Floor, r: Room): number {
  const ring: [number, number][] = [];
  for (let x = r.x - 1; x <= r.x + r.w; x++) ring.push([x, r.y - 1]);
  for (let y = r.y; y <= r.y + r.h; y++) ring.push([r.x + r.w, y]);
  for (let x = r.x + r.w - 1; x >= r.x - 1; x--) ring.push([x, r.y + r.h]);
  for (let y = r.y + r.h - 1; y >= r.y; y--) ring.push([r.x - 1, y]);
  const open = ring.map(([x, y]) => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_FLOOR);
  let runs = 0;
  for (let i = 0; i < open.length; i++) if (open[i] && !open[(i + open.length - 1) % open.length]) runs++;
  return runs === 0 && open.every(Boolean) ? 1 : runs;
}

/** The doors and gates standing in a room's doorways. */
const doorsOf = (f: Floor, r: Room) => (f.doors ?? []).filter((d) => d.room === r.id);

test('1. on: floor 1 combo, floor 2 open, the others as they were; off, every floor as it was', () => {
  assert.equal(LEVEL_KINDS.on, true);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(levelKindOf), ['combo', 'open', null, null, null, null]);
  for (const d of [3, 4, 5]) for (const seed of SEEDS.slice(0, 3)) assert.deepEqual(generateFloor(d, seed).tiles, kindsOff(() => generateFloor(d, seed)).tiles, `floor ${d} as it was`);
  kindsOff(() => assert.deepEqual([1, 2].map(levelKindOf), [null, null]));
});

test('2. floor 1, combo: ways round, a branch more, each a dead end with its reward; one way out of the start, one into the boss; every room come to; no door that can be gone round', () => {
  let round = 0;
  for (const seed of SEEDS) {
    const f = generateFloor(1, seed);
    const n = loops(f);
    assert.ok(n <= COMBO.loops, `seed ${seed}: ${n} loops`);
    if (n > 0) round++;
    assert.ok(allReached(f), `seed ${seed}: every room come to`);
    const rewards = f.rooms.filter((r) => r.kind === 'treasure' || r.kind === 'guardian');
    assert.equal(rewards.length, branchCount(1) + COMBO.branches, `seed ${seed}: its rewards`);
    for (const r of rewards) assert.equal(openings(f, r), 1, `seed ${seed}: reward room ${r.id} a dead end`);
    const start = f.rooms.find((r) => r.kind === 'start')!;
    const boss = f.rooms.find((r) => r.kind === 'boss')!;
    assert.equal(openings(f, start), 1, `seed ${seed}: the start one way out`);
    assert.ok(doorsOf(f, boss).some((d) => d.kind === 'bossgate'), `seed ${seed}: the boss's gate`);
    for (const d of f.doors ?? []) {
      if (d.kind !== 'door') continue;
      const r = f.rooms.find((q) => q.id === d.room)!;
      assert.ok(!onALoop(f, r, d), `seed ${seed}: room ${r.id}'s door can be gone round`);
    }
  }
  assert.ok(round >= 9, `${round} of ${SEEDS.length} first floors have a way round`);
});

test('3. floor 2, open: the great hall, its antechamber and the boss off its two ends, its branches, no door in it, about as many monsters', () => {
  let mobs = 0;
  let before = 0;
  for (const seed of SEEDS) {
    const f = generateFloor(2, seed);
    assert.ok(allReached(f), `seed ${seed}: every room come to`);
    const hall = f.rooms.filter((r) => r.path >= 1 && r.kind !== 'boss');
    assert.equal(hall.length, OPEN_HALL.cols * OPEN_HALL.rows, `seed ${seed}: the hall's rooms`);
    assert.ok(loops(f) >= 2, `seed ${seed}: piers to walk round`);
    const start = f.rooms.find((r) => r.kind === 'start')!;
    const boss = f.rooms.find((r) => r.kind === 'boss')!;
    assert.equal(openings(f, start), 1, `seed ${seed}: the antechamber one way out`);
    assert.ok(doorsOf(f, boss).some((d) => d.kind === 'bossgate'), `seed ${seed}: the boss's gate`);
    // (but where he comes into it from the antechamber, which may have one: nothing in the hall comes at him but through it)
    for (const r of hall) if (r.path > 1) assert.ok(!doorsOf(f, r).some((d) => d.kind === 'door'), `seed ${seed}: no door in the hall (room ${r.id})`);
    assert.equal(f.rooms.filter((r) => r.kind === 'treasure' || r.kind === 'guardian').length, branchCount(2), `seed ${seed}: its rewards`);
    mobs += f.packs.reduce((a, p) => a + p.size, 0);
    before += kindsOff(() => generateFloor(2, seed)).packs.reduce((a, p) => a + p.size, 0);
  }
  assert.ok(mobs > before * 0.85 && mobs < before * 1.2, `about as many monsters: ${mobs} to ${before}`);
});
