// Tests for src/game/dungeon.ts (level generator) and src/game/nav.ts (grid navigation).
//   run: tsx --test tests/dungeon.test.ts
//
// The generator rules are written out again here from the design brief rather than imported from
// dungeon.ts, so a tuning change that breaks a rule shows up as a failing test. Every level is
// seeded, so results are the same on every run.
//
// Levels checked: depths 1-12, 25 seeds each. To soak-test more seeds or deeper levels:
//   DUNGEON_TEST_SEEDS=400 DUNGEON_TEST_DEPTHS=20 tsx --test tests/dungeon.test.ts

// The project type-checks without Node's own type package (tsconfig "types": []), so these two
// imports are untyped. The small interface below gives back the parts the tests use.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { RNG } from '../src/engine/rng';
import { doorPiers, doorWay } from '../src/game/doors';
import { MIX, generateFloor, tileAt } from '../src/game/dungeon';
import { buildOpenGrid, buildWalkGrid, flowDir, flowField, lineOfSight, scatter } from '../src/game/nav';
import { CUT_FAR, CUT_LEFT, CUT_NEAR_LOW, CUT_RIGHT, SOLID_PROPS, T_FLOOR, T_VOID, T_WALL } from '../src/game/types';
import type { Floor, PackSpot, PropSpot, Room } from '../src/game/types';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  notEqual(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
  notDeepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const UNREACHABLE = 65535;

// ---------------------------------------------------------------------------------------------
// The brief, as numbers

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const DEPTHS = Math.max(1, Number(env.DUNGEON_TEST_DEPTHS) || 12);
const SEEDS = Math.max(1, Number(env.DUNGEON_TEST_SEEDS) || 25);

// A level is a main path of rooms from the start to the boss hall, with dead-end side branches.
const MAP_MAX = 160;
const pathRooms = (depth: number): number => Math.min(15, 11 + Math.floor((depth - 1) / 2));
const branches = (depth: number): number => (depth <= 2 ? 3 : depth <= 5 ? 4 : 5);
const eliteRooms = (depth: number): number => (depth <= 2 ? 2 : depth <= 5 ? 3 : 4);
const monsterTarget = (depth: number): number => Math.min(230, 120 + 8 * (depth - 1));
const normalPackMin = (depth: number): number => Math.min(7, 3 + Math.floor((depth - 1) / 3));
const normalPackMax = (depth: number): number => Math.min(9, 6 + Math.floor((depth - 1) / 3));
const isBossSized = (r: Room): boolean => (r.w >= 13 && r.h >= 12) || (r.w >= 12 && r.h >= 13);
const isPillarRoom = (r: Room): boolean => (r.w >= 11 && r.h >= 10) || (r.w >= 10 && r.h >= 11);

// ---------------------------------------------------------------------------------------------
// Levels under test (generated once, timed while doing so)

interface Sample {
  depth: number;
  seed: number;
  f: Floor;
  /** e.g. "depth 3 seed 3042" for failure messages. */
  tag: string;
}

const samples: Sample[] = [];
let generateMs = 0;
// (THE MAP-MAKER AS IT LAYS A DUNGEON WITHOUT THE MIX, game/dungeon.ts, MIX: the mix's own rooms,
// the lever's nook among them, are asked of in tests/mix.test.ts)
const mixWas = MIX.on;
MIX.on = false;
for (let depth = 1; depth <= DEPTHS; depth++) {
  for (let k = 0; k < SEEDS; k++) {
    const seed = depth * 1000 + k * 7919 + 1;
    const t0 = performance.now();
    const f = generateFloor(depth, seed);
    generateMs += performance.now() - t0;
    samples.push({ depth, seed, f, tag: `depth ${depth} seed ${seed}` });
  }
}
MIX.on = mixWas;

// ---------------------------------------------------------------------------------------------
// Helpers

const isFloor = (f: Floor, x: number, y: number): boolean => tileAt(f, x, y) === T_FLOOR;
// TRIANGLES (Version 18.2): where a room's corner is taken off, the tiles along the cut are half
// floor and half wall (types.ts, Floor.cut). Such a tile is floor to the map (it is drawn, lit and
// walked on, on its floor half), and WALL to whatever is put down in a room: nothing stands or
// lies on half a tile, no pack is centred on one, and a fire stands against a slanting wall as
// against any other.
/** How this tile is cut corner to corner (0: it is whole). */
const cutAt = (f: Floor, x: number, y: number): number => (f.cut && x >= 0 && y >= 0 && x < f.w && y < f.h ? f.cut[y * f.w + x] : 0);
/** A whole tile of floor. */
const wholeFloor = (f: Floor, x: number, y: number): boolean => isFloor(f, x, y) && cutAt(f, x, y) === 0;
const inRoom = (r: Room, x: number, y: number): boolean => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
const roomAt = (f: Floor, x: number, y: number): Room | undefined => f.rooms.find(r => inRoom(r, x, y));
const centreOf = (r: Room): { x: number; y: number } => ({ x: r.x + Math.floor(r.w / 2), y: r.y + Math.floor(r.h / 2) });
const isSolid = (p: PropSpot): boolean => SOLID_PROPS.includes(p.kind);
const packTile = (p: PackSpot): { x: number; y: number } => ({ x: Math.floor(p.x), y: Math.floor(p.y) });

/** A corridor tile is a floor tile outside every room rectangle. */
const isCorridor = (f: Floor, x: number, y: number): boolean => isFloor(f, x, y) && !roomAt(f, x, y);

/** True if every tile within `r` steps (8-way) of (x, y) is floor. */
function clearAround(f: Floor, x: number, y: number, r: number): boolean {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (!isFloor(f, x + dx, y + dy)) return false;
  return true;
}

/** True if every tile within `r` steps (8-way) of (x, y) is a whole tile of floor: no wall there, straight or slanting. */
function clearOfWalls(f: Floor, x: number, y: number, r: number): boolean {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (!wholeFloor(f, x + dx, y + dy)) return false;
  return true;
}

/**
 * How many tiles each corner of a room has lost (its back, right, left and front corner, as the
 * screen shows them): along the room's edge from the corner, the first tile that is floor.
 */
function cornerCuts(f: Floor, r: Room): number[] {
  const first = (x: number, y: number, sx: number): number => {
    let k = 0;
    while (k < r.w && !isFloor(f, x + k * sx, y)) k++;
    return k;
  };
  const x1 = r.x + r.w - 1;
  const y1 = r.y + r.h - 1;
  return [first(r.x, r.y, 1), first(x1, r.y, -1), first(r.x, y1, 1), first(x1, y1, -1)];
}

/** True if any tile within `r` steps (8-way) of (x, y) passes the test. */
function anyAround(x: number, y: number, r: number, hit: (x: number, y: number) => boolean): boolean {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (hit(x + dx, y + dy)) return true;
  return false;
}

/**
 * The doorways of a room, each as its width in tiles. An ordinary doorway is a run of corridor
 * tiles along the outside of one of the room's four sides. A CORRIDOR STRAIGHT ACROSS THE SCREEN
 * (Version 18.3) comes to a room AT ITS RIGHT OR ITS LEFT CORNER and is five rows deep on the
 * slant: two tiles of it lie along the end of one side and two along the start of the next, and
 * the tile diagonally outside the corner is between them. Those two runs are ONE doorway, and it
 * is given as ACROSS_DOOR.
 */
const ACROSS_DOOR = -1;
function doorways(f: Floor, r: Room): number[] {
  // (the side above the room on the map, the one to its right, the one below it, the one to its left: each from its low end)
  const sides: { x: number; y: number; dx: number; dy: number; len: number }[] = [
    { x: r.x, y: r.y - 1, dx: 1, dy: 0, len: r.w },
    { x: r.x + r.w, y: r.y, dx: 0, dy: 1, len: r.h },
    { x: r.x, y: r.y + r.h, dx: 1, dy: 0, len: r.w },
    { x: r.x - 1, y: r.y, dx: 0, dy: 1, len: r.h },
  ];
  const runs: { side: number; from: number; len: number }[] = [];
  sides.forEach((side, at) => {
    let run = 0;
    for (let k = 0; k <= side.len; k++) {
      if (k < side.len && isCorridor(f, side.x + side.dx * k, side.y + side.dy * k)) run++;
      else if (run > 0) {
        runs.push({ side: at, from: k - run, len: run });
        run = 0;
      }
    }
  });
  const out: number[] = [];
  const taken = new Set<number>();
  // the right corner of the screen is the map's (x1, y0): the end of the side above and the start of the side to the right;
  // the left corner is (x0, y1): the end of the side to the left and the start of the side below
  const corners: { a: number; b: number; x: number; y: number }[] = [
    { a: 0, b: 1, x: r.x + r.w, y: r.y - 1 },
    { a: 3, b: 2, x: r.x - 1, y: r.y + r.h },
  ];
  for (const c of corners) {
    const ia = runs.findIndex(q => q.side === c.a && q.len === 2 && q.from + q.len === sides[c.a].len);
    const ib = runs.findIndex(q => q.side === c.b && q.len === 2 && q.from === 0);
    if (ia < 0 || ib < 0 || !isCorridor(f, c.x, c.y)) continue;
    taken.add(ia);
    taken.add(ib);
    out.push(ACROSS_DOOR);
  }
  runs.forEach((q, i) => {
    if (!taken.has(i)) out.push(q.len);
  });
  return out;
}

function totalMonsters(f: Floor): number {
  return f.packs.reduce((a, p) => a + p.size, 0);
}

/** The rooms of the main path in walking order, and the rooms on side branches. */
function pathOf(f: Floor): Room[] {
  return f.rooms.filter(r => r.path >= 0).sort((a, b) => a.path - b.path);
}

/** Islands of wall/void completely surrounded by floor: each one is a loop a player can walk round. */
function countLoops(f: Floor): number {
  const seen = new Uint8Array(f.w * f.h);
  let regions = 0;
  for (let s = 0; s < seen.length; s++) {
    if (seen[s] === 1 || f.tiles[s] === T_FLOOR) continue;
    regions++;
    const stack = [s];
    seen[s] = 1;
    while (stack.length > 0) {
      const i = stack.pop() as number;
      const x = i % f.w;
      const y = Math.floor(i / f.w);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue;
          const j = ny * f.w + nx;
          if (seen[j] === 0 && f.tiles[j] !== T_FLOOR) {
            seen[j] = 1;
            stack.push(j);
          }
        }
      }
    }
  }
  return regions - 1;
}

