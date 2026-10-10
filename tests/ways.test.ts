// THE WAYS THROUGH THE CRYPT (game/ways.ts, WAYS, off): the gate in town to the first floor, the
// stairwell down from every floor, and the waypoints, to town and back. The owner's outline, 9 Oct
// 2026, 22:47: "The gate on the wall with be turned to a gate from the levels.  It will open
// automatically as you approach it and go through.  you will enter floor 1 of the Crypt.  You find
// the dead wordsmith and the quest item to turn the altar on, kill the warden and find a stairwell
// leading down.  At the bottom of the stairs is Crypt floor 2.  There is a waypoint that will warp
// you to town and back at the beginning over every floor except the first as you could just walk
// back through the gate." Their pictures are the art chat's (art/crypt_ways.ts), with his yes by
// 07:29 on 10 Oct: "Yes, as shown (Recommended)".
//
// What is held here:
//   - the switch is on in the game, and off the game is what it was: the town has no gate of the levels and
//     no waypoint, a dungeon its dark portal home in the boss's hall, lit when the boss dies;
//   - the ways have the sizes of their pictures;
//   - on, every floor has places for its stairwell in its boss's hall (the first across its
//     middle), on plain floor with nothing standing on it or a tile round it, and no portal; every
//     floor from the second its waypoint beside where the hero comes in; the first floor its gate
//     in a back wall of its first room, open to the dark beyond, with nothing before it; and the
//     hero can walk from where he comes in to every one of them;
//   - on, the first floor's first room keeps its corners square (for its gate's wall), and the
//     rest of the first floor, and every deeper floor, is laid as it would be;
//   - the town's gate rises as he comes within GATE_RISE_AT tiles and falls when he is further than
//     GATE_FALL_AT; walked into, it takes him (the screen darkening and lightening) to the first
//     floor, just inside its gate, which stands open; walked into, that takes him back to town;
//   - the boss dead, the stairwell opens by the hall's middle, or, where he fell there, in the next
//     of its places, clear of his body; whoever and whatever is on its opening is put aside; its top
//     step takes him down to the next floor, a floor cleared;
//   - a floor's waypoint wakes as he comes near; standing on it, the use button warps him to town,
//     onto the town's, which then warps him back to the deepest floor whose waypoint he reached;
//   - on his way out of a level he does nothing more in it;
//   - in town the gate is no longer used for its words (no service of the gate's);
//   - the deepest waypoint reached is kept with the run (and nothing is written while off).
//   run: tsx --test tests/ways.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { STAIR_LONG as ART_STAIR_LONG, STAIR_WIDE as ART_STAIR_WIDE, WAY_R } from '../src/art/crypt_ways';
import { doorMiddle, doorTiles, insideBy } from '../src/game/doors';
import { CRYPT_LAYOUT, generateFloor } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { TOWN, makeDungeon, makeTown } from '../src/game/level';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Level, Monster } from '../src/game/state';
import { T_FLOOR, T_VOID, T_WALL } from '../src/game/types';
import type { Element } from '../src/game/types';
import { CURTAIN_SECS, GATE_FALL_AT, GATE_RISE_AT, STAIR_APART, STAIR_CLEAR, STAIR_LONG, STAIR_SPOTS, STAIR_WIDE, TOWN_GATE, TOWN_WAY, WARP_SECS, WAYS, WAY_WAKE, nearStair, onTopStep, stairTiles, topStep } from '../src/game/ways';

const DT = 1 / 60;
const SEEDS = Array.from({ length: 24 }, (_, i) => 3001 + i * 7919);

/** The switch, set for the length of `run` and put back. */
function waysSet<T>(on: boolean, run: () => T): T {
  const was = WAYS.on;
  WAYS.on = on;
  try {
    return run();
  } finally {
    WAYS.on = was;
  }
}

