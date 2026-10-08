// DOORS AND THE BOSS'S GATE (src/game/doors.ts): Version 18.5.
//
// The owner, 7 Oct 2026, 14:01: "After walls, let’s move decorations back and do doors and gates.
// They’ll be themed for the dungeon style, these I’m think wrought iron jail style bar doors that
// swing open, and that same bar style for gates going up and down with the spikes on the bottom.
// Classic castle style. [...] Dungeon Boss always has a big gate that locks you in with him once
// you pass through the opening. They can be closed with levers or switches nearby to open them.
// Doors are always unlocked and open as you get near them." And of the first pictures, 16:57:
// "[...] the doors look too much like the gate.  Give them a stone outline to make the door
// smaller than the hallway width.  Have it open from one side, not from the middle on both sides".
// Pictures of what is built here went to him from 17:35 on, with the question "is the look in
// doors_and_gates_second_look.png right to build?"; his answer, 17:54 and 18:02: "Yes, the new
// doors and gates look very [good]." ("dim was a slip. It was supposed to say they look good.")
// So the map-maker's switch for doors is ON since Version 18.5. (These tests set it for themselves
// wherever they ask about a level with doors or without, and put it back.)
//
// What is held here:
//   - the switch is on in the game; and with it off nothing has a door, and a dungeon is what it
//     was in Version 18.4;
//   - laying doors takes no dice: a dungeon with them is the dungeon it was, but for the stone on
//     either side of each door (two tiles of floor become wall, and what lay on them is gone);
//   - EVERY ROOM BUT THE FIRST HAS ONE WAY IN, the doorway toward the start, and a door stands in
//     it (in the boss hall's, the boss's gate); the doorways that lead on are open as ever; every
//     room can still be reached;
//   - a door is ONE TILE WIDE, the middle of its doorway's three, with wall on either side;
//   - it is as wide for a brute as for anybody: the stone beside it holds a big body off no
//     further than a small one, and a brute comes through;
//   - a hero who walks at the stone beside a door is eased into the door, from anywhere across
//     the hallway, by the stick or by the keys; and at no other wall;
//   - a door opens for the hero when he comes near, in a third of a second, and stays open; NO
//     MONSTER OPENS ONE, asleep or awake (the owner, 7 Oct 2026, 20:16: "I don’t want monsters to
//     open doors"), and a shut door holds a monster that walks and one that flies, and stops
//     sight and shots both ways, so that nothing behind it wakes; open, it stops nothing;
//   - WHAT IS SHUT IN A ROOM IS OUT OF THE HERO'S REACH: a blast set off against the door, a rain
//     of arrows or an orb aimed past it, an arc, a fire on the ground do not touch what stands
//     behind it, and it is no fight; and whatever is shut in cannot come at the hero (should a
//     room ever have a second way in, the test of that says so);
//   - the dead that rise for a new player's first word rise on the hero's side of a shut door;
//   - of the walls beside a door, the one a back wall runs on into stands, and the others are
//     left out as the walls' own rule has it;
//   - the boss's gate is up until the hero is well inside the hall, then down, and nothing passes
//     it until the boss is dead.
//   run: tsx --test tests/doors.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { WALLS_FADING } from '../src/art/ground';
import type { RNG } from '../src/engine/rng';
import { MONSTERS, TUNE } from '../src/game/defs';
import { DOORS, DOOR_NEAR, DOOR_SWING, GATE_FALL, GATE_INSIDE, GATE_RISE, PIER_HOLD, doorFace, doorLine, doorMiddle, doorPiers, doorTiles, doorWay, doorways, insideBy, makeDoors, pierGrid, shutGrid, stepDoors } from '../src/game/doors';
import type { DoorInst } from '../src/game/doors';
import { generateFloor } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { makeDungeon, makeTown } from '../src/game/level';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { DoorSpot, Element, Floor } from '../src/game/types';
import { FACE_LEFT, FACE_RIGHT, wallFaces, wallsAway } from '../src/render/walls';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

const DT = 1 / 60;

/** The map-maker's switch for doors, set for the length of a test and put back. */
function doorsSet<T>(on: boolean, run: () => T): T {
  const was = DOORS.on;
  DOORS.on = on;
  try {
    return run();
  } finally {
    DOORS.on = was;
  }
}