/**
 * The corridors of a level: each connected run of corridor floor, with the ids of the rooms it
 * touches (side to side, not diagonally).
 */
function corridorsOf(f: Floor): { tiles: number; rooms: number[] }[] {
  const seen = new Uint8Array(f.w * f.h);
  const list: { tiles: number; rooms: number[] }[] = [];
  for (let s = 0; s < seen.length; s++) {
    if (seen[s] === 1 || !isCorridor(f, s % f.w, Math.floor(s / f.w))) continue;
    const rooms = new Set<number>();
    let tiles = 0;
    const stack = [s];
    seen[s] = 1;
    while (stack.length > 0) {
      const i = stack.pop() as number;
      tiles++;
      const x = i % f.w;
      const y = Math.floor(i / f.w);
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (!isFloor(f, nx, ny)) continue;
        const room = roomAt(f, nx, ny);
        if (room) rooms.add(room.id);
        else if (seen[ny * f.w + nx] === 0) {
          seen[ny * f.w + nx] = 1;
          stack.push(ny * f.w + nx);
        }
      }
    }
    list.push({ tiles, rooms: [...rooms].sort((a, b) => a - b) });
  }
  return list;
}

/** Build a walk grid from rows of text: '.' walkable, anything else blocked. */
function grid(rows: string[]): { g: Uint8Array; w: number; h: number } {
  const w = rows[0].length;
  const h = rows.length;
  const g = new Uint8Array(w * h);
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) g[y * w + x] = row.charAt(x) === '.' ? 1 : 0;
  });
  return { g, w, h };
}

// ---------------------------------------------------------------------------------------------
// Generator: shape of the result

test('same depth and seed always give the identical floor', () => {
  // (laid as the samples were: without the mix)
  const mixOn = MIX.on;
  MIX.on = false;
  try {
    for (const s of samples) {
      const again = generateFloor(s.depth, s.seed);
      assert.deepEqual(again, s.f, s.tag);
    }
  } finally {
    MIX.on = mixOn;
  }
  // ...and a different seed or depth gives a different level
  assert.notDeepEqual(generateFloor(1, 1).tiles, generateFloor(1, 2).tiles);
  assert.notDeepEqual(generateFloor(2, 5).rooms, generateFloor(4, 5).rooms);
});

test('odd depths and seeds still give a valid level', () => {
  // depth below 1 (or not a number) is treated as depth 1; fractions are rounded down
  for (const depth of [0, -3, Number.NaN]) {
    const f = generateFloor(depth, 7);
    assert.equal(f.depth, 1);
    assert.deepEqual(f.tiles, generateFloor(1, 7).tiles);
  }
  assert.deepEqual(generateFloor(2.9, 7).tiles, generateFloor(2, 7).tiles);
  // any seed works: zero, negative, huge
  for (const seed of [0, -1, -123456789, 2 ** 31, 2 ** 40 + 5, 4294967295]) {
    const f = generateFloor(3, seed);
    assert.equal(f.seed, seed);
    assert.equal(pathOf(f).length, pathRooms(3));
    assert.ok(f.packs.length > 0 && f.props.length > 0);
  }
  // far deeper than the tables go: size, rooms and the monster budget stay capped
  const deep = generateFloor(60, 1);
  assert.ok(deep.w <= MAP_MAX);
  assert.equal(pathOf(deep).length, 15);
  assert.ok(deep.rooms.length <= 15 + 2 * 5);
  assert.ok(totalMonsters(deep) <= 230 * 1.25);
  assert.ok(deep.packs.every(p => p.size <= 9));
});

test('the map is square and no larger than 160, and room counts and arrays match the depth', () => {
  for (const { f, depth, seed, tag } of samples) {
    assert.equal(f.depth, depth, tag);
    assert.equal(f.seed, seed, tag);
    assert.equal(f.w, f.h, tag);
    assert.ok(f.w >= 50 && f.w <= MAP_MAX, `${tag}: map is ${f.w} wide`);
    assert.equal(f.tiles.length, f.w * f.h, tag);
    assert.equal(f.variant.length, f.w * f.h, tag);
    // the main path first, in walking order; then the branch rooms: one or two for each branch
    const path = pathOf(f);
    assert.equal(path.length, pathRooms(depth), tag);
    path.forEach((r, i) => {
      assert.equal(r.path, i, `${tag}: path places are 0, 1, 2...`);
      assert.equal(r.id, i, `${tag}: main-path rooms come first, in walking order`);
    });
    const off = f.rooms.length - path.length;
    assert.ok(off >= branches(depth) && off <= 2 * branches(depth), `${tag}: ${off} rooms on side branches`);
    assert.ok(f.rooms.every(r => r.path >= -1 && Number.isInteger(r.path)), tag);
    for (let i = 0; i < f.tiles.length; i++) {
      const t = f.tiles[i];
      assert.ok(t === T_VOID || t === T_FLOOR || t === T_WALL, `${tag}: tile id ${t}`);
    }
    // variant is one random byte per tile: expect a wide spread of values
    assert.ok(new Set(f.variant).size > 200, `${tag}: variant bytes are not varied`);
  }
});

test('tileAt returns T_VOID outside the map', () => {
  const f = samples[0].f;
  assert.equal(tileAt(f, -1, 5), T_VOID);
  assert.equal(tileAt(f, 5, -1), T_VOID);
  assert.equal(tileAt(f, f.w, 5), T_VOID);
  assert.equal(tileAt(f, 5, f.h), T_VOID);
  const c = centreOf(f.rooms[0]);
  assert.equal(tileAt(f, c.x, c.y), T_FLOOR);
});