type Inner = { damageMonster: (m: Monster, dmg: number, el: Element, crit: boolean, skill: number) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

/** Steps of the game with the player doing `c` (nothing, if not given); the events of all of them. */
function steps(g: Game, n: number, c: Controls = emptyControls()): GameEvent[] {
  const out: GameEvent[] = [];
  for (let k = 0; k < n; k++) {
    g.events.length = 0;
    g.update(DT, { ...c });
    out.push(...g.events);
  }
  return out;
}
/** The player pushing the stick along (mx, my) in the world, nothing else. */
function walking(mx: number, my: number): Controls {
  const c = emptyControls();
  c.mx = mx;
  c.my = my;
  return c;
}
/** Steps until `done` (at most `secs` seconds of them); how many it took (-1: never). */
function until(g: Game, secs: number, done: () => boolean, c: Controls = emptyControls()): number {
  for (let k = 0; k < secs / DT; k++) {
    if (done()) return k;
    g.events.length = 0;
    g.update(DT, { ...c });
  }
  return done() ? Math.round(secs / DT) : -1;
}
const tileOf = (L: Level, x: number, y: number): number => Math.floor(y) * L.floor.w + Math.floor(x);
/** Plain floor that a thing may be laid on: floor, not cut, no stair, at the floor's own height. */
function plain(L: Level, x: number, y: number): boolean {
  const f = L.floor;
  if (x < 0 || y < 0 || x >= f.w || y >= f.h) return false;
  const i = y * f.w + x;
  return f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0) && !(f.stair && f.stair[i] !== 0) && !(f.height && f.height[i] !== 0);
}
/** A game in town with the ways on: a hero nothing can hurt. */
function inTown(seed: number): Game {
  const g = new Game('warrior', seed);
  g.hero.invuln = 1e9;
  return g;
}

test('the switch is on in the game (Version 20.2; his "Good" of 10 Oct, 11:15); off, the town has no gate of the levels and no waypoint, and a dungeon its dark portal home, lit when its boss dies', () => {
  assert.equal(WAYS.on, true);
  waysSet(false, () => {
    const T = makeTown(7);
    assert.equal(T.ways, null);
    assert.deepEqual(T.doors, []);
    for (const [d, seed] of [[1, 3], [2, 6], [5, 41]]) {
      const L = makeDungeon(d, seed);
      assert.equal(L.ways, null);
      assert.ok(L.portal && L.portal.state === 0, `dungeon ${d}: its portal, dark`);
      assert.ok(!L.doors.some((q) => q.spot.kind === 'waygate'));
    }
    const g = new Game('warrior', 6);
    g.hero.invuln = 1e9;
    assert.equal(g.curtain(), 0);
    g.depth = 2;
    g.enterDungeon();
    const boss = g.monsters.find((m) => m.boss)!;
    inner(g).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
    assert.equal(g.level.portal!.state, 1, 'the boss dead, the portal home is lit');
  });
});

test('the stairwell and the waypoint are the size of their pictures', () => {
  assert.equal(STAIR_LONG, ART_STAIR_LONG);
  assert.equal(STAIR_WIDE, ART_STAIR_WIDE);
  // (a waypoint's dais, a tile and a half across: what placeWay keeps clear, as ways.ts has it)
  assert.equal(WAY_R, 0.75);
});

