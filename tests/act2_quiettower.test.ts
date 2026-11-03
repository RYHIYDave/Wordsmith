// THE HIGH CITY, FLOOR 20: THE QUIET TOWER, laid and dressed (game/act2/quiettower.ts, behind HIGH_CITY, off). His doc's level
// 20: "a climb up the tower's spiralling floors (a scriptorium, a bell-less belfry, rooms the fog has filled) to the open top
// under the sky."; "the torn-out last chapter lies open on the tower's top."; its boss "The Moth. Its floor is the Tower Top."
// Here, over several throws of the dice:
//   1. its zones are the art's (QT_ZONE), and its pieces' names are floor 20's;
//   2. the climb is laid by its own map-maker: the stair's foot, a scriptorium, a fogged room, a belfry, landings, the
//      stairhead last; the cell (the lair) and a store off it; the top a place of its own past the split (round, 16 across),
//      the boss's;
//   3. everything walked is reached from the start or from where he comes up on the top, and the two are not joined; no pack
//      at the stair's foot, the stairhead or on the top; the Hush's dust (the trap) in the fogged rooms;
//   4. the tower's stair solid at the stairhead, he reaching it; the last chapter on its lectern in the top's middle, solid;
//      the trapdoor open where he comes up, and nothing solid round it;
//   5. up the stair onto the top and down through the trapdoor (game/act2/tower_rules.ts); the trapdoor shut behind him as the
//      boss wakes to him and while it lives, open once it is dead.
//   run: tsx --test tests/act2_quiettower.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { Game } from '../src/game/game';
import { QT_PIECE, TOWER_ZONE } from '../src/game/act2/quiettower';
import { TOWER, TRAP_FRAME, stepTower, trapdoorOf } from '../src/game/act2/tower_rules';
import { QT_ZONE } from '../src/art/quiettower';
import { act1Pieces } from '../src/render/act1_pieces';
import { walkReach } from '../src/game/act2/housequiet';
import { T_FLOOR } from '../src/game/types';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const SEEDS = [1, 3, 4, 8, 11, 17];
function laid(seed: number): Game {
  const g = new Game('warrior', seed);
  g.depth = 20;
  g.cleared = 19;
  g.wayDepth = 20;
  g.enterDungeon();
  return g;
}
function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}

test("1. its zones are the art's, its pieces floor 20's", () => {
  assert.deepEqual({ ...TOWER_ZONE }, { ...QT_ZONE });
  const names = new Set([...act1Pieces(20).keys()]);
  for (const n of Object.values(QT_PIECE)) assert.ok(names.has(n), n);
});