test('start and boss are tile centres on floor, in the middle of their rooms', () => {
  for (const { f, tag } of samples) {
    for (const [name, p] of [['start', f.start], ['boss', f.boss]] as const) {
      assert.equal(p.x - Math.floor(p.x), 0.5, `${tag}: ${name}.x is not a tile centre`);
      assert.equal(p.y - Math.floor(p.y), 0.5, `${tag}: ${name}.y is not a tile centre`);
      assert.ok(wholeFloor(f, Math.floor(p.x), Math.floor(p.y)), `${tag}: ${name} is not on a whole tile of floor`);
      const room = f.rooms.find(r => r.kind === name) as Room;
      const c = centreOf(room);
      assert.deepEqual({ x: p.x, y: p.y }, { x: c.x + 0.5, y: c.y + 0.5 }, `${tag}: ${name} is not its room's centre`);
    }
  }
});

// ---------------------------------------------------------------------------------------------
// Generator: tiles

test('every floor tile can be reached from the start', () => {
  for (const { f, tag } of samples) {
    const open = buildOpenGrid(f);
    const dist = flowField(open, f.w, f.h, Math.floor(f.start.x), Math.floor(f.start.y));
    for (let i = 0; i < open.length; i++) {
      if (open[i] === 1) assert.ok(dist[i] !== UNREACHABLE, `${tag}: floor tile ${i % f.w},${Math.floor(i / f.w)} is cut off`);
    }
  }
});

test('no floor tile touches void (but a half tile, straight behind its own wall), and every wall touches floor', () => {
  // (a slanting wall is a tile thick: half of the floor tile it is cut from, and half of the tile
  // behind; and behind that, diagonally from the floor tile and on its wall's side, is nothing)
  const behind: Record<number, [number, number]> = { [CUT_FAR]: [-1, -1], [CUT_NEAR_LOW]: [1, 1], [CUT_LEFT]: [-1, 1], [CUT_RIGHT]: [1, -1] };
  let halves = 0;
  for (const { f, tag } of samples) {
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        const t = tileAt(f, x, y);
        if (t === T_FLOOR && cutAt(f, x, y) !== 0) {
          halves++;
          const b = behind[cutAt(f, x, y)];
          assert.ok(b, `${tag}: floor ${x},${y} is cut as no tile of floor is (${cutAt(f, x, y)})`);
          assert.ok(!anyAround(x, y, 1, (nx, ny) => tileAt(f, nx, ny) === T_VOID && !(nx === x + b[0] && ny === y + b[1])), `${tag}: the half tile of floor at ${x},${y} touches void beside its wall or in front of it`);
        } else if (t === T_FLOOR) {
          assert.ok(!anyAround(x, y, 1, (nx, ny) => tileAt(f, nx, ny) === T_VOID), `${tag}: floor ${x},${y} touches void`);
        } else if (t === T_WALL) {
          assert.ok(anyAround(x, y, 1, (nx, ny) => isFloor(f, nx, ny)), `${tag}: wall ${x},${y} touches no floor`);
        }
      }
    }
  }
  assert.ok(halves > samples.length, `${halves} half tiles of floor in ${samples.length} dungeons: the corners are cut clean`);
});

test('floor keeps a 2-tile margin from the map edge', () => {
  for (const { f, tag } of samples) {
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        if (!isFloor(f, x, y)) continue;
        assert.ok(x >= 2 && y >= 2 && x <= f.w - 3 && y <= f.h - 3, `${tag}: floor ${x},${y} is too close to the edge`);
      }
    }
  }
});

test('no passage is narrower than 3 tiles and no wall between two floor areas is 1 tile thick, but at a door: its one tile, and the stone on either side of it', () => {
  // (DOORS, Version 18.5: the owner, "Give them a stone outline to make the door smaller than the hallway width". A door
  // is the middle tile of its doorway's three, and the tile on either side of it is wall: game/doors.ts)
  let doors = 0;
  for (const { f, tag } of samples) {
    const way = new Set<number>();
    const stone = new Set<number>();
    for (const d of f.doors ?? []) {
      if (d.kind !== 'door') continue;
      doors++;
      for (const i of doorWay(f, d)) way.add(i);
      for (const i of doorPiers(f, d)) stone.add(i);
    }
    for (let y = 1; y < f.h - 1; y++) {
      for (let x = 1; x < f.w - 1; x++) {
        if (isFloor(f, x, y)) {
          // every floor tile is part of some all-floor 3x3 block
          let wide = false;
          for (let cy = y - 1; cy <= y + 1 && !wide; cy++) {
            for (let cx = x - 1; cx <= x + 1 && !wide; cx++) wide = clearAround(f, cx, cy, 1);
          }
          if (way.has(y * f.w + x)) assert.ok(!wide, `${tag}: the door at ${x},${y} is one tile wide`);
          else assert.ok(wide, `${tag}: floor ${x},${y} is in a passage narrower than 3`);
        } else {
          const sliver = (isFloor(f, x - 1, y) && isFloor(f, x + 1, y)) || (isFloor(f, x, y - 1) && isFloor(f, x, y + 1));
          if (stone.has(y * f.w + x)) assert.ok(sliver, `${tag}: the stone beside a door at ${x},${y} stands between the room and the hallway, one tile thick`);
          else assert.ok(!sliver, `${tag}: 1-tile wall sliver at ${x},${y}`);
        }
      }
    }
  }
  assert.ok(doors > samples.length * 5, `${doors} doors in ${samples.length} dungeons`);
});

test('corridors are 3 tiles wide: they never run side by side or merge into a wider strip', () => {
  for (const { f, tag } of samples) {
    for (let y = 0; y < f.h - 3; y++) {
      for (let x = 0; x < f.w - 3; x++) {
        // a 4x4 block made only of corridor floor can exist only where two corridors have merged lengthways
        let all = true;
        for (let dy = 0; dy < 4 && all; dy++) for (let dx = 0; dx < 4 && all; dx++) all = isCorridor(f, x + dx, y + dy);
        assert.ok(!all, `${tag}: corridor wider than 3 at ${x},${y}`);
      }
    }
  }
});

test('every room has a doorway, and doorways are exactly 3 tiles wide, or one where a door stands (but where a corridor straight across the screen comes in at a corner)', () => {
  let across = 0;
  let withOne = 0;
  for (const { f, tag } of samples) {
    let here = 0;
    for (const r of f.rooms) {
      const doors = doorways(f, r);
      assert.ok(doors.length >= 1, `${tag}: room ${r.id} has no doorway`);
      // (DOORS, Version 18.5: a room's way in has a door in it, one tile wide; the boss hall's has the gate, all three)
      const own = (f.doors ?? []).filter(d => d.room === r.id && d.kind === 'door').length;
      let narrow = 0;
      for (const width of doors) {
        if (width === ACROSS_DOOR) here++;
        else if (width === 1) narrow++;
        else assert.equal(width, 3, `${tag}: room ${r.id} has a doorway ${width} tiles wide`);
      }
      assert.ok(own <= 1 && narrow === own, `${tag}: room ${r.id} has ${narrow} doorways one tile wide, and ${own} doors`);
      // (a room has one such corner to the right of the screen and one to the left: no more than one corridor at each)
      assert.ok(doors.filter(w => w === ACROSS_DOOR).length <= 2, `${tag}: room ${r.id} has ${doors.filter(w => w === ACROSS_DOOR).length} corridors across the screen at its corners`);
    }
    // (such a corridor has two ends, each at a room's corner)
    assert.equal(here % 2, 0, `${tag}: ${here} ends of corridors across the screen`);
    across += here / 2;
    if (here > 0) withOne++;
  }
  // (Version 18.3: about four dungeons in five have one)
  assert.ok(withOne >= samples.length * 0.6, `${withOne} of ${samples.length} dungeons have a corridor straight across the screen`);
  console.log(`(${across} corridors straight across the screen in ${withOne} of ${samples.length} dungeons)`);
});

test('a level is a tree: no loops, and every corridor joins exactly two rooms', () => {
  for (const { f, tag } of samples) {
    assert.equal(countLoops(f), 0, `${tag}: there is a loop to walk round`);
    const corridors = corridorsOf(f);
    assert.equal(corridors.length, f.rooms.length - 1, `${tag}: ${corridors.length} corridors for ${f.rooms.length} rooms`);
    for (const c of corridors) assert.equal(c.rooms.length, 2, `${tag}: a corridor touches rooms ${c.rooms.join(', ')}`);
    // every doorway belongs to one end of one corridor
    const doors = f.rooms.reduce((n, r) => n + doorways(f, r).length, 0);
    assert.equal(doors, 2 * (f.rooms.length - 1), `${tag}: ${doors} doorways`);
  }
});