test('on, every floor has places for its stairwell in the boss\'s hall on plain floor, the first across its middle, and no portal; every floor from the second its waypoint beside where he comes in; the first its gate; and all can be walked to', () => {
  waysSet(true, () => {
    for (const layout of [false, true]) {
      const was = CRYPT_LAYOUT.on;
      CRYPT_LAYOUT.on = layout;
      try {
        for (let d = 1; d <= 7; d++) {
          for (const seed of SEEDS.slice(0, layout ? 8 : 16)) {
            const L = makeDungeon(d, seed);
            const f = L.floor;
            const at = `dungeon ${d}, seed ${seed}${layout ? ', the Crypt\'s layout' : ''}`;
            const W = L.ways;
            assert.ok(W, at);
            assert.equal(L.portal, null, `${at}: no portal`);
            // THE STAIRWELL'S PLACES: in the boss's hall, two at least, the first across its middle, apart; under each and a tile
            // round it plain floor with nothing standing on it, and no trap
            const st = W!.stair;
            assert.ok(st && !st.open, `${at}: its stairwell, shut`);
            assert.ok(W!.stairs.length >= 2 && W!.stairs.length <= STAIR_SPOTS && W!.stairs[0] === st, `${at}: its places (${W!.stairs.length})`);
            assert.deepEqual([st!.x, st!.y], [Math.floor(f.boss.x) - 1, Math.floor(f.boss.y) - 1], `${at}: the first across the hall's middle`);
            const hall = f.rooms.find((r) => r.kind === 'boss')!;
            for (const [k, sp] of W!.stairs.entries()) {
              assert.ok(sp.x >= hall.x && sp.y >= hall.y && sp.x + 3 <= hall.x + hall.w && sp.y + 2 <= hall.y + hall.h, `${at}: in the boss's hall`);
              for (const o of W!.stairs.slice(0, k)) assert.ok(Math.hypot(o.x - sp.x, o.y - sp.y) >= STAIR_APART);
              for (let y = sp.y - 1; y <= sp.y + 2; y++) {
                for (let x = sp.x - 1; x <= sp.x + 3; x++) {
                  assert.ok(plain(L, x, y), `${at}: plain floor at ${x},${y}`);
                  assert.ok(!L.props.some((p) => p.tx === x && p.ty === y && p.solid), `${at}: nothing standing at ${x},${y}`);
                  assert.ok(!L.hazards.some((z) => x >= z.spot.x && y >= z.spot.y && x < z.spot.x + z.spot.w && y < z.spot.y + z.spot.h), `${at}: no trap at ${x},${y}`);
                }
              }
            }
            // THE WAYPOINT, from the second floor: beside where he comes in, its dais on plain floor that nothing lies on
            const w = W!.way;
            if (d === 1) assert.equal(w, null, `${at}: none on the first floor`);
            else {
              assert.ok(w && !w.awake && w.warpAt === null, `${at}: its waypoint, asleep`);
              assert.ok(Math.hypot(w!.x - f.start.x, w!.y - f.start.y) <= 3.01, `${at}: beside where he comes in`);
              for (let y = Math.floor(w!.y - 0.75); y <= Math.floor(w!.y + 0.75); y++) {
                for (let x = Math.floor(w!.x - 0.75); x <= Math.floor(w!.x + 0.75); x++) {
                  assert.ok(plain(L, x, y) && L.walk[y * f.w + x] === 1, `${at}: its dais on plain floor at ${x},${y}`);
                  assert.ok(!L.props.some((p) => p.tx === x && p.ty === y && p.solid), `${at}: nothing standing on its dais`);
                }
              }
              assert.ok(!L.props.some((p) => !p.solid && Math.abs(p.x - w!.x) < 1.6 && Math.abs(p.y - w!.y) < 1.6), `${at}: nothing lying on it`);
            }
            // THE FIRST FLOOR'S GATE: in a back wall of its first room, open, the dark beyond, a wall either side, nothing before it
            if (d === 1) {
              assert.ok(W!.gate >= 0, `${at}: its gate`);
              const g = L.doors[W!.gate];
              const s = g.spot;
              const r0 = f.rooms[0];
              assert.equal(s.kind, 'waygate');
              assert.equal(s.room, r0.id);
              assert.equal(s.out, -1, 'in a back wall');
              assert.equal(s.plane, s.alongX ? r0.y : r0.x, 'of the first room');
              assert.ok(g.open === 1 && g.want === 1, 'standing open');
              const line = s.plane - 1;
              const t = (k: number, back: number): number => (s.alongX ? f.tiles[(line - back) * f.w + s.a + k] : f.tiles[(s.a + k) * f.w + line - back]);
              for (let k = 0; k < 3; k++) {
                assert.equal(t(k, 0), T_FLOOR, `${at}: its doorway`);
                assert.equal(t(k, 1), T_VOID, `${at}: the dark beyond it`);
              }
              assert.ok(t(-1, 0) === T_WALL && t(3, 0) === T_WALL, `${at}: a wall either side of it`);
              for (const i of doorTiles(f, s)) assert.equal(L.walk[i], 1);
              assert.ok(!L.props.some((p) => insideBy(s, p.x, p.y) > 0 && insideBy(s, p.x, p.y) < 2 && (s.alongX ? p.x : p.y) > s.a && (s.alongX ? p.x : p.y) < s.a + 3), `${at}: nothing before it`);
            } else assert.equal(W!.gate, -1);
            // ALL CAN BE WALKED TO from where he comes in (the stairwell's opening shut to walking, as when it is open; every
            // lever pulled and every gate up, as they are when he has come through: THE MIX's gate on the main path, its lever before it)
            const walk = L.walk.slice();
            for (const q of L.doors) for (const i of doorTiles(f, q.spot)) walk[i] = 1;
            for (const sp of W!.stairs) {
              const open = walk.slice();
              for (const i of stairTiles(f, sp)) open[i] = 0;
              const reach = flowField(open, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, L.step);
              const top = topStep(sp);
              assert.notEqual(reach[tileOf(L, top.x, top.y)], UNREACHABLE, `${at}: the stairwell's top step can be walked to, wherever it opens`);
            }
            const far = flowField(walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, L.step);
            if (w) assert.notEqual(far[tileOf(L, w.x, w.y)], UNREACHABLE, `${at}: the waypoint can be walked to`);
            if (d === 1) {
              const m = doorMiddle(L.doors[W!.gate].spot);
              assert.notEqual(far[tileOf(L, m.x, m.y)], UNREACHABLE, `${at}: the gate's doorway can be walked to`);
            }
          }
        }
      } finally {
        CRYPT_LAYOUT.on = was;
      }
    }
  });
});