test('2-4. the climb laid by its own map-maker, the top a place of its own, reached, its packs, its trap, its stair and its chapter', () => high(() => {
  for (const seed of SEEDS) {
    const g = laid(seed);
    const L = g.level;
    const f = L.floor;
    const T = L.land?.tower;
    assert.ok(T && L.land?.kind === 'quiettower', `${seed}: laid by its own map-maker`);
    const roles = T!.rooms.map((r) => r.role);
    for (const r of ['foot', 'scriptorium', 'fogged', 'belfry', 'landing', 'stairhead', 'cell', 'top'] as const) assert.ok(roles.includes(r), `${seed}: a ${r}`);
    const path = T!.rooms.filter((r) => r.path >= 0).sort((a, b) => a.path - b.path).map((r) => r.role);
    assert.equal(path[0], 'foot', `${seed}: he comes in at the stair's foot`);
    assert.equal(path[path.length - 2], 'stairhead', `${seed}: the stairhead last of the climb`);
    assert.equal(path[path.length - 1], 'top', `${seed}: then the top`);
    // (the top: round, 16 across, past the split; the boss's room)
    const W = f.w;
    let topTiles = 0;
    for (let y = 0; y < f.h; y++) for (let x = 0; x < W; x++) {
      if (f.tiles[y * W + x] !== T_FLOOR) continue;
      if (x >= T!.split) {
        topTiles++;
        assert.ok(Math.hypot(x + 0.5 - T!.top.cx, y + 0.5 - T!.top.cy) < T!.top.r, `${seed}: the top's tile (${x}, ${y}) within its round`);
      } else assert.ok(x < T!.split - 1, `${seed}: the climb kept off the split`);
    }
    assert.ok(topTiles > 180 && topTiles < 230, `${seed}: the top 16 across (${topTiles} tiles)`);
    const bossRoom = f.rooms.find((r) => r.kind === 'boss')!;
    assert.ok(bossRoom.x >= T!.split, `${seed}: the top is the boss's`);
    // (reached: the climb from the start, the top from where he comes up; never the one from the other)
    const fromStart = walkReach(L.walk, W, f.h, Math.floor(f.start.y) * W + Math.floor(f.start.x));
    const fromTop = walkReach(L.walk, W, f.h, Math.floor(T!.top.arrive.y) * W + Math.floor(T!.top.arrive.x));
    for (let i = 0; i < W * f.h; i++) {
      if (!L.walk[i]) continue;
      const x = i % W;
      assert.ok(x >= T!.split ? fromTop[i] : fromStart[i], `${seed}: tile (${x}, ${Math.floor(i / W)}) reached`);
      assert.ok(!(fromStart[i] && x >= T!.split), `${seed}: the top not walked to from the climb`);
    }
    // (the packs: none at the stair's foot, the stairhead or on the top)
    for (const p of f.packs) {
      const q = T!.rooms.find((r) => p.x >= r.r[0] && p.x < r.r[2] && p.y >= r.r[1] && p.y < r.r[3]);
      assert.ok(q && !['foot', 'stairhead', 'top'].includes(q.role), `${seed}: a pack in the ${q?.role}`);
    }
    // (the Hush's dust in the fogged rooms)
    for (const z of f.hazards ?? []) {
      const q = T!.rooms.find((r) => z.x >= r.r[0] && z.x < r.r[2] && z.y >= r.r[1] && z.y < r.r[3]);
      assert.equal(q?.role, 'fogged', `${seed}: the Hush's dust in a fogged room`);
    }
    // (the tower's stair solid, at the stairhead, he reaching it near enough to climb)
    const stair = L.props.find((p) => p.name === QT_PIECE.stair)!;
    const head = T!.rooms.find((r) => r.role === 'stairhead')!;
    assert.ok(stair && stair.solid && stair.tx >= head.r[0] && stair.tx < head.r[2] && stair.ty >= head.r[1] && stair.ty < head.r[3], `${seed}: the tower's stair at the stairhead`);
    let reach = false;
    for (let y = head.r[1]; y < head.r[3]; y++) for (let x = head.r[0]; x < head.r[2]; x++) if (fromStart[y * W + x] && Math.hypot(x + 0.5 - T!.stair.x, y + 0.5 - T!.stair.y) < TOWER.up) reach = true;
    assert.ok(reach, `${seed}: he can walk into the stair`);
    // (the last chapter on its lectern in the top's middle, solid; the trapdoor open where he comes up)
    const ch = L.props.find((p) => p.name === QT_PIECE.chapter)!;
    assert.ok(ch && ch.solid && Math.hypot(ch.x - T!.top.cx, ch.y - T!.top.cy) < 0.8, `${seed}: the last chapter in the top's middle`);
    const trap = trapdoorOf(L)!;
    assert.ok(trap && trap.variant === TRAP_FRAME.open, `${seed}: the trapdoor open`);
    assert.ok(L.walk[T!.top.trap.y * W + T!.top.trap.x] === 1, `${seed}: the trapdoor walked on`);
  }
}));

test('5. up the stair and down the trapdoor; shut behind him while the boss lives', () => high(() => {
  const g = laid(4);
  const L = g.level;
  const T = L.land!.tower!;
  const h = g.hero;
  // (up)
  h.x = T.stair.back.x;
  h.y = T.stair.back.y;
  assert.equal(stepTower(L, h, true), null, 'before the stair, nothing');
  h.x = T.stair.x + (T.stair.back.x - T.stair.x) * 0.55;
  h.y = T.stair.y + (T.stair.back.y - T.stair.y) * 0.55;
  assert.equal(stepTower(L, h, true), 'up');
  // (up there, as he comes: the trapdoor open while the boss has not woken to him; as it wakes, shut behind him)
  h.x = T.top.arrive.x;
  h.y = T.top.arrive.y;
  assert.equal(stepTower(L, h, true, false), null, 'where he comes up, the boss not yet awake: nothing');
  assert.equal(stepTower(L, h, true, true), 'slam');
  assert.equal(trapdoorOf(L)!.variant, TRAP_FRAME.shut);
  h.x = T.top.trap.x + 0.5;
  h.y = T.top.trap.y + 0.5;
  assert.equal(stepTower(L, h, true), null, 'shut: not down');
  // (the boss dead: open, and down)
  assert.equal(stepTower(L, h, false), 'open');
  assert.equal(stepTower(L, h, false), 'down');
}));

test('off, nothing of it: floor 20 not laid', () => {
  assert.equal(HIGH_CITY.on, false);
});