test('the main path runs from the start to the boss, and every side branch is a dead end with a reward', () => {
  let twoRoom = 0;
  let branchTotal = 0;
  for (const { f, depth, tag } of samples) {
    const path = pathOf(f);
    const corridors = corridorsOf(f);
    const linked = (a: Room, b: Room): boolean => corridors.some(c => c.rooms.includes(a.id) && c.rooms.includes(b.id));
    for (let i = 1; i < path.length; i++) assert.ok(linked(path[i - 1], path[i]), `${tag}: path rooms ${i - 1} and ${i} are not joined`);
    // walking from the start, each room of the path is farther than the one before
    const dist = flowField(buildOpenGrid(f), f.w, f.h, Math.floor(f.start.x), Math.floor(f.start.y));
    const walk = (r: Room): number => dist[centreOf(r).y * f.w + centreOf(r).x];
    for (let i = 1; i < path.length; i++) assert.ok(walk(path[i]) > walk(path[i - 1]), `${tag}: path room ${i} is nearer the start than room ${i - 1}`);
    assert.equal(path[0].kind, 'start', tag);
    assert.equal(path[path.length - 1].kind, 'boss', tag);
    assert.equal(doorways(f, path[0]).length, 1, `${tag}: the start room has one way out`);
    assert.equal(doorways(f, path[path.length - 1]).length, 1, `${tag}: the boss hall has one way in`);

    // branches: each hangs off one room of the path (never the start or the boss hall), and no path room has two
    const off = f.rooms.filter(r => r.path < 0);
    const rewards = off.filter(r => r.kind === 'treasure' || r.kind === 'guardian');
    assert.equal(rewards.length, branches(depth), `${tag}: ${rewards.length} reward rooms`);
    const hosts: number[] = [];
    for (const end of rewards) {
      assert.equal(doorways(f, end).length, 1, `${tag}: ${end.kind} room ${end.id} is not a dead end`);
      // walk back from the reward room to the path
      let room = end;
      let from: Room | null = null;
      let steps = 0;
      while (room.path < 0) {
        const next = f.rooms.find(o => o !== room && o !== from && linked(room, o)) as Room;
        assert.ok(next, `${tag}: branch room ${room.id} leads nowhere`);
        from = room;
        room = next;
        steps++;
        assert.ok(steps <= 2, `${tag}: a branch is more than two rooms long`);
      }
      if (steps === 2) {
        twoRoom++;
        assert.equal((from as Room).kind, 'normal', `${tag}: the room before a reward is an ordinary one`);
        assert.equal(doorways(f, from as Room).length, 2, tag);
      }
      branchTotal++;
      assert.ok(room.path >= 1 && room.path <= path.length - 2, `${tag}: a branch hangs off path room ${room.path}`);
      hosts.push(room.path);
    }
    assert.equal(new Set(hosts).size, hosts.length, `${tag}: two branches hang off one room`);
    // the branch nearest the start always ends in a vault: no guardian in the opening rooms
    const firstHost = Math.min(...hosts);
    const firstEnd = rewards[hosts.indexOf(firstHost)];
    assert.equal(firstEnd.kind, 'treasure', `${tag}: the first branch ends in a ${firstEnd.kind} room`);
    // every room off the path is part of some branch
    assert.ok(off.every(r => r.kind === 'treasure' || r.kind === 'guardian' || r.kind === 'normal'), tag);
    // the branches are spread along the path: the first leaves in its first half, the last in its second half
    assert.ok(Math.min(...hosts) <= path.length / 2 && Math.max(...hosts) >= path.length / 2 - 1, `${tag}: branches at ${hosts.join(', ')}`);
  }
  // about half the branches have a room to cross before the reward
  const share = twoRoom / branchTotal;
  assert.ok(share > 0.3 && share < 0.7, `${(share * 100).toFixed(0)}% of branches are two rooms long`);
});

// ---------------------------------------------------------------------------------------------
// Generator: rooms

test('rooms are 7x7 to 14x12, at least 3 tiles apart, and mostly floor: nothing is taken from one but its corners', () => {
  for (const { f, tag } of samples) {
    f.rooms.forEach((r, i) => {
      assert.equal(r.id, i, `${tag}: room ids follow array order`);
      const long = Math.max(r.w, r.h);
      const short = Math.min(r.w, r.h);
      assert.ok(short >= 7 && short <= 12 && long <= 14, `${tag}: room ${i} is ${r.w}x${r.h}`);
      let floor = 0;
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (isFloor(f, x, y)) floor++;
      // (a corner cut c tiles takes the triangle of tiles behind the cut: c(c+1)/2 of them; the tiles along the cut itself are half floor, and floor)
      const cuts = cornerCuts(f, r);
      const lost = cuts.reduce((a, c) => a + (c * (c + 1)) / 2, 0);
      assert.equal(floor, r.w * r.h - lost, `${tag}: room ${i} (${r.w}x${r.h}, corners cut ${cuts.join('/')}) has ${floor} floor tiles`);
      // Clipped corners (1 to 3 tiles) may take a few tiles, never more. Since Version 18.2 a big
      // room may be AN EIGHT-SIDED HALL (every corner cut 3 to 5 by its size) or have A FLAT BACK
      // WALL (its back corner alone cut wide, up to 6; 3 in a treasure vault): those take more, and
      // seven tenths of the room is floor still. Never the room the hero arrives in, nor the boss's.
      assert.ok(cuts.every((c) => c <= 6), `${tag}: room ${i} has a corner cut ${Math.max(...cuts)} tiles`);
      if (cuts.every((c) => c <= 3)) assert.ok(floor >= r.w * r.h - 24 && floor >= r.w * r.h * 0.75, `${tag}: room ${i} has only ${floor} floor tiles`);
      else {
        assert.ok(floor >= r.w * r.h * 0.7, `${tag}: room ${i} (${r.w}x${r.h}, corners cut ${cuts.join('/')}) has only ${floor} floor tiles`);
        assert.ok(r.kind !== 'start' && r.kind !== 'boss', `${tag}: the ${r.kind} room has a corner cut wide (${cuts.join('/')})`);
        assert.ok(Math.min(r.w, r.h) >= 10, `${tag}: room ${i} is ${r.w}x${r.h}, and has a corner cut wide (${cuts.join('/')})`);
      }
      for (const o of f.rooms) {
        if (o.id <= r.id) continue;
        const gapX = Math.max(o.x - (r.x + r.w), r.x - (o.x + o.w));
        const gapY = Math.max(o.y - (r.y + r.h), r.y - (o.y + o.h));
        assert.ok(Math.max(gapX, gapY) >= 3, `${tag}: rooms ${r.id} and ${o.id} are closer than 3 tiles`);
      }
    });
    // room sizes are varied
    assert.ok(new Set(f.rooms.map(r => `${r.w}x${r.h}`)).size >= 5, `${tag}: room sizes are not varied`);
  }
});

test('room kinds: one start, one boss, elites along the path, a vault or a guardian at the end of each branch', () => {
  for (const { f, depth, tag } of samples) {
    const count = (kind: string): number => f.rooms.filter(r => r.kind === kind).length;
    assert.equal(count('start'), 1, tag);
    assert.equal(count('boss'), 1, tag);
    assert.equal(count('elite'), eliteRooms(depth), tag);
    assert.equal(count('treasure') + count('guardian'), branches(depth), tag);
    assert.ok(count('treasure') >= 1, `${tag}: no treasure vault`);
    assert.ok(count('guardian') >= 1, `${tag}: no guardian`);
    for (const r of f.rooms) {
      if (r.kind === 'elite') assert.ok(r.path >= 2, `${tag}: elite room at path place ${r.path}`);
      if (r.kind === 'treasure' || r.kind === 'guardian') assert.equal(r.path, -1, `${tag}: ${r.kind} room on the main path`);
    }
  }
});