test('on, the first floor\'s first room keeps its corners square, and the rest of the floor is laid as it would be; deeper floors are laid as they would be', () => {
  for (const seed of SEEDS.slice(0, 12)) {
    const off = waysSet(false, () => generateFloor(1, seed));
    const on = waysSet(true, () => generateFloor(1, seed));
    assert.deepEqual(on.rooms, off.rooms, `seed ${seed}: the same rooms`);
    assert.deepEqual(on.packs, off.packs, `seed ${seed}: the same packs`);
    assert.deepEqual([on.start, on.boss], [off.start, off.boss]);
    const r = on.rooms[0];
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        const i = y * on.w + x;
        assert.equal(on.tiles[i], T_FLOOR, `seed ${seed}: the first room whole at ${x},${y}`);
        assert.ok(!(on.cut && on.cut[i] !== 0), `seed ${seed}: no corner cut at ${x},${y}`);
      }
    }
    for (const d of [2, 3, 6]) assert.deepEqual(waysSet(true, () => generateFloor(d, seed)), waysSet(false, () => generateFloor(d, seed)), `dungeon ${d}, seed ${seed}`);
  }
});

test('on, the town has its gate of the levels where the field of light was, down; and its waypoint, on plain floor nothing stands on', () => {
  waysSet(true, () => {
    const T = makeTown(7);
    assert.ok(T.ways);
    assert.equal(T.doors.length, 1);
    const g = T.doors[T.ways!.gate];
    assert.deepEqual([g.spot.kind, g.spot.alongX, g.spot.a, g.spot.plane, g.spot.out], ['waygate', true, TOWN_GATE.a, TOWN_GATE.line + 1, -1]);
    assert.ok(g.open === 0 && g.want === 0, 'down');
    for (const i of doorTiles(T.floor, g.spot)) {
      assert.equal(T.floor.tiles[i], T_FLOOR, 'its doorway cut in the wall');
      assert.equal(T.walk[i], 0, 'and wall to walking until it rises');
      assert.equal(T.open[i], 0);
    }
    // (in the back wall where the gate's arch was, the town's gate wall)
    assert.ok(TOWN_GATE.a >= TOWN.gateWall.x && TOWN_GATE.a + 3 <= TOWN.gateWall.x + TOWN.gateWall.n && TOWN_GATE.line === TOWN.gateWall.y);
    const w = T.ways!.way!;
    assert.deepEqual([w.x, w.y, w.awake], [TOWN_WAY.x, TOWN_WAY.y, false]);
    for (let y = Math.floor(w.y - 0.75); y <= Math.floor(w.y + 0.75); y++) {
      for (let x = Math.floor(w.x - 0.75); x <= Math.floor(w.x + 0.75); x++) {
        assert.ok(plain(T, x, y) && T.walk[y * T.floor.w + x] === 1, `the town's waypoint on plain floor at ${x},${y}`);
        assert.ok(!T.props.some((p) => p.tx === x && p.ty === y), `nothing on it at ${x},${y}`);
      }
    }
  });
});