type Inner = {
  rng: RNG;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  free: (grid: Uint8Array, x: number, y: number, r: number) => boolean;
  damageMonster: (m: Monster, dmg: number, el: Element, crit: boolean, skill: number) => void;
  hitMonster: (m: Monster, i: number, frac: number, quiet: boolean) => void;
  blast: (i: number, cx: number, cy: number, rad: number, frac: number, style: 'blast') => void;
  shutIn: (m: { x: number; y: number }) => boolean;
  rise: () => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** A run in dungeon number `depth`, laid with doors; nothing in it but the boss, who sleeps; a hero nothing can hurt. */
function dungeon(seed: number, depth: number, cls: 'warrior' | 'ranger' | 'mage' = 'warrior'): Game {
  return doorsSet(true, () => {
    const g = new Game(cls, seed);
    g.depth = depth;
    g.enterDungeon();
    g.monsters = g.monsters.filter((m) => m.boss);
    g.hero.invuln = 1e9;
    return g;
  });
}
/** Steps of the game with nobody at the controls; the events of all of them. */
function steps(g: Game, n: number): GameEvent[] {
  const out: GameEvent[] = [];
  for (let k = 0; k < n; k++) {
    g.events.length = 0;
    g.update(DT, emptyControls());
    out.push(...g.events);
  }
  return out;
}
const inARoom = (f: Floor, x: number, y: number): boolean => f.rooms.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
const whole = (f: Floor, x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_FLOOR && !(f.cut && f.cut[y * f.w + x] !== 0);
const roomGrid = (f: Floor): Uint8Array => {
  const g = new Uint8Array(f.w * f.h);
  for (const r of f.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) g[y * f.w + x] = 1;
  return g;
};
/** How many steps of floor each tile is from the level's start (-1: not reached). */
function stepsFromStart(f: Floor): Int32Array {
  const far = new Int32Array(f.w * f.h).fill(-1);
  const queue = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
  far[queue[0]] = 0;
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    for (const j of [i + 1, i - 1, i + f.w, i - f.w]) {
      if (j < 0 || j >= far.length || far[j] >= 0 || f.tiles[j] !== T_FLOOR) continue;
      far[j] = far[i] + 1;
      queue.push(j);
    }
  }
  return far;
}
/** The tile of a doorway that is passed through (the middle of its three), and the room's tile just inside it. */
function passage(f: Floor, d: DoorSpot): { mid: number; within: number } {
  const line = doorLine(d);
  return d.alongX ? { mid: line * f.w + d.a + 1, within: (line - d.out) * f.w + d.a + 1 } : { mid: (d.a + 1) * f.w + line, within: (d.a + 1) * f.w + (line - d.out) };
}

test('the switch is on in the game: a dungeon has doors and the town has none; with it off no dungeon has a door, and no level keeps one', () => {
  assert.equal(DOORS.on, true, 'on the owner\'s word of 7 Oct 2026 about its pictures (17:54, and 18:02)');
  for (const [depth, seed] of [[1, 3], [2, 6], [7, 41]]) {
    const doors = generateFloor(depth, seed).doors ?? [];
    assert.ok(doors.length >= 5 && doors.filter((d) => d.kind === 'bossgate').length === 1, `dungeon ${depth}, seed ${seed}: ${doors.length} doors and gates, one of them the boss's`);
  }
  const lit = makeDungeon(2, 6);
  assert.ok(lit.doors.length >= 5 && lit.pier !== null);
  assert.deepEqual(makeTown(7).doors, [], 'the town has none either way');
  assert.equal(makeTown(7).pier, null);
  doorsSet(false, () => {
    for (const [depth, seed] of [[1, 3], [2, 6], [7, 41]]) assert.equal(generateFloor(depth, seed).doors, undefined);
    const L = makeDungeon(2, 6);
    assert.deepEqual(L.doors, []);
    assert.equal(L.pier, null, 'and no stone beside one');
    const g = new Game('warrior', 6);
    g.depth = 2;
    g.enterDungeon();
    assert.equal(g.level.doors.length, 0);
    // (and a game of it goes on as it always did: a few seconds of it emit nothing about a door)
    g.hero.invuln = 1e9;
    assert.ok(!steps(g, 240).some((e) => e.t === 'door'));
  });
});

/** Is a room come into at a corner (by a corridor straight across the screen), and by no doorway? Asked of the tiles: no run of three tiles of corridor floor in the row of wall along any of its sides. */
function comeIntoAtACorner(f: Floor, r: Floor['rooms'][number]): boolean {
  return doorways(f, r, roomGrid(f)).length === 0;
}

/**
 * The first thing of two levels that differs, by name (null: nothing does). Asked piece by piece:
 * a level is far too big to hand to deepEqual, which writes out the whole of both when they differ
 * (it was killed for want of memory doing so).
 */
function differs(a: Floor, b: Floor, but: readonly string[] = []): string | null {
  const ka = Object.keys(a).filter((k) => !but.includes(k)).sort();
  const kb = Object.keys(b).filter((k) => !but.includes(k)).sort();
  if (ka.join() !== kb.join()) return `what it holds (${ka.join()} / ${kb.join()})`;
  for (const k of ka) {
    const va = (a as unknown as Record<string, unknown>)[k];
    const vb = (b as unknown as Record<string, unknown>)[k];
    if (ArrayBuffer.isView(va) && ArrayBuffer.isView(vb)) {
      const xa = va as unknown as ArrayLike<number>;
      const xb = vb as unknown as ArrayLike<number>;
      if (xa.length !== xb.length) return `${k} (its length)`;
      for (let i = 0; i < xa.length; i++) if (xa[i] !== xb[i]) return `${k}[${i}]`;
      continue;
    }
    if (JSON.stringify(va) !== JSON.stringify(vb)) return k;
  }
  return null;
}

test('laying doors takes no dice: with the switch on a dungeon is the dungeon it was, but for the stone beside its doors (and a boss hall that was come into at a corner is set down again, with a doorway)', () => {
  let same = 0;
  let moved = 0;
  let piers = 0;
  let cleared = 0;
  for (const depth of [1, 2, 3, 5, 9, 12]) {
    for (let k = 0; k < 20; k++) {
      const seed = 400 + depth * 53 + k * 31;
      const what = `dungeon ${depth}, seed ${seed}`;
      const off = doorsSet(false, () => generateFloor(depth, seed));
      const on = doorsSet(true, () => generateFloor(depth, seed));
      assert.ok(on.doors !== undefined && on.doors.length > 0, `${what}: doors are laid`);
      const boss = off.rooms.find((r) => r.kind === 'boss');
      assert.ok(boss);
      if (boss && comeIntoAtACorner(off, boss)) {
        // THE ONE THING THE MAP-MAKER DOES OTHERWISE: the boss "always has a big gate", and a gate needs a doorway
        moved++;
        const hall = on.rooms.find((r) => r.kind === 'boss');
        assert.ok(hall && (on.doors ?? []).some((d) => d.room === hall.id && d.kind === 'bossgate'), `${what}: with doors its boss hall has a doorway, and the gate in it`);
        continue;
      }
      same++;
      assert.equal(differs(on, off, ['doors', 'tiles', 'props']), null, `${what}: everything but its tiles and its things is as it was`);
      // its tiles: the two beside each door are wall, and were floor; every other tile is as it was
      const stone = new Set<number>();
      for (const d of on.doors ?? []) for (const i of doorPiers(on, d)) stone.add(i);
      for (let i = 0; i < on.tiles.length; i++) {
        if (stone.has(i)) assert.deepEqual([off.tiles[i], on.tiles[i]], [T_FLOOR, T_WALL], `${what}: the stone beside a door at ${i % on.w},${Math.floor(i / on.w)} was floor and is wall`);
        else if (on.tiles[i] !== off.tiles[i]) assert.ok(false, `${what}: tile ${i % on.w},${Math.floor(i / on.w)} is another, and no door stands by it`);
      }
      piers += stone.size;
      // its things: those that lay where the stone now stands are gone, and no other
      const kept = off.props.filter((p) => !stone.has(p.y * off.w + p.x));
      assert.deepEqual(on.props, kept, `${what}: its things, less what lay under the stone`);
      cleared += off.props.length - kept.length;
    }
  }
  console.log(`(${same} dungeons the same with doors as without, but for ${piers} tiles of stone beside doors, from under which ${cleared} things were taken; ${moved} whose boss hall was come into at a corner, and is set down again)`);
  assert.ok(same > 100 && moved > 0 && moved < 20 && piers > same * 20, `${same} the same, ${moved} with the hall set down again, ${piers} tiles of stone`);
});

const SAMPLES: { depth: number; seed: number; f: Floor; off: Floor }[] = [];
for (const depth of [1, 2, 3, 5, 8, 12]) {
  for (let k = 0; k < 8; k++) {
    const seed = 9100 + depth * 71 + k * 29;
    SAMPLES.push({ depth, seed, f: doorsSet(true, () => generateFloor(depth, seed)), off: doorsSet(false, () => generateFloor(depth, seed)) });
  }
}

test('every room but the first has one way in, the doorway toward the start, and a door stands in it; the doorways that lead on are open; a door is one tile wide with wall on either side', () => {
  let doors = 0;
  let gates = 0;
  let onward = 0;
  let cornered = 0;
  let rooms = 0;
  for (const s of SAMPLES) {
    const f = s.f;
    const what = `dungeon ${s.depth}, seed ${s.seed}`;
    const all = f.doors ?? [];
    // (the doorways are asked of the level as it was laid without doors: a door narrows its own)
    const before = s.off;
    const hallBefore = before.rooms.find((r) => r.kind === 'boss');
    if (hallBefore && !comeIntoAtACorner(before, hallBefore)) {
      const grid = roomGrid(before);
      const far = stepsFromStart(before);
      const first = before.rooms.find((r) => before.start.x >= r.x && before.start.y >= r.y && before.start.x < r.x + r.w && before.start.y < r.y + r.h);
      assert.ok(first, `${what}: the start is in a room`);
      const want: DoorSpot[] = [];
      for (const r of before.rooms) {
        rooms++;
        const ways = doorways(before, r, grid);
        const inWays = ways.filter((d) => {
          const p = passage(before, d);
          return far[p.mid] >= 0 && far[p.within] > far[p.mid];
        });
        onward += ways.length - inWays.length;
        if (r === first) assert.equal(inWays.length, 0, `${what}: the first room has no way in, only ways on`);
        else if (inWays.length === 0) {
          cornered++;
          assert.ok(r.kind !== 'boss', `${what}: the boss hall is never come into at a corner`);
        } else assert.equal(inWays.length, 1, `${what}: room ${r.id} has one way in`);
        for (const d of inWays) want.push({ ...d, kind: r.kind === 'boss' ? 'bossgate' : 'door' });
      }
      assert.deepEqual(all, want, `${what}: a door in every room's way in, the gate in the boss hall's, and nowhere else`);
    }
    // (a dungeon whose boss hall was set down again with doors is another dungeon: what follows is asked of it all the same)
    for (const d of all) {
      const r = f.rooms.find((q) => q.id === d.room);
      assert.ok(r, `${what}: a door of a room that is there`);
      if (!r) continue;
      // where the room ends on that side, and which way the corridor lies
      const plane = d.alongX ? (d.near ? r.y + r.h : r.y) : d.near ? r.x + r.w : r.x;
      assert.equal(d.plane, plane, `${what}: its line is where the room's floor ends`);
      assert.equal(d.out, d.near ? 1 : -1, `${what}: a side toward the eye has its corridor toward the eye`);
      assert.equal(doorFace(d), doorLine(d) + 1, 'it stands on the front edge of its row of wall');
      assert.equal(doorFace(d), d.near ? d.plane + 1 : d.plane, 'which in a back wall is the room\'s edge, and on a side toward the eye a tile further out');
      const tiles = doorTiles(f, d);
      const way = doorWay(f, d);
      const stone = doorPiers(f, d);
      if (d.kind === 'door') {
        doors++;
        assert.deepEqual([way, stone], [[tiles[1]], [tiles[0], tiles[2]]], 'a door: the middle tile is the way, the other two its stone');
        for (const i of stone) assert.equal(f.tiles[i], T_WALL, `${what}: the stone beside the door at ${i % f.w},${Math.floor(i / f.w)} is wall`);
      } else {
        gates++;
        assert.deepEqual([way, stone], [tiles, []], 'the gate: all three tiles are the way, and it has no stone in the doorway');
      }
      for (const i of way) {
        const x = i % f.w;
        const y = Math.floor(i / f.w);
        assert.ok(whole(f, x, y) && !inARoom(f, x, y), `${what}: ${x},${y} of a doorway is corridor floor`);
        // (behind it, the room's own floor; before it, the corridor's)
        const bx = d.alongX ? x : x - d.out;
        const by = d.alongX ? y - d.out : y;
        assert.ok(whole(f, bx, by) && bx >= r.x && by >= r.y && bx < r.x + r.w && by < r.y + r.h, `${what}: whole floor of room ${r.id} behind ${x},${y}`);
        assert.ok(whole(f, 2 * x - bx, 2 * y - by), `${what}: floor of the corridor before ${x},${y}`);
        // nothing of height at a door
        assert.equal(f.height ? f.height[i] : 0, 0);
        assert.equal(f.stair ? f.stair[i] : 0, 0);
      }
      // nothing lies or stands where the stone is
      for (const i of stone) {
        assert.ok(!f.props.some((p) => p.y * f.w + p.x === i), `${what}: no thing under the stone at ${i % f.w},${Math.floor(i / f.w)}`);
        assert.ok(!f.packs.some((p) => Math.floor(p.y) * f.w + Math.floor(p.x) === i), `${what}: no pack in the stone`);
      }
      // its middle is the middle of the tile that is passed through; "inside" is the room
      const m = doorMiddle(d);
      assert.deepEqual([Math.floor(m.x), Math.floor(m.y)], [tiles[1] % f.w, Math.floor(tiles[1] / f.w)]);
      assert.ok(insideBy(d, r.x + r.w / 2, r.y + r.h / 2) > 1, `${what}: the room's middle is inside`);
      assert.ok(insideBy(d, m.x, m.y) < 0, `${what}: the doorway's own tile is outside the line`);
    }
    // the grid of the stone, for the rule of big bodies
    const grid2 = pierGrid(f);
    let count = 0;
    if (grid2) for (let i = 0; i < grid2.length; i++) count += grid2[i];
    assert.equal(count, all.filter((d) => d.kind === 'door').length * 2);
    // EVERY ROOM CAN STILL BE REACHED, and the boss: through doors one tile wide
    const reach = stepsFromStart(f);
    for (const r of f.rooms) {
      let any = false;
      for (let y = r.y; y < r.y + r.h && !any; y++) for (let x = r.x; x < r.x + r.w && !any; x++) any = reach[y * f.w + x] >= 0;
      assert.ok(any, `${what}: room ${r.id} is reached from the start`);
    }
    assert.ok(reach[Math.floor(f.boss.y) * f.w + Math.floor(f.boss.x)] >= 0, `${what}: the boss is reached`);
  }
  console.log(`(${rooms} rooms: ${doors} doors and ${gates} boss's gates in their ways in; ${onward} doorways that lead on, open as ever; ${cornered} rooms come into at a corner, with no door)`);
  assert.ok(doors > rooms * 0.6 && gates === SAMPLES.length && onward > doors * 0.8, `${doors} doors, ${gates} gates, ${onward} open doorways in ${rooms} rooms`);
});

test('the boss hall has one way in, a doorway, and the boss\'s gate stands in it', () => {
  for (const s of SAMPLES) {
    const f = s.f;
    const boss = f.rooms.find((r) => r.kind === 'boss');
    assert.ok(boss);
    if (!boss) continue;
    const gates = (f.doors ?? []).filter((d) => d.kind === 'bossgate');
    const ofHall = (f.doors ?? []).filter((d) => d.room === boss.id);
    // (the owner: the boss "ALWAYS has a big gate that locks you in with him". So where the map-maker lays doors it never
    // sets the boss hall off diagonally from the last room, to be come into at a corner, where no gate can stand: dungeon.ts, grow)
    assert.equal(ofHall.length, 1, `dungeon ${s.depth}, seed ${s.seed}: the boss hall has one way in, a doorway`);
    assert.deepEqual(gates, ofHall, 'the gate is the boss hall\'s, and nothing else of the hall\'s is a door');
    // (its doorway is as wide as ever: three tiles of floor)
    for (const i of doorTiles(f, gates[0])) assert.equal(f.tiles[i], T_FLOOR);
  }
});

test('a door opens for a body that comes near, in a third of a second, and stays open; the gate is not opened by coming near', () => {
  const spot: DoorSpot = { kind: 'door', room: 0, alongX: true, near: false, a: 10, plane: 20, out: -1 };
  const m = doorMiddle(spot);
  assert.deepEqual(m, { x: 11.5, y: 19.5 }, 'the middle of the tile that is passed through');
  assert.deepEqual([doorLine(spot), doorFace(spot)], [19, 20]);
  assert.deepEqual([doorLine({ ...spot, near: true, out: 1 }), doorFace({ ...spot, near: true, out: 1 })], [20, 21]);
  const door: DoorInst = { spot, open: 0, want: 0 };
  // nobody near: it stays shut
  assert.deepEqual(stepDoors([door], [{ x: m.x + DOOR_NEAR + 0.05, y: m.y }], DT), []);
  assert.deepEqual([door.open, door.want], [0, 0]);
  // somebody within reach of it, on either side of it: it begins to open, and says so once
  assert.deepEqual(stepDoors([door], [{ x: m.x, y: m.y + DOOR_NEAR - 0.05 }], DT), [door]);
  assert.equal(door.want, 1);
  assert.ok(door.open > 0 && door.open < 1);
  assert.deepEqual(stepDoors([door], [{ x: m.x, y: m.y + 1 }], DT), [], 'it began once');
  // it is open in the time a door takes, and not much sooner
  const before = door.open;
  let t = DT * 2;
  while (door.open < 1) {
    stepDoors([door], [], DT);
    t += DT;
    assert.ok(t < 1);
  }
  assert.ok(before < 0.2 && t > DOOR_SWING * 0.9 && t < DOOR_SWING + 3 * DT, `open after ${t.toFixed(2)} seconds`);
  // and it stays open when everybody has gone
  for (let k = 0; k < 600; k++) stepDoors([door], [], DT);
  assert.deepEqual([door.open, door.want], [1, 1]);
  const other: DoorInst = { spot: { ...spot, out: 1, near: true }, open: 0, want: 0 };
  assert.deepEqual(stepDoors([other], [{ x: m.x - 1, y: m.y - 0.5 }], DT), [other], 'from the room\'s side too');
  // THE GATE goes by what the game tells it and by nothing else: it falls fast and rises slowly
  const gate: DoorInst = { spot: { ...spot, kind: 'bossgate' }, open: 1, want: 1 };
  assert.deepEqual(stepDoors([gate], [{ x: m.x, y: m.y }], DT), []);
  assert.deepEqual([gate.open, gate.want], [1, 1]);
  gate.want = 0;
  t = 0;
  while (gate.open > 0) {
    stepDoors([gate], [{ x: m.x, y: m.y }], DT);
    t += DT;
  }
  assert.ok(Math.abs(t - GATE_FALL) < 2 * DT, `down in ${t.toFixed(2)} seconds`);
  gate.want = 1;
  t = 0;
  while (gate.open < 1) {
    stepDoors([gate], [], DT);
    t += DT;
  }
  assert.ok(Math.abs(t - GATE_RISE) < 2 * DT, `up in ${t.toFixed(2)} seconds`);
  assert.ok(GATE_FALL < DOOR_SWING && GATE_RISE > DOOR_SWING * 2);
  // a level's doors as a run begins: every door shut, the gate up
  const f = SAMPLES[9].f;
  for (const d of makeDoors(f)) assert.deepEqual([d.open, d.want], d.spot.kind === 'bossgate' ? [1, 1] : [0, 0]);
  assert.equal(makeDoors(f).length, (f.doors ?? []).length);
});

/** A place `by` tiles inside a door's line (negative: out in the corridor), in line with the middle of its opening. */
function inLine(d: DoorSpot, by: number): { x: number; y: number } {
  const m = doorMiddle(d);
  return d.alongX ? { x: m.x, y: d.plane - d.out * by } : { x: d.plane - d.out * by, y: m.y };
}
/** A door of a level whose corridor runs straight out from it for six tiles, and whose room is clear for four tiles in: one to walk at from far off. */
function doorToWalkAt(g: Game, but: readonly DoorInst[] = []): DoorInst {
  const L = g.level;
  const f = L.floor;
  for (const d of L.doors) {
    if (d.spot.kind !== 'door' || but.includes(d)) continue;
    let clear = true;
    for (let by = -6; by <= 4 && clear; by += 0.5) {
      const p = inLine(d.spot, by);
      clear = L.walk[Math.floor(p.y) * f.w + Math.floor(p.x)] === 1 && inner(g).free(L.walk, p.x, p.y, 0.45);
    }
    if (clear) return d;
  }
  throw new Error('no door with a straight way to it');
}

test('in a dungeon a door is open before the hero reaches it, and he walks through; a monster opens none, asleep or awake', () => {
  const g = dungeon(6, 2);
  const L = g.level;
  const h = g.hero;
  assert.ok(L.doors.length > 8, `${L.doors.length} doors and gates in the level`);
  assert.equal(L.doors.filter((q) => q.spot.kind === 'door' && q.open === 0 && q.want === 0).length, L.doors.length - 1, 'every door is shut as the run begins');
  const d = doorToWalkAt(g);
  const m = doorMiddle(d.spot);
  // out in the corridor, in line with it, five tiles short of the room
  Object.assign(h, inLine(d.spot, -5));
  let events = steps(g, 30);
  assert.deepEqual([d.open, d.want], [0, 0], 'from far off it is shut');
  assert.ok(!events.some((e) => e.t === 'door'));
  // he walks at it
  const c = emptyControls();
  c.mx = d.spot.alongX ? 0 : -d.spot.out;
  c.my = d.spot.alongX ? -d.spot.out : 0;
  events = [];
  let openAt = -1;
  for (let k = 0; k < 600 && insideBy(d.spot, h.x, h.y) < 2; k++) {
    g.events.length = 0;
    g.update(DT, c);
    events.push(...g.events);
    if (openAt < 0 && d.open === 1) openAt = Math.hypot(h.x - m.x, h.y - m.y);
  }
  assert.ok(insideBy(d.spot, h.x, h.y) >= 2, `he walked through the door and on into the room (he is ${insideBy(d.spot, h.x, h.y).toFixed(2)} inside its line)`);
  assert.ok(openAt > 0.8, `the door stood open while he was still ${openAt.toFixed(2)} tiles short of the middle of it`);
  assert.ok(openAt < DOOR_NEAR, 'it was shut until he came near');
  assert.equal(events.filter((e) => e.t === 'door' && e.kind === 'open').length, 1, 'it opened once');
  assert.ok(events.some((e) => e.t === 'sfx' && e.name === 'door'), 'and was heard');
  // every door he did not come near is still shut
  assert.ok(L.doors.filter((q) => q.spot.kind === 'door' && q.open === 0).length >= L.doors.length - 3);
  // A MONSTER OPENS NO DOOR: asleep by a shut door, and awake by it
  const far = L.doors.find((q) => q.spot.kind === 'door' && q.open === 0 && Math.hypot(doorMiddle(q.spot).x - h.x, doorMiddle(q.spot).y - h.y) > 30);
  assert.ok(far);
  if (!far) return;
  const at = inLine(far.spot, 0.8);
  const sk = inner(g).spawn('skeleton', at.x, at.y, 900, 0, false, inner(g).rng);
  assert.equal(sk.state, 'sleep');
  steps(g, 60);
  assert.deepEqual([far.open, far.want], [0, 0], 'a sleeping monster a tile from a door leaves it shut');
  inner(g).wakeUp(sk);
  assert.equal(sk.state, 'chase');
  steps(g, 180);
  assert.deepEqual([far.open, far.want], [0, 0], 'and so does one that is awake, in three seconds beside it: no monster opens a door');
});

test('a shut door holds monsters: one that walks, a big one and one that flies wait behind it, and come through once the hero has come near and it has opened', () => {
  for (const kind of ['skeleton', 'brute', 'bat'] as const) {
    const g = dungeon(6, 2);
    const L = g.level;
    const f = L.floor;
    const h = g.hero;
    const d = doorToWalkAt(g);
    const way = doorWay(f, d.spot);
    assert.ok(L.shut !== null && way.every((i) => (L.shut as Uint8Array)[i] === 1), 'the tile of a shut door is marked as holding monsters');
    assert.deepEqual(Array.from(shutGrid(f) as Uint8Array).reduce((n, v) => n + v, 0), L.doors.filter((q) => q.spot.kind === 'door').length, 'one tile to a door, none for the gate');
    // the hero out in the corridor, five tiles short of the room, in line with the door; the monster awake a tile and a half inside
    Object.assign(h, inLine(d.spot, -5));
    const at = inLine(d.spot, 1.5);
    const m = inner(g).spawn(kind, at.x, at.y, 900, 0, false, inner(g).rng);
    inner(g).wakeUp(m);
    let nearest = Infinity;
    for (let k = 0; k < 60 * 6; k++) {
      g.update(DT, emptyControls());
      nearest = Math.min(nearest, insideBy(d.spot, m.x, m.y));
    }
    assert.deepEqual([d.open, d.want], [0, 0], `six seconds on the door is shut still: a ${kind} does not open it`);
    assert.ok(nearest > 0.2, `and has not passed it, nor stood in it (the nearest it came is ${nearest.toFixed(2)} tiles inside its line)`);
    assert.ok(nearest < 1.3, `it came up to the door, and waits there (${nearest.toFixed(2)})`);
    assert.ok(way.every((i) => (L.shut as Uint8Array)[i] === 1));
    // the hero comes near: it opens for him, holds nothing, and the monster comes through
    Object.assign(h, inLine(d.spot, -3));
    assert.ok(Math.hypot(h.x - doorMiddle(d.spot).x, h.y - doorMiddle(d.spot).y) < DOOR_NEAR);
    let through = -1;
    for (let k = 0; k < 60 * 8 && through < 0; k++) {
      g.update(DT, emptyControls());
      if (insideBy(d.spot, m.x, m.y) < -0.3) through = k * DT;
    }
    assert.equal(d.want, 1, 'the hero came within its reach, and it began to open');
    assert.ok(way.every((i) => (L.shut as Uint8Array)[i] === 0), 'and from then its tile holds nobody');
    assert.ok(through >= 0, `and the ${kind} came through to him (after eight seconds it is ${insideBy(d.spot, m.x, m.y).toFixed(2)} tiles inside the door's line)`);
    steps(g, 30);
    assert.equal(d.open, 1, 'and it stands open');
  }
});

test('a monster the dice set down in a shut door is not held in it: it walks out', () => {
  const g = dungeon(6, 2);
  const L = g.level;
  const h = g.hero;
  const d = doorToWalkAt(g);
  // the hero five tiles out in the corridor; a skeleton awake in the middle of the door's own tile
  Object.assign(h, inLine(d.spot, -5));
  const mid = doorMiddle(d.spot);
  const m = inner(g).spawn('skeleton', mid.x, mid.y, 900, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  let out = false;
  for (let k = 0; k < 60 * 4 && !out; k++) {
    g.update(DT, emptyControls());
    out = insideBy(d.spot, m.x, m.y) < -1.05;
  }
  assert.ok(out, `it walked out of the doorway toward him (it is ${insideBy(d.spot, m.x, m.y).toFixed(2)} tiles inside the door's line)`);
  assert.deepEqual([d.open, d.want], [0, 0], 'and the door is shut still');
  assert.ok(L.shut !== null);
});

test('a shut door stops sight and shots both ways, and nothing behind it wakes; as it opens it stops neither, and what is behind it wakes', () => {
  const g = dungeon(6, 2);
  const L = g.level;
  const f = L.floor;
  const h = g.hero;
  const d = doorToWalkAt(g);
  const way = doorWay(f, d.spot);
  assert.ok(way.every((i) => L.open[i] === 0 && L.walk[i] === 1), 'shut: its tile is shut to sight and shots, and open to walking');
  // every other door of the level too, and the gate's doorway not (it is up)
  for (const q of L.doors) for (const i of doorWay(f, q.spot)) assert.equal(L.open[i], q.spot.kind === 'door' ? 0 : 1);
  Object.assign(h, inLine(d.spot, -5));
  const at = inLine(d.spot, 2);
  assert.ok(!g.sees(h.x, h.y, at.x, at.y) && !g.sees(at.x, at.y, h.x, h.y), 'the hero five tiles out in the corridor and a place two tiles inside the room do not see each other');
  // a skeleton asleep two tiles inside, the hero standing in line with it for three seconds: it sleeps on
  const sk = inner(g).spawn('skeleton', at.x, at.y, 900, 0, false, inner(g).rng);
  steps(g, 180);
  assert.equal(sk.state, 'sleep', 'a monster asleep behind a shut door does not wake for a hero out in the corridor');
  assert.equal(L.visible[Math.floor(at.y) * f.w + Math.floor(at.x)], 0, 'nor is the room behind it seen');
  // the hero comes within its reach: it begins to open, they see each other, and the skeleton wakes
  Object.assign(h, inLine(d.spot, -3));
  steps(g, 2);
  assert.equal(d.want, 1);
  assert.ok(way.every((i) => L.open[i] === 1), 'as it begins to open, its tile is open to sight and shots');
  assert.ok(g.sees(h.x, h.y, at.x, at.y), 'and the two places see each other');
  steps(g, 60);
  assert.ok(sk.state !== 'sleep', 'and the monster behind it has woken');
});

test('what is shut in a room is out of the hero\'s reach: a blast set off against its door, a blow, an arc and a fire do not touch what stands behind it, it sleeps on, and it is no fight; once the door has begun to open, they do', () => {
  const g = dungeon(6, 2);
  const h = g.hero;
  const d = doorToWalkAt(g);
  // the hero four and a half tiles out in the corridor: the door is shut. A skeleton asleep just inside the door, one of its pack further in, and one of another pack out in the corridor
  Object.assign(h, inLine(d.spot, -4.5));
  const a = inLine(d.spot, 0.6);
  const b = inLine(d.spot, 3.2);
  const o = inLine(d.spot, -2);
  const sk = inner(g).spawn('skeleton', a.x, a.y, 900, 0, false, inner(g).rng);
  const mate = inner(g).spawn('skeleton', b.x, b.y, 900, 0, false, inner(g).rng);
  const loose = inner(g).spawn('skeleton', o.x, o.y, 901, 0, false, inner(g).rng);
  assert.deepEqual([d.open, d.want], [0, 0]);
  assert.ok(inner(g).shutIn(sk) && inner(g).shutIn(mate), 'the two in the room are shut in');
  assert.ok(!inner(g).shutIn(loose), 'the one out in the corridor is not');
  assert.ok(!inner(g).shutIn(inLine(d.spot, -0.5)), 'nor is whatever stands in the door itself');
  const life = [sk.life, mate.life];
  // a blast against the face of the door, wide enough to take in the one just behind it
  const c = inLine(d.spot, -1.2);
  assert.ok(Math.hypot(sk.x - c.x, sk.y - c.y) < 2.4 && Math.hypot(loose.x - c.x, loose.y - c.y) < 2.4);
  g.events.length = 0;
  inner(g).blast(0, c.x, c.y, 2.4, 1, 'blast');
  assert.ok(loose.life < loose.maxLife && loose.state !== 'sleep', 'the blast is a real one: it hurt the one in the corridor, and woke it');
  assert.deepEqual([sk.life, mate.life], life, 'and it did not touch the one behind the shut door');
  assert.deepEqual([sk.state, mate.state], ['sleep', 'sleep'], 'which sleeps on, and its pack with it');
  assert.equal(g.events.filter((e) => e.t === 'hit' && !e.onHero).length, 1, 'one was hit, and one is shown as hit');
  // a blow that would land on it; an arc of lightning that would jump to it; a fire it would stand in
  inner(g).hitMonster(sk, 0, 1, false);
  inner(g).damageMonster(sk, 7, 'lightning', false, 0);
  inner(g).damageMonster(sk, 3, 'fire', false, 0);
  assert.deepEqual([sk.life, mate.life], life, 'none of them reaches it');
  assert.deepEqual([sk.state, mate.state], ['sleep', 'sleep']);
  // AWAKE BEHIND ITS DOOR IT IS NO FIGHT (the first dungeon's prompts ask whether one is on): the one in the corridor is
  assert.equal(g.inFight(), true, 'the one awake in the corridor is a fight');
  loose.dead = true;
  inner(g).wakeUp(sk);
  assert.ok(sk.state !== 'sleep' && mate.state !== 'sleep');
  assert.equal(g.inFight(), false, 'two awake behind a shut door, five tiles off, are none');
  // THE HERO COMES NEAR: the door begins to open, and from then the same blast lands
  Object.assign(h, inLine(d.spot, -3));
  steps(g, 2);
  assert.equal(d.want, 1);
  assert.ok(!inner(g).shutIn(sk) && !inner(g).shutIn(mate), 'as the door begins to open, nothing in the room is shut in');
  assert.equal(g.inFight(), true, 'and the fight is on');
  inner(g).blast(0, c.x, c.y, 2.4, 1, 'blast');
  assert.ok(sk.life < life[0], 'the same blast now hurts the one behind the door');

  // A HERO SET DOWN INSIDE A ROOM WHOSE DOOR IS STILL SHUT (a playtest does that; nothing in the game does) fights what is in it as ever
  const g2 = dungeon(6, 2);
  const d2 = doorToWalkAt(g2);
  Object.assign(g2.hero, inLine(d2.spot, 4));
  const at = inLine(d2.spot, 2);
  const m2 = inner(g2).spawn('skeleton', at.x, at.y, 900, 0, false, inner(g2).rng);
  steps(g2, 2);
  assert.deepEqual([d2.open, d2.want], [0, 0], 'four tiles inside he is out of the door\'s reach: it is shut behind him');
  assert.ok(!inner(g2).shutIn(m2), 'what is in the room with him is not shut in');
  inner(g2).blast(0, at.x + 0.5, at.y, 1.5, 1, 'blast');
  assert.ok(m2.life < m2.maxLife, 'and his blast hurts it');
});

test('a rain of arrows and an orb, aimed past a shut door by their own buttons, do not reach what stands just behind it; as the game was before this rule, they did', () => {
  for (const cls of ['ranger', 'mage'] as const) {
    for (const rule of [true, false]) {
      const g = dungeon(6, 2, cls);
      const h = g.hero;
      const d = doorToWalkAt(g);
      Object.assign(h, inLine(d.spot, -4.5));
      const a = inLine(d.spot, 0.6);
      const b = inLine(d.spot, 3.2);
      const sk = inner(g).spawn('skeleton', a.x, a.y, 900, 0, false, inner(g).rng);
      const mate = inner(g).spawn('skeleton', b.x, b.y, 900, 0, false, inner(g).rng);
      // (the game as it was: nothing is ever shut in. To see that these attacks do reach behind a door.)
      if (!rule) inner(g).shutIn = () => false;
      const life = sk.life;
      const c = emptyControls();
      c.castX = c.aimX = sk.x;
      c.castY = c.aimY = sk.y;
      // the slow attack, pointed at the monster itself, three times in fifteen seconds
      for (let k = 0; k < 60 * 15; k++) {
        c.cast = k % 360 === 10;
        if (c.cast) h.mana = h.d.maxMana;
        g.update(DT, c);
      }
      const name = h.skills[1].r.name;
      assert.ok(h.skills[1].uses >= 2, `${cls}: ${name} was made (${h.skills[1].uses} times)`);
      assert.deepEqual([d.open, d.want], [0, 0], `${cls}: the door is shut throughout`);
      if (rule) {
        assert.equal(sk.life, life, `${cls}: ${name}, pointed past a shut door, did not hurt the monster just behind it`);
        assert.deepEqual([sk.state, mate.state], ['sleep', 'sleep'], `${cls}: and nothing in the room woke`);
      } else {
        assert.ok(sk.dead || sk.life < life, `${cls}: before the rule ${name} reached it (it has ${sk.life} of ${life})`);
        assert.ok(mate.state !== 'sleep', `${cls}: and the pack woke, to be held at the door`);
      }
    }
  }
});

test('whatever is shut in cannot come at the hero: in real dungeons with all their monsters, nothing the rule puts out of his reach can reach him but through a shut door; and every door stands where its room\'s floor ends', () => {
  let asked = 0;
  for (const [seed, depth] of [[3, 1], [6, 2], [11, 3], [14, 4], [21, 5], [8, 6]] as const) {
    const g = doorsSet(true, () => {
      const q = new Game('warrior', seed);
      q.depth = depth;
      q.enterDungeon();
      q.hero.invuln = 1e9;
      return q;
    });
    const L = g.level;
    const f = L.floor;
    const h = g.hero;
    const within = (r: { x: number; y: number; w: number; h: number }, p: { x: number; y: number }): boolean => p.x >= r.x && p.y >= r.y && p.x < r.x + r.w && p.y < r.y + r.h;
    for (const d of L.doors) {
      if (d.spot.kind !== 'door') continue;
      const r = f.rooms.find((q) => q.id === d.spot.room);
      assert.ok(r && within(r, inLine(d.spot, 0.3)) && !within(r, inLine(d.spot, -0.5)), 'a door stands where the floor of its room ends: a step inside its line is in the room, and the door itself is not');
    }
    // every tile a body can be on (walked, or flown over) that can be come to from the hero without passing a shut door
    const reached = (): Uint8Array => {
      const out = new Uint8Array(f.w * f.h);
      const ok = (i: number): boolean => (L.walk[i] === 1 || L.open[i] === 1) && !(L.shut && L.shut[i] === 1);
      const queue = [Math.floor(h.y) * f.w + Math.floor(h.x)];
      out[queue[0]] = 1;
      for (let q = 0; q < queue.length; q++) {
        const i = queue[q];
        for (const j of [i + 1, i - 1, i + f.w, i - f.w]) {
          if (j < 0 || j >= out.length || out[j] === 1 || !ok(j)) continue;
          out[j] = 1;
          queue.push(j);
        }
      }
      return out;
    };
    const check = (when: string): number => {
      const can = reached();
      let n = 0;
      for (const m of g.monsters) {
        if (m.dead) continue;
        const i = Math.floor(m.y) * f.w + Math.floor(m.x);
        const room = f.rooms.find((r) => within(r, m));
        const door = room ? L.doors.find((q) => q.spot.kind === 'door' && q.spot.room === room.id) : undefined;
        if (inner(g).shutIn(m)) {
          n++;
          assert.equal(can[i], 0, `dungeon ${depth}, seed ${seed}, ${when}: a ${m.kind} at ${m.x.toFixed(1)}, ${m.y.toFixed(1)} is out of the hero's reach, and could walk to him without passing a shut door: A ROOM HAS A SECOND WAY IN, and \`shutIn\` in game.ts must ask something else`);
        } else if (room && door && door.want === 0 && !within(room, h)) {
          assert.ok(false, `dungeon ${depth}, seed ${seed}, ${when}: a ${m.kind} in a room whose door is shut is not shut in`);
        }
      }
      return n;
    };
    const first = check('as the run begins');
    assert.ok(first > 10, `dungeon ${depth}: ${first} of ${g.monsters.length} monsters are shut in as the run begins`);
    asked += first;
    // the hero is set down before one door after another: each opens, and what is in its room is shut in no longer
    let opened = 0;
    for (const d of L.doors) {
      if (d.spot.kind !== 'door' || opened >= 4) continue;
      const p = inLine(d.spot, -2);
      if (L.walk[Math.floor(p.y) * f.w + Math.floor(p.x)] !== 1) continue;
      Object.assign(h, p);
      steps(g, 2);
      assert.equal(d.want, 1);
      const room = f.rooms.find((r) => r.id === d.spot.room);
      for (const m of g.monsters) if (room && within(room, m)) assert.ok(!inner(g).shutIn(m), 'what is in a room whose door has begun to open is shut in no longer');
      asked += check(`with ${opened + 1} of its doors opened`);
      opened++;
    }
    assert.ok(opened >= 3);
  }
  assert.ok(asked > 300, `${asked} monsters asked about`);
});

test('the dead that rise for a new player\'s first word rise where they can come at the hero: none in or beyond a door that is still shut, and all six reach him', () => {
  let asItWas = 0;
  let places = 0;
  for (const seed of [6, 9, 13]) {
    for (const out of [-6.3, -5.9, -5.5]) {
      for (const mended of [true, false]) {
        const g = doorsSet(true, () => Game.forFirstRun('warrior', seed));
        const L = g.level;
        const h = g.hero;
        g.monsters.length = 0;
        h.invuln = 1e9;
        const d = doorToWalkAt(g);
        // out in the corridor, turned to the door, with the best place for them to rise a step or two short of it
        Object.assign(h, inLine(d.spot, out));
        h.fx = d.spot.alongX ? 0 : -d.spot.out;
        h.fy = d.spot.alongX ? -d.spot.out : 0;
        // (the game as it was: a shut door's tile was ground for them like any other)
        const shut = L.shut;
        if (!mended) L.shut = null;
        inner(g).rise();
        L.shut = shut;
        const risen = g.monsters.filter((m) => m.packId === -7);
        assert.equal(risen.length, 6);
        const beyond = risen.filter((m) => insideBy(d.spot, m.x, m.y) > -1);
        if (!mended) {
          asItWas += beyond.length;
          places++;
          continue;
        }
        assert.equal(beyond.length, 0, `seed ${seed}, ${-out} tiles out: none rose in the door or beyond it`);
        for (let k = 0; k < 60 * 8; k++) g.update(DT, emptyControls());
        assert.deepEqual([d.open, d.want], [0, 0], 'the door is shut still');
        const far = risen.filter((m) => Math.hypot(m.x - h.x, m.y - h.y) > 2.5);
        assert.equal(far.length, 0, `seed ${seed}, ${-out} tiles out: eight seconds on, all six have come to him (${far.length} have not)`);
      }
    }
  }
  // (and these are places where they would have: as the game was, some of them rose in the door or beyond it)
  assert.ok(asItWas >= 3, `as it was, ${asItWas} of the ${places * 6} rose in the door or beyond it`);
});

test('a door is as wide for a brute as for anybody: the stone beside it holds a big body off no further than a small one, and a brute comes through', () => {
  const g = dungeon(6, 2);
  const L = g.level;
  const f = L.floor;
  const h = g.hero;
  const d = doorToWalkAt(g);
  const m = doorMiddle(d.spot);
  const fits = (p: { x: number; y: number }, r: number): boolean => inner(g).free(L.walk, p.x, p.y, r);
  /** In the doorway, `by` tiles to one side of the middle of the opening. */
  const aside = (by: number): { x: number; y: number } => (d.spot.alongX ? { x: m.x + by, y: m.y } : { x: m.x, y: m.y + by });
  const brute = MONSTERS.brute.radius;
  const big = brute * TUNE.guardianSize;
  assert.ok(brute > 0.5 && big > brute, `a brute is ${brute} of a tile from its middle to its side: more than a tile across`);
  assert.ok(PIER_HOLD > TUNE.heroRadius && PIER_HOLD < 0.5, 'the stone holds a hero off by his own half width, as any wall does');
  // in the middle of the opening everybody fits: a hero, a brute, a guardian brute
  for (const r of [TUNE.heroRadius, brute, big]) assert.ok(fits(m, r), `a body of ${r} fits in the middle of a door`);
  // a body is held off the stone by its own half width up to PIER_HOLD, and by PIER_HOLD if it is bigger
  for (const r of [TUNE.heroRadius, brute, big]) {
    const hold = Math.min(r, PIER_HOLD);
    for (const side of [-1, 1]) {
      assert.ok(fits(aside(side * (0.5 - hold - 0.02)), r), `a body of ${r} fits ${(0.5 - hold - 0.02).toFixed(2)} to the side of the middle`);
      assert.ok(!fits(aside(side * (0.5 - hold + 0.02)), r), `and not ${(0.5 - hold + 0.02).toFixed(2)} to the side`);
    }
  }
  // the stone itself is wall to everybody: nobody's middle is ever in it
  for (const i of doorPiers(f, d.spot)) for (const r of [TUNE.heroRadius, brute, big]) assert.ok(!fits({ x: (i % f.w) + 0.5, y: Math.floor(i / f.w) + 0.5 }, r));
  // and any other wall holds a brute off by its whole half width, as it always did: the corridor's own side wall
  {
    const p = inLine(d.spot, -3);
    // (the corridor is three tiles wide: its side walls are a tile and a half from its middle line)
    const off = (by: number): { x: number; y: number } => (d.spot.alongX ? { x: p.x + by, y: p.y } : { x: p.x, y: p.y + by });
    assert.ok(fits(off(1.5 - brute - 0.02), brute) && !fits(off(1.5 - brute + 0.02), brute), 'a corridor\'s wall holds a brute off by its whole half width');
  }
  // A BRUTE COMES THROUGH A DOOR THE HERO HAS OPENED: the hero a tile and a half inside the room for half a second
  // (the door opens for him: no monster opens one), then two and a half tiles inside; the brute awake out in the corridor
  Object.assign(h, inLine(d.spot, 1.5));
  steps(g, 30);
  assert.equal(d.open, 1, 'the door opened for the hero');
  Object.assign(h, inLine(d.spot, 2.5));
  const from = inLine(d.spot, -3.5);
  const b = inner(g).spawn('brute', from.x, from.y, 901, 0, false, inner(g).rng);
  assert.equal(b.r, brute);
  inner(g).wakeUp(b);
  let through = -1;
  for (let k = 0; k < 60 * 12 && through < 0; k++) {
    g.update(DT, emptyControls());
    if (insideBy(d.spot, b.x, b.y) > 0.3) through = k * DT;
  }
  assert.ok(through > 0, `the brute came through the door (after 12 seconds it is ${insideBy(d.spot, b.x, b.y).toFixed(2)} tiles inside its line)`);
  assert.equal(d.open, 1, 'which stood open for the hero');
});

test('a hero who walks at the stone beside a door is eased into the door: from anywhere across the hallway, by the stick or by the keys; and at no other wall', () => {
  const g = dungeon(6, 2);
  const L = g.level;
  const h = g.hero;
  let through = 0;
  const tried: DoorInst[] = [];
  for (let n = 0; n < 4; n++) {
    const d = doorToWalkAt(g, tried);
    tried.push(d);
    const s = d.spot;
    // (into the room, and across the hallway: unit steps of the grid)
    const into = s.alongX ? { x: 0, y: -s.out } : { x: -s.out, y: 0 };
    const across = s.alongX ? { x: 1, y: 0 } : { x: 0, y: 1 };
    // THE STICK points straight down the hallway. THE KEYS walk in eight directions of the screen: the one of them
    // nearest a hallway's line runs three tiles along it for every one across (W and D together, and the like)
    // (up and right on the screen, W and D together, is (-1, -3) on the grid; the other three are (-3, -1), (3, 1), (1, 3):
    // three along the hallway, and one across it to the side that has the same sign)
    const sign = into.x + into.y;
    const kx = into.x * 3 + across.x * sign;
    const ky = into.y * 3 + across.y * sign;
    const ways: [string, number, number][] = [['the stick', into.x, into.y], ['the keys', kx / Math.hypot(kx, ky), ky / Math.hypot(kx, ky)]];
    for (const [how, mx, my] of ways) {
      for (const off of [-1.15, -0.6, 0, 0.6, 1.15]) {
        const from = inLine(s, -3);
        h.x = from.x + across.x * off;
        h.y = from.y + across.y * off;
        assert.ok(inner(g).free(L.walk, h.x, h.y, TUNE.heroRadius), 'he begins in the hallway');
        const c = emptyControls();
        c.mx = mx;
        c.my = my;
        let k = 0;
        for (; k < 60 * 6 && insideBy(s, h.x, h.y) < 1; k++) g.update(DT, c);
        assert.ok(insideBy(s, h.x, h.y) >= 1, `door ${n} (${s.alongX ? 'along x' : 'along y'}, ${s.near ? 'toward the eye' : 'in a back wall'}), by ${how}, from ${off} tiles off the middle of the hallway: he comes through (after 6 seconds he is ${insideBy(s, h.x, h.y).toFixed(2)} inside its line)`);
        through++;
      }
    }
    // AT NO OTHER WALL: walking straight at the wall of the room beside the door's stone, he stays where he is put (but for the step up to it)
    const beside = inLine(s, 1.5);
    h.x = beside.x + across.x * 2.5;
    h.y = beside.y + across.y * 2.5;
    if (inner(g).free(L.walk, h.x, h.y, TUNE.heroRadius) && L.walk[Math.floor(h.y - into.y * 2) * L.floor.w + Math.floor(h.x - into.x * 2)] === 0) {
      const c = emptyControls();
      c.mx = -into.x;
      c.my = -into.y;
      for (let k = 0; k < 120; k++) g.update(DT, c);
      const moved = Math.abs((h.x - beside.x) * across.x + (h.y - beside.y) * across.y);
      assert.ok(Math.abs(moved - 2.5) < 0.02 && insideBy(s, h.x, h.y) > 0, `two and a half tiles to the side of door ${n} the wall holds him, and he is not moved along it (${moved.toFixed(2)} tiles to the side)`);
    }
  }
  console.log(`(a hero walked at 4 doors from 5 places across the hallway, by the stick and by the keys: through ${through} times of ${4 * 2 * 5})`);
});

test('of the walls beside a door, the one a back wall runs on into stands, with both its faces; the others are left out as the walls\' own rule has it', () => {
  let back = 0;
  let near = 0;
  for (const s of SAMPLES.slice(0, 24)) {
    const f = s.f;
    const away = wallsAway(f, WALLS_FADING);
    for (const d of f.doors ?? []) {
      if (d.kind !== 'door') continue;
      const [first, last] = doorPiers(f, d);
      const what = `dungeon ${s.depth}, seed ${s.seed}, the door at ${first % f.w},${Math.floor(first / f.w)}`;
      if (d.near) {
        near++;
        assert.deepEqual([away[first], away[last]], [1, 1], `${what}: on a side toward the eye no wall stands beside it`);
      } else {
        back++;
        assert.deepEqual([away[first], away[last]], [0, 1], `${what}: in a back wall the wall runs on to its frame on one side, and is left out on the other`);
        assert.equal(wallFaces(f, first), FACE_LEFT + FACE_RIGHT, `${what}: that wall shows its face to the room and its side to the way through`);
      }
    }
  }
  console.log(`(${back} doors in back walls, ${near} on sides toward the eye)`);
  assert.ok(back > 50 && near > 50);
});

test('the boss\'s gate: up until the hero is well inside the hall, then down and nothing passes; up again when the boss is dead', () => {
  const g = dungeon(6, 2);
  const L = g.level;
  const f = L.floor;
  const h = g.hero;
  const gate = L.doors.find((q) => q.spot.kind === 'bossgate');
  assert.ok(gate && g.boss);
  if (!gate || !g.boss) return;
  const boss = g.boss;
  boss.state = 'sleep';
  inner(g).wakeUp = () => {};
  const tiles = doorTiles(f, gate.spot);
  const R = TUNE.heroRadius;
  // (a place `by` tiles inside the gate's line, in line with the middle of the doorway)
  const inside = (by: number): { x: number; y: number } => inLine(gate.spot, by);
  const openWay = (): boolean => tiles.every((i) => L.walk[i] === 1 && L.open[i] === 1);
  const shutWay = (): boolean => tiles.every((i) => L.walk[i] === 0 && L.open[i] === 0);
  // as the run begins it is up, and its doorway is floor
  assert.deepEqual([gate.open, gate.want], [1, 1]);
  assert.ok(openWay());
  // the hero in the corridor, in the doorway, a step inside: it stays up
  for (const by of [-3, -0.5, 0.6, GATE_INSIDE - 0.3]) {
    Object.assign(h, inside(by));
    const ev = steps(g, 20);
    assert.deepEqual([gate.open, gate.want], [1, 1], `the hero ${by} tiles inside its line: the gate is up`);
    assert.ok(!ev.some((e) => e.t === 'door'));
  }
  // a monster follows him into the doorway; he steps well inside: THE GATE FALLS
  const mid = inside(-0.5);
  const sk = inner(g).spawn('skeleton', mid.x, mid.y, 900, 0, false, inner(g).rng);
  Object.assign(h, inside(GATE_INSIDE + 0.4));
  let ev = steps(g, 1);
  assert.equal(gate.want, 0, 'well inside, with the boss alive: it falls');
  assert.ok(shutWay(), 'and at once its doorway is wall to what walks, to what flies and to a shot');
  assert.ok(ev.some((e) => e.t === 'door' && e.kind === 'fall') && ev.some((e) => e.t === 'sfx' && e.name === 'gateFall'), 'seen and heard');
  assert.ok(insideBy(gate.spot, sk.x, sk.y) > 0 && inner(g).free(L.walk, sk.x, sk.y, sk.r), `the monster that was in the doorway is put down just inside (${insideBy(gate.spot, sk.x, sk.y).toFixed(2)})`);
  sk.dead = true;
  ev = steps(g, Math.ceil(GATE_FALL / DT) + 2);
  assert.equal(gate.open, 0, 'down in a fifth of a second');
  assert.ok(!ev.some((e) => e.t === 'door'), 'it falls once');
  // nobody stands in its doorway, from either side
  for (const by of [-0.5, 0.2]) assert.ok(!inner(g).free(L.walk, inside(by).x, inside(by).y, R), `no body fits ${by} tiles inside its line`);
  // the hero walks at it from inside for three seconds, and is still inside
  const c = emptyControls();
  c.mx = gate.spot.alongX ? 0 : gate.spot.out;
  c.my = gate.spot.alongX ? gate.spot.out : 0;
  for (let k = 0; k < 180; k++) g.update(DT, c);
  assert.ok(insideBy(gate.spot, h.x, h.y) >= R - 0.02, `he is held ${insideBy(gate.spot, h.x, h.y).toFixed(2)} tiles inside its line`);
  // he walks back into the hall, to the corridor's side of the line it fell at: it does not rise for that
  Object.assign(h, inside(GATE_INSIDE - 1));
  steps(g, 30);
  assert.deepEqual([gate.open, gate.want], [0, 0], 'it stays down while the boss lives');
  // THE BOSS DIES: it rises, and the way is open
  inner(g).damageMonster(boss, 1e9, 'phys', false, -1);
  assert.ok(boss.dead && g.boss === null);
  ev = steps(g, 1);
  assert.equal(gate.want, 1);
  assert.ok(openWay(), 'its doorway is floor again');
  assert.ok(ev.some((e) => e.t === 'door' && e.kind === 'rise') && ev.some((e) => e.t === 'sfx' && e.name === 'gateRise'));
  steps(g, Math.ceil(GATE_RISE / DT) + 2);
  assert.equal(gate.open, 1, 'up in a second');
  // and it does not fall again: the hero walks out
  Object.assign(h, inside(GATE_INSIDE + 2));
  steps(g, 30);
  assert.deepEqual([gate.open, gate.want], [1, 1]);
  for (let k = 0; k < 400 && insideBy(gate.spot, h.x, h.y) > -1; k++) g.update(DT, c);
  assert.ok(insideBy(gate.spot, h.x, h.y) <= -1, 'he walks out under it');
});