test('the boss hall is at least 13x12; vaults are small rooms; a guardian has room to fight in', () => {
  for (const { f, tag } of samples) {
    const boss = f.rooms.find(r => r.kind === 'boss') as Room;
    assert.ok(isBossSized(boss), `${tag}: boss room is ${boss.w}x${boss.h}`);
    for (const r of f.rooms) {
      const long = Math.max(r.w, r.h);
      const short = Math.min(r.w, r.h);
      if (r.kind === 'treasure') assert.ok(long <= 9 && short <= 8, `${tag}: vault is ${r.w}x${r.h}`);
      if (r.kind === 'guardian') assert.ok(long >= 10 && short >= 9, `${tag}: guardian's room is ${r.w}x${r.h}`);
    }
  }
});

// ---------------------------------------------------------------------------------------------
// Generator: packs

test('packs stand on floor tile centres, away from the start, inside their room', () => {
  let roomPacks = 0;
  let roomy = 0;
  for (const { f, tag } of samples) {
    for (const p of f.packs) {
      const t = packTile(p);
      assert.equal(p.x - t.x, 0.5, `${tag}: pack x is not a tile centre`);
      assert.equal(p.y - t.y, 0.5, `${tag}: pack y is not a tile centre`);
      assert.ok(wholeFloor(f, t.x, t.y), `${tag}: pack at ${p.x},${p.y} is not on a whole tile of floor`);
      assert.ok(Math.hypot(p.x - f.start.x, p.y - f.start.y) >= 10, `${tag}: pack at ${p.x},${p.y} is within 10 tiles of the start`);
      if (p.roomId === -1) {
        // a corridor pack: on a corridor tile, in the middle of the 3-wide corridor
        assert.ok(isCorridor(f, t.x, t.y), `${tag}: pack with roomId -1 is inside a room`);
        assert.ok(clearOfWalls(f, t.x, t.y, 1), `${tag}: corridor pack at ${p.x},${p.y} hugs a wall`);
      } else {
        const room = f.rooms[p.roomId];
        assert.ok(room && inRoom(room, t.x, t.y), `${tag}: pack at ${p.x},${p.y} is outside room ${p.roomId}`);
        // at least 2 tiles from any wall (every room here is big enough to allow it)
        assert.ok(clearOfWalls(f, t.x, t.y, 1), `${tag}: pack at ${p.x},${p.y} hugs a wall`);
        roomPacks++;
        if (clearOfWalls(f, t.x, t.y, 2)) roomy++;
      }
    }
  }
  // ...and nearly always with two clear tiles on every side
  assert.ok(roomy >= roomPacks * 0.97, `only ${roomy} of ${roomPacks} room packs have 2 clear tiles all round`);
});

test('each kind of room holds the right packs', () => {
  for (const { f, tag } of samples) {
    for (const r of f.rooms) {
      const here = f.packs.filter(p => p.roomId === r.id);
      const normal = here.filter(p => p.tier === 'normal').length;
      const elite = here.filter(p => p.tier === 'elite').length;
      const what = `${tag}: ${r.kind} room ${r.id} has ${normal} normal + ${elite} elite packs`;
      const champion = here.filter(p => p.tier === 'champion').length;
      if (r.kind === 'start' || r.kind === 'boss') assert.equal(here.length, 0, what);
      else if (r.kind === 'normal') assert.ok(elite === 0 && champion === 0 && normal >= 1 && normal <= 3, what);
      else if (r.kind === 'elite') assert.ok(elite === 1 && champion === 0 && normal <= 1, what);
      else if (r.kind === 'guardian') assert.ok(champion === 1 && here.length === 1, `${what} + ${champion} guardian packs`);
      else assert.ok(elite === 0 && champion === 0 && normal === 1, what);
      // packs sharing a room keep 4 tiles apart
      for (let i = 0; i < here.length; i++) {
        for (let j = i + 1; j < here.length; j++) {
          const d = Math.hypot(here[i].x - here[j].x, here[i].y - here[j].y);
          assert.ok(d >= 4, `${tag}: two packs in room ${r.id} are ${d.toFixed(1)} tiles apart`);
        }
      }
    }
    const inCorridors = f.packs.filter(p => p.roomId === -1);
    assert.ok(inCorridors.length <= 4, `${tag}: ${inCorridors.length} corridor packs`);
    assert.ok(inCorridors.every(p => p.tier === 'normal'), `${tag}: elite pack in a corridor`);
    assert.ok(f.packs.every(p => p.roomId === -1 || (p.roomId >= 0 && p.roomId < f.rooms.length)), `${tag}: bad roomId`);
  }
});

test('bigger normal rooms get more packs', () => {
  let small = 0;
  let smallPacks = 0;
  let big = 0;
  let bigPacks = 0;
  for (const { f } of samples) {
    for (const r of f.rooms) {
      if (r.kind !== 'normal') continue;
      const n = f.packs.filter(p => p.roomId === r.id).length;
      if (r.w * r.h < 72) { small++; smallPacks += n; }
      if (r.w * r.h >= 121) { big++; bigPacks += n; }
    }
  }
  assert.ok(small > 0 && big > 0);
  assert.ok(bigPacks / big > smallPacks / small + 0.5, `big rooms average ${bigPacks / big} packs, small rooms ${smallPacks / small}`);
});

test('pack sizes fit the depth and the total is within 25% of the monster budget', () => {
  for (const { f, depth, tag } of samples) {
    for (const p of f.packs) {
      assert.ok(Number.isInteger(p.size), `${tag}: pack size ${p.size}`);
      if (p.tier === 'elite' || p.tier === 'champion') assert.ok(p.size >= 3 && p.size <= 5, `${tag}: ${p.tier} pack of ${p.size}`);
      else assert.ok(p.size >= normalPackMin(depth) && p.size <= normalPackMax(depth), `${tag}: normal pack of ${p.size}`);
      // corridor packs are small
      if (p.roomId === -1) assert.ok(p.size <= normalPackMin(depth) + 1, `${tag}: corridor pack of ${p.size}`);
    }
    const total = totalMonsters(f);
    const target = monsterTarget(depth);
    assert.ok(total >= target * 0.75 && total <= target * 1.25, `${tag}: ${total} monsters, budget ${target}`);
  }
  // depth 1 lands in the 105-135 band
  for (const s of samples.filter(x => x.depth === 1)) {
    const total = totalMonsters(s.f);
    assert.ok(total >= 105 && total <= 135, `${s.tag}: ${total} monsters`);
  }
});

// ---------------------------------------------------------------------------------------------
// Generator: props

test('props sit on floor, one per tile, never on or within 2 tiles of the start or boss tile', () => {
  for (const { f, tag } of samples) {
    const seen = new Set<number>();
    for (const p of f.props) {
      assert.ok(Number.isInteger(p.x) && Number.isInteger(p.y), `${tag}: prop at ${p.x},${p.y}`);
      assert.ok(wholeFloor(f, p.x, p.y), `${tag}: ${p.kind} at ${p.x},${p.y} is not on a whole tile of floor`);
      assert.ok(!seen.has(p.y * f.w + p.x), `${tag}: two props on ${p.x},${p.y}`);
      seen.add(p.y * f.w + p.x);
      for (const spot of [f.start, f.boss]) {
        const d = Math.max(Math.abs(p.x - Math.floor(spot.x)), Math.abs(p.y - Math.floor(spot.y)));
        assert.ok(d > 2, `${tag}: ${p.kind} at ${p.x},${p.y} is within 2 tiles of the start or boss tile`);
      }
    }
  }
});

test('solid props keep 2 tiles away from corridor floor', () => {
  for (const { f, tag } of samples) {
    for (const p of f.props) {
      if (!isSolid(p)) continue;
      assert.ok(!anyAround(p.x, p.y, 1, (x, y) => isCorridor(f, x, y)), `${tag}: ${p.kind} at ${p.x},${p.y} is next to a corridor`);
    }
  }
});