test('the town\'s gate rises as he comes and falls as he goes; walked into, it takes him, the screen darkening, to the first floor, just inside its gate', () => {
  waysSet(true, () => {
    const g = inTown(11);
    const L = g.level;
    const gate = L.doors[L.ways!.gate];
    const mid = doorMiddle(gate.spot);
    const h = g.hero;
    // further than GATE_RISE_AT: it stays down
    h.x = mid.x;
    h.y = mid.y + GATE_RISE_AT + 1;
    steps(g, 10);
    assert.equal(gate.want, 0);
    // nearer: it rises (its doorway open to walking at once; it is up in the gates' own time)
    h.y = mid.y + GATE_RISE_AT - 0.5;
    const ev = steps(g, 1);
    assert.equal(gate.want, 1);
    assert.ok(ev.some((e) => e.t === 'door' && e.kind === 'rise'));
    for (const i of doorTiles(L.floor, gate.spot)) assert.equal(L.walk[i], 1);
    assert.ok(until(g, 2, () => gate.open === 1) >= 0, 'up');
    // further than GATE_FALL_AT: it falls, quietly (no shake: it is nothing to fear)
    h.y = mid.y + GATE_FALL_AT + 0.5;
    const fall = steps(g, 1);
    assert.equal(gate.want, 0);
    assert.ok(!fall.some((e) => e.t === 'shake'));
    for (const i of doorTiles(L.floor, gate.spot)) assert.equal(L.walk[i], 0);
    // walked up to and into: through it
    h.y = mid.y + 4;
    assert.ok(until(g, 4, () => g.level !== L, walking(0, -1)) >= 0, 'through the gate');
    assert.equal(g.inDungeon, true);
    assert.equal(g.depth, 1);
    // (the screen dark as he came through, lightening over CURTAIN_SECS)
    assert.ok(g.curtain() > 0.9, `the screen dark as he comes in (${g.curtain().toFixed(2)})`);
    steps(g, Math.ceil(CURTAIN_SECS / DT) + 1);
    assert.equal(g.curtain(), 0);
    // just inside the first floor's gate, which stands open, looking into the room
    const W = g.level.ways!;
    const s = g.level.doors[W.gate].spot;
    const inside = insideBy(s, g.hero.x, g.hero.y);
    assert.ok(inside > 0.8 && inside < 1.6, `just inside its gate (${inside.toFixed(2)})`);
    assert.ok(g.hero.fx * (s.alongX ? 0 : -s.out) + g.hero.fy * (s.alongX ? -s.out : 0) > 0.99, 'looking into the room');
  });
});

test('the first floor\'s gate stands open: walked into, it takes him back to town, just inside the town\'s gate, up behind him, which falls once he has walked off', () => {
  waysSet(true, () => {
    const g = inTown(12);
    g.depth = 1;
    g.enterDungeon('gate');
    const L = g.level;
    const s = L.doors[L.ways!.gate].spot;
    const into = walking(s.alongX ? 0 : s.out, s.alongX ? s.out : 0);
    assert.ok(until(g, 3, () => g.level !== L, into) >= 0, 'back through the gate');
    assert.equal(g.level.town, true);
    const T = g.level;
    const gate = T.doors[T.ways!.gate];
    assert.ok(gate.open === 1 && gate.want === 1, 'the town\'s gate up behind him');
    const mid = doorMiddle(gate.spot);
    assert.ok(Math.abs(g.hero.x - mid.x) < 0.01 && g.hero.y - mid.y > 1 && g.hero.y - mid.y < 2.5, 'just inside it');
    assert.equal(g.inDungeon, false);
    // (he does not go straight back through it)
    steps(g, 30);
    assert.equal(g.level, T);
    g.hero.y = mid.y + GATE_FALL_AT + 1;
    steps(g, 1);
    assert.equal(gate.want, 0, 'it falls once he has walked off');
  });
});

test('the boss dead, the stairwell opens in his hall, clear of where he fell: by its middle, or, where he fell there, in the next of its places; no portal', () => {
  waysSet(true, () => {
    for (const [d, seed] of [[1, 21], [2, 22], [4, 23]]) {
      for (const onMiddle of [false, true]) {
        const g = inTown(seed);
        g.depth = d;
        g.enterDungeon();
        const L = g.level;
        const W = L.ways!;
        const first = W.stairs[0];
        const boss = g.monsters.find((m) => m.boss)!;
        // (he falls on the middle; or three tiles and more off it)
        boss.x = first.x + 1.2;
        boss.y = onMiddle ? first.y + 0.6 : first.y + 4.6;
        // (the hero well out of the way, where he came in)
        g.hero.x = L.floor.start.x;
        g.hero.y = L.floor.start.y;
        g.events.length = 0;
        inner(g).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
        const st = W.stair!;
        const at = `dungeon ${d}, the boss falling ${onMiddle ? 'on' : 'away from'} the middle`;
        assert.equal(st.open, true, `${at}: open`);
        assert.ok(W.stairs.includes(st));
        assert.equal(L.portal, null);
        if (onMiddle) assert.notEqual(st, first, `${at}: not where he fell`);
        else assert.equal(st, first, `${at}: by the hall's middle`);
        assert.ok(!nearStair(st, boss.x, boss.y, STAIR_CLEAR), `${at}: clear of his body`);
        assert.ok(g.events.some((e) => e.t === 'msg' && e.text === 'A stairwell opens in the floor. The way down.'));
        for (const i of stairTiles(L.floor, st)) assert.equal(L.walk[i], 0, 'its steps are not walked on');
        assert.ok(g.drops.length >= 3, 'the boss\'s hoard');
        for (const p of g.drops) assert.ok(!nearStair(st, p.x, p.y, 0.25), `${at}: nothing of his hoard on it (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`);
      }
    }
  });
});