test('solid props never cut the start off from the boss or from a pack', () => {
  let freeTiles = 0;
  let reachedTiles = 0;
  for (const { f, tag } of samples) {
    const walk = buildWalkGrid(f);
    const dist = flowField(walk, f.w, f.h, Math.floor(f.start.x), Math.floor(f.start.y));
    const reach = (x: number, y: number): boolean => dist[Math.floor(y) * f.w + Math.floor(x)] !== UNREACHABLE;
    assert.ok(reach(f.boss.x, f.boss.y), `${tag}: boss point is walled off by props`);
    for (const p of f.packs) assert.ok(reach(p.x, p.y), `${tag}: pack at ${p.x},${p.y} is walled off by props`);
    for (let i = 0; i < walk.length; i++) {
      if (walk[i] !== 1) continue;
      freeTiles++;
      if (dist[i] !== UNREACHABLE) reachedTiles++;
    }
  }
  // props may box in the odd corner tile, but no more than that
  assert.ok(reachedTiles >= freeTiles * 0.999, `${freeTiles - reachedTiles} of ${freeTiles} free tiles are boxed in by props`);
});

test('braziers: 2-4 per room against a wall, 4-6 in the boss room', () => {
  for (const { f, tag } of samples) {
    const braziers = f.props.filter(p => p.kind === 'brazier');
    for (const b of braziers) {
      assert.ok(roomAt(f, b.x, b.y), `${tag}: brazier at ${b.x},${b.y} is not in a room`);
      // (against a wall, straight or slanting: a tile to one side of it is no whole tile of floor)
      const againstWall = !wholeFloor(f, b.x - 1, b.y) || !wholeFloor(f, b.x + 1, b.y) || !wholeFloor(f, b.x, b.y - 1) || !wholeFloor(f, b.x, b.y + 1);
      assert.ok(againstWall, `${tag}: brazier at ${b.x},${b.y} is not next to a wall`);
    }
    for (const r of f.rooms) {
      const n = braziers.filter(b => inRoom(r, b.x, b.y)).length;
      const [lo, hi] = r.kind === 'boss' ? [4, 6] : [2, 4];
      assert.ok(n >= lo && n <= hi, `${tag}: ${r.kind} room ${r.id} has ${n} braziers`);
    }
  }
});

test('chests: two in every treasure vault (near its centre, or against its flat back wall), at most one elsewhere', () => {
  let extra = 0;
  let central = 0;
  let against = 0;
  for (const { f, tag } of samples) {
    const chests = f.props.filter(p => p.kind === 'chest');
    const vaults = f.rooms.filter(r => r.kind === 'treasure');
    for (const vault of vaults) {
      const inside = chests.filter(c => inRoom(vault, c.x, c.y));
      assert.equal(inside.length, 2, `${tag}: ${inside.length} chests in vault ${vault.id}`);
      const mid = centreOf(vault);
      // Near the centre; or, in a vault with a flat back wall (Version 18.2), both against that
      // wall: each on a whole tile with a half tile of the wall that faces the eye beside it.
      const nearCentre = inside.every((c) => Math.hypot(c.x - mid.x, c.y - mid.y) <= 1.5);
      const againstBack = inside.every((c) => cutAt(f, c.x - 1, c.y) === CUT_FAR && cutAt(f, c.x, c.y - 1) === CUT_FAR);
      assert.ok(nearCentre || againstBack, `${tag}: the chests of vault ${vault.id} are neither near its centre nor against its flat back wall`);
      if (againstBack) against++;
      else central++;
    }
    const others = chests.filter(c => !vaults.some(v => inRoom(v, c.x, c.y)));
    assert.ok(others.length <= 1, `${tag}: ${others.length} extra chests`);
    for (const c of others) assert.equal(roomAt(f, c.x, c.y)?.kind, 'normal', `${tag}: extra chest is not in a normal room`);
    extra += others.length;
  }
  // "30% chance": allow a wide band around it
  const share = extra / samples.length;
  assert.ok(share > 0.15 && share < 0.45, `extra chest appeared in ${(share * 100).toFixed(0)}% of levels`);
  // (a vault has its flat back wall if it is big enough and no doorway is near the corner: about half of them)
  assert.ok(against > 0 && central > 0, `${against} vaults with their chests against a flat back wall, ${central} with them in the middle`);
  console.log(`(${against} vaults with their chests against a flat back wall, ${central} with them in the middle)`);
});

test('barrels and urns stand in clusters against walls in about half the rooms', () => {
  let roomsWith = 0;
  let rooms = 0;
  for (const { f, tag } of samples) {
    const pots = f.props.filter(p => p.kind === 'barrel' || p.kind === 'urn');
    for (const p of pots) {
      assert.ok(roomAt(f, p.x, p.y), `${tag}: ${p.kind} at ${p.x},${p.y} is not in a room`);
      assert.ok(!clearOfWalls(f, p.x, p.y, 2), `${tag}: ${p.kind} at ${p.x},${p.y} is far from any wall`);
      const neighbour = pots.some(q => Math.abs(q.x - p.x) + Math.abs(q.y - p.y) === 1);
      assert.ok(neighbour, `${tag}: lone ${p.kind} at ${p.x},${p.y}`);
    }
    for (const r of f.rooms) {
      const n = pots.filter(p => inRoom(r, p.x, p.y)).length;
      assert.ok(n === 0 || (n >= 2 && n <= 8), `${tag}: room ${r.id} has ${n} barrels/urns`);
      rooms++;
      if (n > 0) roomsWith++;
    }
  }
  const share = roomsWith / rooms;
  assert.ok(share > 0.35 && share < 0.65, `${(share * 100).toFixed(0)}% of rooms have a cluster`);
});

test('pillars: symmetric sets of 2 or 4 in big rooms only, clear of the boss point', () => {
  let bigRooms = 0;
  let withPillars = 0;
  for (const { f, tag } of samples) {
    const pillars = f.props.filter(p => p.kind === 'pillar');
    for (const p of pillars) assert.ok(roomAt(f, p.x, p.y), `${tag}: pillar at ${p.x},${p.y} is not in a room`);
    for (const r of f.rooms) {
      const mine = pillars.filter(p => inRoom(r, p.x, p.y));
      if (!isPillarRoom(r)) {
        assert.equal(mine.length, 0, `${tag}: pillars in ${r.w}x${r.h} room ${r.id}`);
        continue;
      }
      bigRooms++;
      if (mine.length === 0) continue;
      withPillars++;
      assert.ok(mine.length === 2 || mine.length === 4, `${tag}: ${mine.length} pillars in room ${r.id}`);
      // symmetric: turning the room half a turn about its middle maps the set onto itself
      for (const p of mine) {
        const mx = r.x + r.x + r.w - 1 - p.x;
        const my = r.y + r.y + r.h - 1 - p.y;
        assert.ok(mine.some(q => q.x === mx && q.y === my), `${tag}: pillars in room ${r.id} are not symmetric`);
      }
      if (r.kind === 'boss') {
        for (const p of mine) {
          const d = Math.hypot(p.x + 0.5 - f.boss.x, p.y + 0.5 - f.boss.y);
          assert.ok(d >= 5, `${tag}: pillar ${d.toFixed(1)} tiles from the boss point`);
        }
      }
    }
  }
  assert.ok(withPillars >= bigRooms * 0.9, `only ${withPillars} of ${bigRooms} big rooms have pillars`);
});

test('bones and rubble: about one per 40 floor tiles', () => {
  for (const { f, tag } of samples) {
    let floor = 0;
    for (let i = 0; i < f.tiles.length; i++) if (f.tiles[i] === T_FLOOR) floor++;
    const flat = f.props.filter(p => !isSolid(p));
    assert.ok(flat.every(p => p.kind === 'bones' || p.kind === 'rubble'), tag);
    const want = floor / 40;
    assert.ok(flat.length >= want * 0.7 && flat.length <= want * 1.3, `${tag}: ${flat.length} flat props on ${floor} floor tiles`);
  }
});

test('generation is fast (under 60 ms per level on average)', () => {
  const avg = generateMs / samples.length;
  assert.ok(avg < 60, `average ${avg.toFixed(1)} ms per level`);
});

// ---------------------------------------------------------------------------------------------
// nav.ts

test('buildOpenGrid and buildWalkGrid mark floor, and solid props and half tiles block only the walk grid', () => {
  const { f } = samples[0];
  const open = buildOpenGrid(f);
  const walk = buildWalkGrid(f);
  assert.equal(open.length, f.w * f.h);
  assert.equal(walk.length, f.w * f.h);
  for (let i = 0; i < open.length; i++) assert.equal(open[i], f.tiles[i] === T_FLOOR ? 1 : 0);
  const solid = new Set(f.props.filter(isSolid).map(p => p.y * f.w + p.x));
  assert.ok(solid.size > 0 && f.props.some(p => !isSolid(p)));
  // (a tile cut corner to corner is open, for what flies and what is seen, and shut to walking: nobody is steered through half a tile)
  const cut = f.cut;
  assert.ok(cut && cut.some((c, i) => c !== 0 && f.tiles[i] === T_FLOOR), 'this dungeon has half tiles of floor');
  for (let i = 0; i < walk.length; i++) assert.equal(walk[i], open[i] === 1 && !solid.has(i) && !(cut && cut[i] !== 0) ? 1 : 0);
});

test('flowField: distances on an open grid (10 per side step, 14 per diagonal)', () => {
  const { g, w, h } = grid(['.....', '.....', '.....', '.....', '.....']);
  const d = flowField(g, w, h, 0, 0);
  const at = (x: number, y: number): number => d[y * w + x];
  assert.equal(at(0, 0), 0);
  assert.equal(at(1, 0), 10);
  assert.equal(at(0, 3), 30);
  assert.equal(at(1, 1), 14);
  assert.equal(at(2, 1), 24);
  assert.equal(at(3, 4), 52);
  assert.equal(at(4, 4), 56);
  assert.equal(at(4, 0), 40);
});

test('flowField: walls block, and diagonal steps never cut a corner', () => {
  // The only way from the left side to the right is under the wall, through (2, 2).
  const { g, w, h } = grid(['..#..', '..#..', '.....']);
  const d = flowField(g, w, h, 0, 0);
  const at = (x: number, y: number): number => d[y * w + x];
  assert.equal(at(2, 0), UNREACHABLE); // wall tiles are never reached
  assert.equal(at(2, 1), UNREACHABLE);
  assert.equal(at(1, 1), 14);
  assert.equal(at(1, 2), 24);
  assert.equal(at(2, 2), 34); // not 28: (1,1) -> (2,2) would cut the wall's corner
  assert.equal(at(3, 2), 44);
  assert.equal(at(3, 1), 54); // not 48: (2,2) -> (3,1) would cut the corner too
  assert.equal(at(4, 1), 58);
  assert.equal(at(3, 0), 64);
  assert.equal(at(4, 0), 68);

  // A diagonal squeeze between two blocked tiles is not a way through at all.
  const pinch = grid(['.#', '#.']);
  const dp = flowField(pinch.g, pinch.w, pinch.h, 0, 0);
  assert.equal(dp[3], UNREACHABLE);

  // One blocked tile beside a diagonal is enough to forbid it, in all four diagonal directions:
  // the way round costs 20, the forbidden diagonal would cost 14.
  const a = grid(['.#', '..']);
  assert.equal(flowField(a.g, 2, 2, 0, 0)[3], 20); // (0,0) <- (1,1)
  assert.equal(flowField(a.g, 2, 2, 1, 1)[0], 20); // (1,1) <- (0,0)
  const b = grid(['#.', '..']);
  assert.equal(flowField(b.g, 2, 2, 1, 0)[2], 20); // (1,0) <- (0,1)
  assert.equal(flowField(b.g, 2, 2, 0, 1)[1], 20); // (0,1) <- (1,0)
  // ...and with both side tiles open the diagonal is used
  const open = grid(['..', '..']);
  assert.equal(flowField(open.g, 2, 2, 0, 0)[3], 14);
});

test('flowField: maxDist limits the field, unreachable is 65535, and `out` is reused', () => {
  const { g, w, h } = grid(['.....', '.....', '..#..', '.#.#.', '..#..']);
  const near = flowField(g, w, h, 0, 0, 2);
  const at = (x: number, y: number): number => near[y * w + x];
  assert.equal(at(2, 0), 20);
  assert.equal(at(1, 1), 14);
  assert.equal(at(2, 1), UNREACHABLE); // 24 would be more than 2 tiles
  assert.equal(at(3, 0), UNREACHABLE);

  const full = flowField(g, w, h, 0, 0);
  assert.equal(full[3 * w + 2], UNREACHABLE); // (2, 3) is walled in on all four sides
  assert.equal(full[4 * w + 4] !== UNREACHABLE, true);

  const buffer = new Uint16Array(w * h).fill(7);
  const again = flowField(g, w, h, 4, 0, Infinity, buffer);
  assert.equal(again, buffer);
  assert.equal(buffer[4], 0);
  assert.equal(buffer[0], 40);
  assert.equal(buffer[3 * w + 2], UNREACHABLE);

  // a target outside the grid reaches nothing
  assert.ok(flowField(g, w, h, -1, 9).every(v => v === UNREACHABLE));
});

test('flowDir: points downhill, follows a shortest path, and stops at the target', () => {
  const { g, w, h } = grid(['......#.', '.####.#.', '.#..#.#.', '.#.##...', '.#....#.', '.####.#.', '......#.']);
  const tx = 2;
  const ty = 2;
  const d = flowField(g, w, h, tx, ty);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const here = d[y * w + x];
      const v = flowDir(d, g, w, h, x + 0.5, y + 0.5);
      if (here === 0 || here === UNREACHABLE) {
        if (here === 0) assert.deepEqual(v, { x: 0, y: 0 });
        continue;
      }
      assert.ok(Math.abs(Math.hypot(v.x, v.y) - 1) < 1e-9, `direction at ${x},${y} is not a unit vector`);
      // the neighbour tile the direction points at
      const nx = x + (Math.abs(v.x) > 0.3 ? Math.sign(v.x) : 0);
      const ny = y + (Math.abs(v.y) > 0.3 ? Math.sign(v.y) : 0);
      assert.ok(Math.abs(nx - x) <= 1 && Math.abs(ny - y) <= 1 && (nx !== x || ny !== y));
      assert.ok(d[ny * w + nx] < here, `direction at ${x},${y} does not lead downhill`);
      // the step taken is one on a shortest path: its cost makes up the whole difference
      assert.equal(here - d[ny * w + nx], nx !== x && ny !== y ? 14 : 10, `step from ${x},${y} is not on a shortest path`);
      // no corner cutting on diagonal steps
      if (nx !== x && ny !== y) assert.ok(g[y * w + nx] === 1 && g[ny * w + x] === 1, `step from ${x},${y} cuts a corner`);
    }
  }
  // a tile the field never reached, with nothing reachable beside it, gives no direction
  const island = grid(['..#.', '..#.']);
  const di = flowField(island.g, island.w, island.h, 0, 0);
  assert.deepEqual(flowDir(di, island.g, island.w, island.h, 3.5, 0.5), { x: 0, y: 0 });
  // outside the grid: no direction
  assert.deepEqual(flowDir(di, island.g, island.w, island.h, -2, 0.5), { x: 0, y: 0 });
  // an `out` vector is filled and returned instead of a new one
  const out = { x: 9, y: 9 };
  assert.equal(flowDir(di, island.g, island.w, island.h, 1.5, 0.5, out), out);
  assert.deepEqual(out, { x: -1, y: 0 });
  // off-centre positions still aim at the neighbour's centre
  const v = flowDir(di, island.g, island.w, island.h, 1.9, 1.1);
  assert.ok(v.x < 0 && Math.abs(Math.hypot(v.x, v.y) - 1) < 1e-9);
});