test('whoever and whatever is on the stairwell\'s opening as it opens is put aside; its top step takes him down to the next floor, where he comes in beside its waypoint', () => {
  waysSet(true, () => {
    for (const [d, seed] of [[1, 21], [2, 22], [4, 23]]) {
      const g = inTown(seed);
      g.depth = d;
      g.enterDungeon();
      const L = g.level;
      const W = L.ways!;
      // (one place only, the hero standing on it, and something of the dungeon's lying on it too; the boss far off)
      W.stairs = [W.stairs[0]];
      const st = W.stairs[0];
      const boss = g.monsters.find((m) => m.boss)!;
      boss.x = st.x + 1.2;
      boss.y = st.y + 4.5;
      g.hero.x = st.x + 1.5;
      g.hero.y = st.y + 0.6;
      g.drops.push({ x: st.x + 0.5, y: st.y + 0.6, kind: 'gold', gold: 5, item: null, word: null, age: 0 });
      const cleared = g.cleared;
      inner(g).damageMonster(boss, boss.life + boss.shield + 1, 'phys', false, -1);
      assert.equal(W.stair, st);
      assert.equal(st.open, true);
      const onIt = (p: { x: number; y: number }): boolean => nearStair(st, p.x, p.y, 0.25);
      assert.ok(!onIt(g.hero) && !onTopStep(st, g.hero.x, g.hero.y), `dungeon ${d}: the hero put aside (${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
      for (const p of g.drops) assert.ok(!onIt(p), `dungeon ${d}: a drop put aside (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`);
      // (nor is he taken down by standing where it opened)
      steps(g, 30);
      assert.equal(g.level, L);
      // stepping onto its top step: down to the next floor, a floor cleared
      const top = topStep(st);
      g.hero.x = top.x - 1.2;
      g.hero.y = top.y;
      assert.ok(until(g, 3, () => g.level !== L, walking(1, 0)) >= 0, `dungeon ${d}: down the stairwell`);
      assert.equal(g.depth, d + 1);
      assert.equal(g.cleared, cleared + 1);
      assert.equal(g.inDungeon, true);
      assert.ok(g.curtain() > 0.9);
      // where he comes in on the next floor: its waypoint, asleep until he comes near (he comes in beside it)
      const w = g.level.ways!.way!;
      assert.equal(w.awake, false);
      assert.ok(Math.hypot(w.x - g.hero.x, w.y - g.hero.y) < WAY_WAKE);
      const ev = steps(g, 1);
      assert.equal(w.awake, true);
      assert.ok(ev.some((e) => e.t === 'sfx' && e.name === 'power'));
      assert.equal(g.wayDepth, d + 1, 'the deepest waypoint reached');
    }
  });
});

test('standing on an awake waypoint, the use button warps him to town, onto the town\'s; that one warps him back to the deepest floor whose waypoint he reached', () => {
  waysSet(true, () => {
    const g = inTown(31);
    // in town before any floor has a waypoint: the town's sleeps, and does nothing
    const T0 = g.level;
    g.hero.x = TOWN_WAY.x;
    g.hero.y = TOWN_WAY.y;
    steps(g, 2);
    assert.equal(T0.ways!.way!.awake, false);
    const use = emptyControls();
    use.interact = true;
    steps(g, 1, use);
    steps(g, Math.ceil(WARP_SECS / DT) + 2);
    assert.equal(g.level, T0, 'nothing to warp to');
    // down to the third floor, and onto its waypoint
    g.depth = 3;
    g.enterDungeon();
    assert.equal(g.wayDepth, 3);
    const L = g.level;
    const w = L.ways!.way!;
    g.hero.x = w.x;
    g.hero.y = w.y;
    steps(g, 1);
    assert.equal(g.interactHint(), 'Waypoint: to town');
    steps(g, 1, use);
    assert.ok(w.warpAt !== null, 'the warp begins on it');
    assert.equal(g.level, L);
    // (on his way he does nothing more here: pushing the stick moves him not at all)
    const x0 = g.hero.x;
    steps(g, 3, walking(1, 0));
    assert.equal(g.hero.x, x0);
    assert.ok(until(g, 1, () => g.level !== L) >= 0);
    assert.equal(g.level.town, true);
    const T = g.level;
    const tw = T.ways!.way!;
    assert.ok(Math.hypot(g.hero.x - tw.x, g.hero.y - tw.y) < 0.01, 'on the town\'s waypoint');
    assert.equal(tw.awake, true, 'awake: there is a floor to go back to');
    assert.equal(tw.warpAt, -WARP_SECS, 'coming out of its light');
    assert.equal(g.interactHint(), 'Waypoint: to dungeon 3');
    steps(g, 1, use);
    assert.ok(until(g, 1, () => g.level !== T) >= 0);
    assert.equal(g.inDungeon, true);
    assert.equal(g.depth, 3);
    const back = g.level.ways!.way!;
    assert.ok(Math.hypot(g.hero.x - back.x, g.hero.y - back.y) < 0.01, 'on the third floor\'s waypoint');
    assert.equal(back.awake, true);
  });
});

test('in town the gate is no longer used for its words: no service of the gate\'s, wherever he stands', () => {
  waysSet(true, () => {
    const g = inTown(41);
    const st = g.level.stations.find((s) => s.kind === 'gate')!;
    g.hero.x = st.x;
    g.hero.y = st.y;
    assert.notEqual(g.stationNear(), 'gate');
    assert.ok(!(g.interactHint() ?? '').startsWith('Gate'));
    const use = emptyControls();
    use.interact = true;
    assert.ok(!steps(g, 1, use).some((e) => e.t === 'station' && e.kind === 'gate'));
  });
  // (off, it is used as it always was)
  waysSet(false, () => {
    const g = inTown(41);
    const st = g.level.stations.find((s) => s.kind === 'gate')!;
    g.hero.x = st.x;
    g.hero.y = st.y;
    assert.equal(g.stationNear(), 'gate');
  });
});

test('the deepest waypoint reached is kept with the run; nothing of it is written while the switch is off', () => {
  waysSet(true, () => {
    const g = inTown(51);
    g.depth = 4;
    g.enterDungeon();
    assert.equal(g.wayDepth, 4);
    const s = g.save();
    assert.equal(s.way, 4);
    const r = Game.restore(JSON.parse(JSON.stringify(s)));
    assert.equal(r.wayDepth, 4);
    assert.equal(r.level.ways!.way!.awake, true, 'the town\'s waypoint awake for it');
  });
  waysSet(false, () => {
    const g = inTown(52);
    assert.equal('way' in g.save(), false);
  });
});