test('flowDir: walking along it from every pack reaches the hero spawn on a real level', () => {
  const { f, tag } = samples[samples.length - 1]; // the deepest level
  const walk = buildWalkGrid(f);
  const d = flowField(walk, f.w, f.h, Math.floor(f.start.x), Math.floor(f.start.y));
  const v = { x: 0, y: 0 };
  for (const p of f.packs) {
    let x = p.x;
    let y = p.y;
    let steps = 0;
    while (d[Math.floor(y) * f.w + Math.floor(x)] !== 0 && steps < 20000) {
      flowDir(d, walk, f.w, f.h, x, y, v);
      assert.ok(v.x !== 0 || v.y !== 0, `${tag}: stuck at ${x},${y}`);
      x += v.x * 0.2;
      y += v.y * 0.2;
      assert.equal(walk[Math.floor(y) * f.w + Math.floor(x)], 1, `${tag}: walked into a blocked tile at ${x},${y}`);
      steps++;
    }
    assert.ok(steps < 20000, `${tag}: never arrived from pack at ${p.x},${p.y}`);
  }
});

test('lineOfSight: clear in the open, blocked by walls', () => {
  const { g, w, h } = grid(['.......', '...#...', '...#...', '.......', '.......']);
  assert.ok(lineOfSight(g, w, h, 0.5, 0.5, 6.5, 0.5)); // along the open top row
  assert.ok(lineOfSight(g, w, h, 0.5, 4.5, 6.5, 3.5)); // below the wall
  assert.ok(lineOfSight(g, w, h, 1.2, 1.7, 1.2, 1.7)); // a point sees itself
  assert.ok(lineOfSight(g, w, h, 0.5, 0.5, 0.5, 4.5)); // straight down
  assert.ok(!lineOfSight(g, w, h, 0.5, 1.5, 6.5, 1.5)); // straight through the wall
  assert.ok(!lineOfSight(g, w, h, 6.5, 1.5, 0.5, 1.5)); // and back
  assert.ok(!lineOfSight(g, w, h, 1.5, 0.5, 5.5, 3.5)); // diagonal through the wall
  assert.ok(!lineOfSight(g, w, h, 2.1, 2.9, 4.9, 1.1)); // shallow diagonal through the wall
  assert.ok(lineOfSight(g, w, h, 2.9, 0.9, 4.1, 0.9)); // just above the wall's top
  assert.ok(!lineOfSight(g, w, h, 2.9, 1.1, 4.1, 1.1)); // just below it
  assert.ok(!lineOfSight(g, w, h, 3.5, 1.5, 0.5, 0.5)); // starting inside a wall
  assert.ok(!lineOfSight(g, w, h, 0.5, 0.5, 3.5, 2.5)); // ending inside a wall
  assert.ok(!lineOfSight(g, w, h, 0.5, 0.5, 9.5, 0.5)); // ending outside the grid
  assert.ok(!lineOfSight(g, w, h, -1, 0.5, 2.5, 0.5)); // starting outside the grid
});

test('lineOfSight: no peeking through the crack between two diagonal walls', () => {
  const crack = grid(['.#', '#.']);
  assert.ok(!lineOfSight(crack.g, 2, 2, 0.5, 0.5, 1.5, 1.5));
  assert.ok(!lineOfSight(crack.g, 2, 2, 1.5, 1.5, 0.5, 0.5));
  const oneWall = grid(['.#', '..']);
  assert.ok(!lineOfSight(oneWall.g, 2, 2, 0.5, 0.5, 1.5, 1.5)); // exactly through the wall's corner counts as blocked
  assert.ok(lineOfSight(oneWall.g, 2, 2, 0.5, 0.5, 1.5, 1.6)); // just past the corner is clear
  const open = grid(['..', '..']);
  assert.ok(lineOfSight(open.g, 2, 2, 0.5, 0.5, 1.5, 1.5));
});

test('lineOfSight: agrees with fine sampling on a real level, and is the same both ways', () => {
  const { f } = samples[Math.min(3, samples.length - 1)];
  const open = buildOpenGrid(f);
  const rng = new RNG(99);
  const floorTiles: number[] = [];
  for (let i = 0; i < open.length; i++) if (open[i] === 1) floorTiles.push(i);
  let seen = 0;
  let blocked = 0;
  for (let k = 0; k < 4000; k++) {
    const a = rng.pick(floorTiles);
    const b = rng.pick(floorTiles);
    const x0 = (a % f.w) + rng.range(0.05, 0.95);
    const y0 = Math.floor(a / f.w) + rng.range(0.05, 0.95);
    // mostly nearby targets, so a fair share of the lines are clear
    const far = k % 4 === 0;
    const x1 = far ? (b % f.w) + rng.range(0.05, 0.95) : x0 + rng.range(-9, 9);
    const y1 = far ? Math.floor(b / f.w) + rng.range(0.05, 0.95) : y0 + rng.range(-9, 9);
    const los = lineOfSight(open, f.w, f.h, x0, y0, x1, y1);
    assert.equal(lineOfSight(open, f.w, f.h, x1, y1, x0, y0), los, 'line of sight differs between directions');
    // walk the segment in small steps: a blocked sample means there can be no line of sight
    let sampleBlocked = false;
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.02);
    for (let s = 0; s <= n && !sampleBlocked; s++) {
      const t = n === 0 ? 0 : s / n;
      const x = Math.floor(x0 + (x1 - x0) * t);
      const y = Math.floor(y0 + (y1 - y0) * t);
      if (x < 0 || y < 0 || x >= f.w || y >= f.h || open[y * f.w + x] !== 1) sampleBlocked = true;
    }
    if (sampleBlocked) assert.ok(!los, `sees through a wall from ${x0},${y0} to ${x1},${y1}`);
    if (los) seen++;
    else blocked++;
  }
  assert.ok(seen > 200 && blocked > 200, `${seen} clear and ${blocked} blocked lines`);
});

test('scatter: distinct walkable tile centres, nearest first, repeatable', () => {
  const { f } = samples[Math.min(5, samples.length - 1)];
  const walk = buildWalkGrid(f);
  for (const p of f.packs) {
    const spots = scatter(walk, f.w, f.h, p.x, p.y, p.size, new RNG(5));
    assert.equal(spots.length, p.size);
    const keys = new Set<string>();
    let last = -1;
    for (const s of spots) {
      assert.equal(s.x - Math.floor(s.x), 0.5);
      assert.equal(s.y - Math.floor(s.y), 0.5);
      assert.equal(walk[Math.floor(s.y) * f.w + Math.floor(s.x)], 1, 'scatter picked a blocked tile');
      keys.add(`${s.x},${s.y}`);
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      assert.ok(d >= last, 'scatter is not nearest first');
      assert.ok(d <= 4, `scatter put a monster ${d.toFixed(1)} tiles from its pack centre`);
      last = d;
    }
    assert.equal(keys.size, spots.length, 'scatter returned a tile twice');
    assert.deepEqual(spots[0], { x: p.x, y: p.y }); // the pack centre itself comes first
    assert.deepEqual(scatter(walk, f.w, f.h, p.x, p.y, p.size, new RNG(5)), spots);
  }
});

test('scatter: stays on the near side of walls, and copes with tight or blocked spots', () => {
  // a 3x3 pocket on the left, a big area on the right, a solid wall between
  const { g, w, h } = grid(['...#......', '...#......', '...#......']);
  const spots = scatter(g, w, h, 1.5, 1.5, 20, new RNG(1));
  assert.equal(spots.length, 9); // only the pocket's tiles, not 20
  assert.ok(spots.every(s => s.x < 3));
  // centre on a blocked tile: uses the nearest walkable tiles instead
  const moved = scatter(g, w, h, 3.5, 1.5, 3, new RNG(1));
  assert.equal(moved.length, 3);
  assert.ok(moved.every(s => g[Math.floor(s.y) * w + Math.floor(s.x)] === 1));
  // nothing asked for, nothing given; nothing walkable, nothing given
  assert.deepEqual(scatter(g, w, h, 1.5, 1.5, 0, new RNG(1)), []);
  const solid = grid(['###', '###']);
  assert.deepEqual(scatter(solid.g, solid.w, solid.h, 1.5, 0.5, 4, new RNG(1)), []);
  // different random streams give different groups
  const big = grid(new Array<string>(12).fill('............'));
  const a = scatter(big.g, big.w, big.h, 6.5, 6.5, 6, new RNG(1));
  const b = scatter(big.g, big.w, big.h, 6.5, 6.5, 6, new RNG(2));
  assert.notDeepEqual(a, b);
});
