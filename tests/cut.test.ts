// TRIANGLES: a tile cut corner to corner, half of it wall.
//
// The owner, 7 Oct 2026, 06:59: "What would happen if we added triangles to the tileset?"; 07:01:
// "Id like see some stills of some rooms with triangles to decide"; of those stills, 08:01:
// "Triangles look pretty good I like it".
//
// What is held here (game/cut.ts says it in full):
//   - which half of a cut tile is wall, and how far a place lies into it;
//   - a body stands on the floor half and is held off the slanting wall by its own half width,
//     as off any wall; pushed against it at a slant, it slides along it;
//   - a line of sight and a shot meet the wall half as wall;
//   - way-finding leaves cut tiles alone, and a monster still comes at a hero who stands on one;
//   - the rooms built by hand for it have the cuts they say;
//   - a level with no cut tile is exactly as it was (the town, the practice room, a dungeon: the
//     map-maker lays none yet);
//   - on a level with heights a body slides along a slanting wall as on one without;
//   - what the map-maker lays with its switch on (game/dungeon.ts, cutClean): the corners it takes
//     off in steps today, cut clean; and a TERRACE RUNS UP TO A SLANTING WALL on half tiles of
//     raised floor, so that cutting the corners clean costs no terraces.
//   run: tsx --test tests/cut.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { bodyInWall, cutHalf, cutLow, inWall, intoWall, segmentInWall } from '../src/game/cut';
import { botStep, newBot } from '../src/dev/bot';
import { TUNE } from '../src/game/defs';
import { RELIEF, generateFloor } from '../src/game/dungeon';
import { STAIR_N, stepGrid } from '../src/game/height';
import { Game } from '../src/game/game';
import { SHAPES, makeArena, makeShapeRoom, makeTown } from '../src/game/level';
import type { Shape } from '../src/game/level';
import { lineOfSight } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster } from '../src/game/state';
import { CUT_FAR, CUT_FAR_LOW, CUT_LEFT, CUT_LEFT_LOW, CUT_NEAR, CUT_NEAR_LOW, CUT_RIGHT, CUT_RIGHT_LOW, T_FLOOR, T_WALL } from '../src/game/types';
import type { ClassId, Floor, Room } from '../src/game/types';

const DT = 1 / 60;
const R = TUNE.heroRadius;
const R2 = Math.SQRT1_2;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  free: (grid: Uint8Array, x: number, y: number, r: number) => boolean;
};
const inner = (g: Game): Inner => g as unknown as Inner;

function room(kind: Shape, cls: ClassId, x: number, y: number): Game {
  const g = Game.forPractice(cls, 5, `shape:${kind}`);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = x;
  g.hero.y = y;
  return g;
}
function step(g: Game, c: Controls, seconds: number, each?: () => void): void {
  for (let t = 0; t < seconds; t += DT) {
    g.update(DT, c);
    if (each) each();
  }
}
function walk(g: Game, mx: number, my: number, seconds: number, each?: () => void): void {
  const c = emptyControls();
  c.mx = mx;
  c.my = my;
  step(g, c, seconds, each);
}

// (the room of 'cut': floor of x 8..21, y 8..21, each corner cut three tiles. The four cuts are the lines
//   back   x + y = 19     front  x + y = 41     left  y - x = 11     right  x - y = 11)
const CUTS = {
  back: (x: number, y: number): number => (x + y - 19) * R2,
  front: (x: number, y: number): number => (41 - x - y) * R2,
  left: (x: number, y: number): number => (11 - (y - x)) * R2,
  right: (x: number, y: number): number => (11 - (x - y)) * R2,
};

test('which half of a cut tile is wall, and how far a place lies into it', () => {
  assert.equal(cutHalf(CUT_FAR_LOW), CUT_FAR);
  assert.equal(cutHalf(CUT_NEAR_LOW), CUT_NEAR);
  assert.equal(cutHalf(CUT_LEFT_LOW), CUT_LEFT);
  assert.equal(cutHalf(CUT_RIGHT_LOW), CUT_RIGHT);
  assert.equal(cutHalf(0), 0);
  assert.ok(cutLow(CUT_FAR_LOW) && !cutLow(CUT_FAR));
  // the tile's top corner is (0, 0), its right one (1, 0), its bottom one (1, 1), its left one (0, 1)
  assert.ok(intoWall(CUT_FAR, 0.1, 0.1) > 0 && intoWall(CUT_FAR, 0.9, 0.9) < 0, 'far: the top corner is wall');
  assert.ok(intoWall(CUT_NEAR, 0.9, 0.9) > 0 && intoWall(CUT_NEAR, 0.1, 0.1) < 0, 'near: the bottom corner is wall');
  assert.ok(intoWall(CUT_LEFT, 0.1, 0.9) > 0 && intoWall(CUT_LEFT, 0.9, 0.1) < 0, 'left: the left corner is wall');
  assert.ok(intoWall(CUT_RIGHT, 0.9, 0.1) > 0 && intoWall(CUT_RIGHT, 0.1, 0.9) < 0, 'right: the right corner is wall');
  // on the cut itself: neither side; and the measure is the distance square to the cut
  for (const c of [CUT_FAR, CUT_NEAR]) assert.ok(Math.abs(intoWall(c, 0.3, 0.7)) < 1e-12);
  for (const c of [CUT_LEFT, CUT_RIGHT]) assert.ok(Math.abs(intoWall(c, 0.4, 0.4)) < 1e-12);
  assert.ok(Math.abs(intoWall(CUT_NEAR, 1, 1) - R2) < 1e-12, 'the far corner of the wall half is half a diagonal in');
  assert.equal(intoWall(0, 0.5, 0.5), -1, 'a whole tile has no wall half');
});

test('a body is held off the wall half by its own half width, and a stretch of line is in it if either end is', () => {
  // a tile at (4, 7) cut NEAR: the cut is the line from (4, 8) to (5, 7)
  const c = CUT_NEAR;
  assert.ok(!bodyInWall(c, 4, 7, 4.2, 7.2, 0.3), 'well out on the floor half');
  assert.ok(bodyInWall(c, 4, 7, 4.45, 7.45, 0.3), 'its edge is over the cut');
  assert.ok(bodyInWall(c, 4, 7, 4.8, 7.8, 0.3), 'its middle is in the wall');
  // exactly its half width from the cut: it stands
  const d = 0.3 / R2;
  assert.ok(!bodyInWall(c, 4, 7, 4.5 - d / 2, 7.5 - d / 2, 0.3));
  assert.ok(bodyInWall(c, 4, 7, 4.5 - d / 2 + 0.01, 7.5 - d / 2 + 0.01, 0.3));
  // a body in the next tile along, past the end of the cut: the wall half is a triangle, not a whole half of the world
  assert.ok(!bodyInWall(c, 4, 7, 3.5, 8.6, 0.3), 'beyond the end of the cut, off the tile');
  assert.ok(bodyInWall(c, 4, 7, 5.2, 7.9, 0.3), 'beside the wall half, within its reach');
  assert.ok(segmentInWall(c, 4, 7, 4.1, 7.1, 4.9, 7.9));
  assert.ok(!segmentInWall(c, 4, 7, 4.0, 7.5, 4.5, 7.0));
});

test('the rooms built by hand have the cuts they say', () => {
  const count = (f: Floor): number => (f.cut ? Array.from(f.cut).filter((v) => v !== 0).length : 0);
  for (const kind of SHAPES) {
    const L = makeShapeRoom(kind, 1);
    const f = L.floor;
    const want = kind === 'square' || kind === 'stepped' ? 0 : -1;
    if (want === 0) assert.equal(count(f), 0, `${kind}: no cut`);
    else assert.ok(count(f) > 0, `${kind}: has cuts`);
    if (!f.cut) continue;
    for (let i = 0; i < f.cut.length; i++) {
      if (f.cut[i] === 0) continue;
      assert.ok(f.tiles[i] === T_FLOOR || f.tiles[i] === T_WALL, `${kind}: a cut on what is neither floor nor wall`);
      // way-finding leaves it alone; sight goes by the cut itself
      assert.equal(L.walk[i], 0, `${kind}: a cut tile open to way-finding`);
      assert.equal(L.open[i], f.tiles[i] === T_FLOOR ? 1 : 0);
    }
  }
  const f = makeShapeRoom('cut', 1).floor;
  assert.equal(count(f), 20, 'four corners: three half tiles of floor and two of wall behind them');
  const cut = f.cut;
  assert.ok(cut);
  if (!cut) return;
  const at = (x: number, y: number): number => cut[y * f.w + x];
  assert.equal(at(9, 9), CUT_FAR);
  assert.equal(f.tiles[9 * f.w + 9], T_FLOOR);
  assert.equal(at(9, 8), CUT_NEAR);
  assert.equal(f.tiles[8 * f.w + 9], T_WALL);
  assert.equal(at(20, 20), CUT_NEAR_LOW, 'the corner toward the eye is cut down low');
  assert.equal(at(9, 20), CUT_LEFT);
  assert.equal(at(20, 9), CUT_RIGHT);
  // a place on each half of (9, 9)
  assert.ok(inWall(f, 9.2, 9.2) && !inWall(f, 9.8, 9.8));
  assert.ok(!inWall(f, 12.5, 12.5), 'a whole tile has no wall half');
});

test('a hero walking into a cut corner is stopped by the slanting wall at their own half width from it, in all four corners', () => {
  const cases: [keyof typeof CUTS, number, number, number, number][] = [
    ['back', 12.5, 12.5, -1, -1],
    ['front', 17.5, 17.5, 1, 1],
    // (not from the two tiles a pillar stands on)
    ['left', 11.5, 18.5, -1, 1],
    ['right', 18.5, 11.5, 1, -1],
  ];
  for (const [which, x, y, mx, my] of cases) {
    const g = room('cut', 'warrior', x, y);
    const off = CUTS[which];
    let least = Infinity;
    walk(g, mx, my, 3, () => {
      least = Math.min(least, off(g.hero.x, g.hero.y));
      assert.ok(inner(g).free(g.level.walk, g.hero.x, g.hero.y, R), `${which}: the hero stands where a body may`);
    });
    const end = off(g.hero.x, g.hero.y);
    assert.ok(least >= R - 1e-6, `${which}: never nearer the wall than their half width (${least.toFixed(3)})`);
    assert.ok(end <= R + 0.08, `${which}: and came right up to it (${end.toFixed(3)} from it at the end)`);
  }
});

test('pushed against a slanting wall at a slant, a hero slides along it', () => {
  // along the back wall of the room toward its back corner, then on down the cut
  let g = room('cut', 'warrior', 12.5, 9.5);
  walk(g, -1, 0, 3, () => assert.ok(CUTS.back(g.hero.x, g.hero.y) >= R - 1e-6));
  assert.ok(g.hero.y > 10.4 && g.hero.x < 9.3, `slid down the cut (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
  // and the other way
  g = room('cut', 'warrior', 9.5, 12.5);
  walk(g, 0, -1, 3, () => assert.ok(CUTS.back(g.hero.x, g.hero.y) >= R - 1e-6));
  assert.ok(g.hero.x > 10.4 && g.hero.y < 9.3, `slid up the cut (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
  // straight at it, square: no slide
  g = room('cut', 'warrior', 11.5, 11.5);
  walk(g, -1, -1, 2);
  assert.ok(Math.abs(g.hero.x - g.hero.y) < 1e-6, 'walked straight and stayed on the line');
});

test('on a level with heights a hero slides along a slanting wall exactly as on one without: the rule of height is not asked of the back of the wall', () => {
  // (Game.free asks the rule of height of every tile a body's box lies over. The back of a slanting
  // wall is a WALL tile, cut: no step leads to it. A body sliding along the wall has a corner of its
  // box over that tile at every tile it passes, its round middle well clear: were the rule asked,
  // it would be refused there on every level that has heights, and catch.)
  const run = (heights: boolean, x: number, y: number, mx: number, my: number): { x: number; y: number }[] => {
    const g = room('cut', 'warrior', x, y);
    if (heights) {
      // a patch of raised floor out in the room, away from the walk: the level now has a grid of steps
      const f = g.level.floor;
      const h = new Int8Array(f.w * f.h);
      for (const [tx, ty] of [[15, 15], [16, 15], [15, 16], [16, 16]]) h[ty * f.w + tx] = 1;
      f.height = h;
      (g.level as { step: Uint8Array | null }).step = stepGrid(f);
    }
    assert.equal(g.level.step !== null && g.level.step !== undefined, heights, 'the level has a grid of steps only with heights');
    const path: { x: number; y: number }[] = [];
    walk(g, mx, my, 3, () => path.push({ x: g.hero.x, y: g.hero.y }));
    return path;
  };
  // down the back corner's cut and up it, down the left corner's and along the right corner's
  const walks: [number, number, number, number][] = [
    [12.5, 9.5, -1, 0],
    [9.5, 12.5, 0, -1],
    [9.5, 17.5, 0, 1],
    [17.5, 9.5, 1, 0],
  ];
  for (const [x, y, mx, my] of walks) {
    const flat = run(false, x, y, mx, my);
    const high = run(true, x, y, mx, my);
    assert.equal(high.length, flat.length);
    const moved = Math.hypot(flat[flat.length - 1].x - x, flat[flat.length - 1].y - y);
    assert.ok(moved > 2, `from ${x},${y}: the hero went along the wall (${moved.toFixed(2)} tiles)`);
    for (let i = 0; i < flat.length; i++) {
      const off = Math.hypot(flat[i].x - high[i].x, flat[i].y - high[i].y);
      assert.ok(off < 1e-9, `from ${x},${y}, step ${i}: with heights the hero is at ${high[i].x.toFixed(3)},${high[i].y.toFixed(3)}, without at ${flat[i].x.toFixed(3)},${flat[i].y.toFixed(3)}`);
    }
  }
});

test('a hero may stand on the floor half of a cut tile, and each hero\'s swipe does not land in the wall half', () => {
  const g = room('cut', 'warrior', 9.8, 9.8);
  assert.ok(inner(g).free(g.level.walk, 9.8, 9.8, R), 'on the floor half of the tile (9, 9)');
  assert.ok(!inner(g).free(g.level.walk, 9.4, 9.4, R), 'not in its wall half');
  assert.equal(g.level.walk[9 * g.level.floor.w + 9], 0, 'though way-finding has the tile shut');
  for (const cls of ['warrior', 'ranger', 'mage'] as ClassId[]) {
    const h = room('cut', cls, 12.5, 12.5);
    const c = emptyControls();
    c.evade = true;
    c.evadeX = 8.3;
    c.evadeY = 8.3;
    h.update(DT, c);
    step(h, emptyControls(), 0.8);
    assert.ok(CUTS.back(h.hero.x, h.hero.y) >= R - 1e-6, `${cls}: landed ${CUTS.back(h.hero.x, h.hero.y).toFixed(2)} from the wall`);
    assert.ok(inner(h).free(h.level.walk, h.hero.x, h.hero.y, R));
  }
});

test('a line of sight meets the wall half as wall', () => {
  // five tiles by five of open floor, the middle one cut
  const w = 5;
  const grid = new Uint8Array(w * w).fill(1);
  const cut = new Uint8Array(w * w);
  const los = (x0: number, y0: number, x1: number, y1: number): boolean => lineOfSight(grid, w, w, x0, y0, x1, y1, cut);
  cut[2 * w + 2] = CUT_NEAR;
  assert.ok(!los(0.5, 2.5, 4.5, 2.5), 'straight across the tile: into the wall half');
  assert.ok(!los(2.5, 0.5, 2.5, 4.5));
  assert.ok(!los(2.1, 2.1, 2.9, 2.9), 'from the floor half to the wall half');
  assert.ok(los(1.5, 2.9, 2.9, 1.5), 'across the floor half only');
  assert.ok(los(0.5, 1.5, 4.5, 1.5), 'past it, a tile away');
  assert.ok(!los(4.5, 4.5, 2.2, 2.2), 'through the wall half from behind');
  cut[2 * w + 2] = CUT_LEFT;
  assert.ok(!los(0.5, 2.5, 4.5, 2.5));
  assert.ok(los(2.6, 0.5, 2.9, 2.4), 'down the floor half');
  assert.ok(!los(2.2, 2.9, 2.9, 2.95), 'it ends in the wall half, and begins in it');
  // and with no cuts given, the same lines are clear
  assert.ok(lineOfSight(grid, w, w, 0.5, 2.5, 4.5, 2.5));
});

test('an arrow shot at a slanting wall stops at it', () => {
  const g = room('cut', 'ranger', 13.5, 13.5);
  const c = emptyControls();
  c.fire = true;
  c.aimX = 8.5;
  c.aimY = 8.5;
  let least = Infinity;
  let shots = 0;
  for (let t = 0; t < 2.5; t += DT) {
    g.update(DT, c);
    for (const p of g.projectiles) {
      shots++;
      least = Math.min(least, CUTS.back(p.x, p.y));
    }
  }
  assert.ok(shots > 0, 'arrows flew');
  assert.ok(least > -0.4, `none went on through the wall (the furthest was ${(-least).toFixed(2)} into it)`);
  assert.ok(least < 0.6, 'and they got as far as the wall');
});

test('way-finding leaves cut tiles alone, and a skeleton still comes at a hero who stands on one', () => {
  const g = room('cut', 'warrior', 9.85, 9.85);
  const m = inner(g).spawn('skeleton', 14.5, 14.5, 900, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  const c = emptyControls();
  let near = Infinity;
  const life = g.hero.life;
  for (let t = 0; t < 8; t += DT) {
    g.update(DT, c);
    near = Math.min(near, Math.hypot(m.x - g.hero.x, m.y - g.hero.y));
    assert.ok(CUTS.back(m.x, m.y) >= Math.min(m.r, 0.42) - 1e-6, 'the skeleton keeps out of the wall');
  }
  assert.ok(near < 1.6, `it came up to them (${near.toFixed(2)} tiles at the nearest)`);
  assert.ok(g.hero.life < life, 'and struck');
});

test('a level with no cut tile has none of this: the town, the practice room, a dungeon made with the switch off', () => {
  assert.equal(makeTown(1).floor.cut, undefined);
  assert.equal(makeArena(1).floor.cut, undefined);
  for (const depth of [1, 3, 6]) assert.equal(cutsSet(false, () => generateFloor(depth, 500 + depth)).cut, undefined, `dungeon ${depth}: a cut tile with the switch off`);
});

// ---------------------------------------------------------------------------------------------
// What the map-maker lays (game/dungeon.ts, cutClean), with its switch on: the corners of rooms
// that it took off in steps before Version 18.2, cut clean. (The switch is ON in the game since
// 18.2: he had been told "You'll see real dungeon rooms before it goes live", was sent three of
// them on 7 Oct 2026 at 11:11, and said at 11:28 "That’s good.")

/**
 * Run with the map-maker's switch for the triangle rooms set, AND THE CORRIDOR ACROSS THE SCREEN
 * OFF (it has a switch of its own, on in the game since Version 18.3, and sets a dungeon's rooms
 * down differently: these are the tests of the room shapes by themselves, which never move a
 * room). Both switches are put back as they were.
 */
function cutsSet<T>(on: boolean, run: () => T): T {
  const was = [RELIEF.cuts, RELIEF.across];
  RELIEF.cuts = on;
  RELIEF.across = false;
  try {
    return run();
  } finally {
    RELIEF.cuts = was[0];
    RELIEF.across = was[1];
  }
}

interface Sample {
  depth: number;
  seed: number;
  f: Floor;
}
const samples: Sample[] = cutsSet(true, () => {
  const out: Sample[] = [];
  for (const depth of [1, 2, 3, 5, 8, 12]) for (let k = 0; k < 12; k++) out.push({ depth, seed: 7000 + depth * 97 + k * 31, f: generateFloor(depth, 7000 + depth * 97 + k * 31) });
  return out;
});
const label = (s: Sample): string => `dungeon ${s.depth}, seed ${s.seed}`;

test('the switch is on in the game (the owner, 7 Oct 2026, 11:28, of the pictures of real rooms: "That’s good."), and with it off no dungeon has a cut tile', () => {
  assert.equal(RELIEF.cuts, true, 'the switch is on');
  for (const s of samples.filter((_, i) => i % 5 === 0)) assert.equal(cutsSet(false, () => generateFloor(s.depth, s.seed)).cut, undefined, label(s));
});

test('with it on, most dungeons have corners cut clean; the rooms are the rooms they were', () => {
  let withCuts = 0;
  let tiles = 0;
  for (const s of samples) {
    if (s.f.cut) {
      withCuts++;
      tiles += Array.from(s.f.cut).filter((v) => v !== 0).length;
    }
  }
  assert.ok(withCuts >= samples.length * 0.8, `${withCuts} of ${samples.length} dungeons have cut corners`);
  console.log(`(${withCuts} of ${samples.length} dungeons have corners cut clean: ${tiles} cut tiles)`);
  for (const s of samples.filter((_, i) => i % 4 === 0)) {
    const flat = cutsSet(false, () => generateFloor(s.depth, s.seed));
    assert.deepEqual(s.f.rooms, flat.rooms, `${label(s)}: the rooms`);
    assert.deepEqual(s.f.start, flat.start);
    assert.deepEqual(s.f.boss, flat.boss);
    // (the floor differs only at the corners that are cut: a tile that is whole floor with the cuts was floor without them)
    for (let i = 0; i < s.f.tiles.length; i++) {
      if (s.f.tiles[i] === T_FLOOR) assert.equal(flat.tiles[i], T_FLOOR, `${label(s)}: floor where there was none`);
    }
  }
});

test('a cut corner is a slanting wall a whole tile thick: half tiles of floor, and behind each the back of the wall', () => {
  for (const s of samples) {
    const f = s.f;
    const cut = f.cut;
    if (!cut) continue;
    const kind = (x: number, y: number): number => (x >= 0 && y >= 0 && x < f.w && y < f.h ? f.tiles[y * f.w + x] : 0);
    for (let y = 0; y < f.h; y++) {
      for (let x = 0; x < f.w; x++) {
        const c = cut[y * f.w + x];
        if (c === 0) continue;
        const t = kind(x, y);
        assert.ok(t === T_FLOOR || t === T_WALL, `${label(s)}: a cut on what is neither floor nor wall at ${x},${y}`);
        if (t !== T_FLOOR) continue;
        // the two tiles across the sides of its wall half are wall
        const h = cutHalf(c);
        const sides: [number, number][] = h === CUT_FAR ? [[-1, 0], [0, -1]] : h === CUT_NEAR ? [[1, 0], [0, 1]] : h === CUT_LEFT ? [[-1, 0], [0, 1]] : [[1, 0], [0, -1]];
        for (const [dx, dy] of sides) assert.equal(kind(x + dx, y + dy), T_WALL, `${label(s)}: the wall half of ${x},${y} has no wall behind it at ${x + dx},${y + dy}`);
        // and the two across the sides of its floor half are floor
        for (const [dx, dy] of sides) assert.equal(kind(x - dx, y - dy), T_FLOOR, `${label(s)}: the floor half of ${x},${y} opens on what is not floor`);
      }
    }
    // no wall is left standing that touches no floor (the slanting wall's own back apart)
    for (let y = 1; y < f.h - 1; y++) {
      for (let x = 1; x < f.w - 1; x++) {
        if (kind(x, y) !== T_WALL) continue;
        let touches = false;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (kind(x + dx, y + dy) === T_FLOOR) touches = true;
        assert.ok(touches, `${label(s)}: a wall at ${x},${y} that touches no floor`);
      }
    }
  }
});

test('some big rooms are eight-sided halls and some have a flat back wall; a wide cut keeps clear of doorways and of the cut beside it, and is in neither the first room nor the boss\'s', () => {
  let eight = 0;
  let flatBack = 0;
  let cutRooms = 0;
  for (const s of samples) {
    const f = s.f;
    if (!f.cut) continue;
    const inRoom = (x: number, y: number): boolean => f.rooms.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
    for (const r of f.rooms) {
      // how many tiles a corner is cut: along the room's edge from the corner, the first tile that is floor
      const cutOf = (cx: number, cy: number, sx: number): number => {
        let n = 0;
        while (n < 9 && f.tiles[cy * f.w + cx + n * sx] !== T_FLOOR) n++;
        return n;
      };
      const x1 = r.x + r.w - 1;
      const y1 = r.y + r.h - 1;
      const back = cutOf(r.x, r.y, 1);
      const right = cutOf(x1, r.y, -1);
      const left = cutOf(r.x, y1, 1);
      const front = cutOf(x1, y1, -1);
      const all = [back, right, left, front];
      const widest = Math.max(...all);
      if (widest === 0) continue;
      cutRooms++;
      const where = `${label(s)}, room ${r.id} (${r.kind}, ${r.w} by ${r.h}, cut ${all.join(' ')})`;
      assert.ok(widest <= 6, `${where}: a corner cut wider than six`);
      if (r.kind === 'start' || r.kind === 'boss') assert.ok(widest <= 3, `${where}: a wide cut in the ${r.kind} room`);
      // (a small room has small cuts; but a treasure vault of 8 a side or more has a flat back wall three tiles wide)
      if (Math.min(r.w, r.h) < 10) assert.ok(Math.max(right, left, front) <= 2 && back <= (r.kind === 'treasure' ? 3 : 2), `${where}: a wide cut in a small room`);
      // two tiles of straight wall at the least between two cuts
      assert.ok(back + right + 2 <= r.w - 1 && left + front + 2 <= r.w - 1, `${where}: two cuts meet along a wall`);
      assert.ok(back + left + 2 <= r.h - 1 && right + front + 2 <= r.h - 1, `${where}: two cuts meet along a wall`);
      // a wide cut has no doorway near it (corridor floor: floor that is in no room)
      const corners: [number, number, number][] = [
        [r.x, r.y, back],
        [x1, r.y, right],
        [r.x, y1, left],
        [x1, y1, front],
      ];
      for (const [cx, cy, c] of corners) {
        if (c < 4) continue;
        for (let y = cy - c - 1; y <= cy + c + 1; y++) {
          for (let x = cx - c - 1; x <= cx + c + 1; x++) {
            if (x < 0 || y < 0 || x >= f.w || y >= f.h) continue;
            assert.ok(!(f.tiles[y * f.w + x] === T_FLOOR && !inRoom(x, y)), `${where}: a doorway at ${x},${y} near the wide cut at ${cx},${cy}`);
          }
        }
      }
      if (all.filter((c) => c >= 3).length >= 3) eight++;
      else if (back >= (r.kind === 'treasure' ? 3 : 4) && back > Math.max(right, left)) flatBack++;
    }
  }
  console.log(`(of ${cutRooms} rooms with a cut corner in ${samples.length} dungeons: ${eight} eight-sided halls, ${flatBack} with a flat back wall)`);
  assert.ok(eight >= 10, `${eight} eight-sided halls`);
  assert.ok(flatBack >= 10, `${flatBack} rooms with a flat back wall`);
});

test('most flat back walls have a fire toward each end, and in a treasure vault the two chests stand between them', () => {
  let walls = 0;
  let lit = 0;
  let vaults = 0;
  let staged = 0;
  for (const s of samples) {
    const f = s.f;
    if (!f.cut) continue;
    for (const r of f.rooms) {
      const cutOf = (cx: number, cy: number, sx: number): number => {
        let n = 0;
        while (n < 9 && f.tiles[cy * f.w + cx + n * sx] !== T_FLOOR) n++;
        return n;
      };
      const x1 = r.x + r.w - 1;
      const y1 = r.y + r.h - 1;
      const c = cutOf(r.x, r.y, 1);
      // (wider than the corners to its left and its right: the corner toward the eye makes no difference)
      const others = Math.max(cutOf(x1, r.y, -1), cutOf(r.x, y1, 1));
      const vault = r.kind === 'treasure';
      if (c < (vault ? 3 : 4) || c <= others) continue;
      walls++;
      // the first whole tiles in front of the wall, counted from the left end of their line on the screen
      const at = (k: number): { x: number; y: number } => ({ x: r.x + k, y: r.y + c + 1 - k });
      const has = (kind: string, p: { x: number; y: number }): boolean => f.props.some((q) => q.kind === kind && q.x === p.x && q.y === p.y);
      // (a pair of fires at the wall's two ends, or one tile in from them. One fire alone at an end is
      // no pair of this: any room's fires may come to stand in a corner.)
      const pair = (inset: number): boolean => has('brazier', at(inset)) && has('brazier', at(c + 1 - inset));
      const where = `${label(s)}, room ${r.id} (${r.kind}, ${r.w} by ${r.h}, back wall ${c})`;
      if (pair(0) || pair(1)) lit++;
      if (!vault) continue;
      vaults++;
      const spots = c % 2 === 0 ? [at(c / 2), at(c / 2 + 1)] : [at((c + 1) / 2 - 1), at((c + 1) / 2 + 1)];
      const chests = spots.filter((p) => has('chest', p)).length;
      assert.notEqual(chests, 1, `${where}: one chest alone against the flat wall`);
      if (chests === 2) staged++;
      const inRoom = f.props.filter((q) => q.kind === 'chest' && q.x >= r.x && q.x <= x1 && q.y >= r.y && q.y <= y1).length;
      assert.ok(inRoom <= 2, `${where}: ${inRoom} chests in a vault (the two against the wall are in place of the two in the middle, not as well)`);
    }
  }
  console.log(`(${walls} flat back walls: ${lit} with their two fires; ${vaults} of them in vaults, ${staged} with the chests between the fires)`);
  assert.ok(lit >= walls * 0.7, `${lit} of ${walls} flat back walls with two fires`);
  assert.ok(staged >= 3, `${staged} vaults with their chests against the flat wall`);
});

test('nothing stands or lies on a cut tile, no pack is put down on one and no floor is sunk on one; a terrace runs up to a slanting wall on half tiles', () => {
  const was = RELIEF.sunken;
  RELIEF.sunken = true;
  let raisedHalves = 0;
  try {
    for (const s of samples.filter((_, i) => i % 2 === 0)) {
      const f = cutsSet(true, () => generateFloor(s.depth, s.seed));
      const cut = f.cut;
      if (!cut) continue;
      const lvl = (j: number): number => (f.height ? f.height[j] : 0);
      for (const p of f.props) assert.equal(cut[p.y * f.w + p.x], 0, `${label(s)}: a ${p.kind} on a cut tile`);
      for (const p of f.packs) assert.equal(cut[Math.floor(p.y) * f.w + Math.floor(p.x)], 0, `${label(s)}: a pack on a cut tile`);
      for (let i = 0; i < cut.length; i++) {
        if (cut[i] === 0) continue;
        const x = i % f.w;
        const y = (i - x) / f.w;
        assert.ok(lvl(i) >= 0, `${label(s)}: a cut tile that is sunk at ${x},${y}`);
        assert.equal(f.stair ? f.stair[i] : 0, 0, `${label(s)}: stairs on a cut tile at ${x},${y}`);
        if (f.tiles[i] !== T_FLOOR) {
          assert.equal(lvl(i), 0, `${label(s)}: the back of a slanting wall has a height at ${x},${y}`);
          continue;
        }
        if (lvl(i) !== 1) continue;
        // A HALF TILE OF RAISED FLOOR: never at the corner toward the eye, and a whole tile of the same terrace lies beside it
        raisedHalves++;
        assert.notEqual(cutHalf(cut[i]), CUT_NEAR, `${label(s)}: raised floor at the corner toward the eye, ${x},${y}`);
        const beside = [i + 1, i - 1, i + f.w, i - f.w].some((j) => f.tiles[j] === T_FLOOR && cut[j] === 0 && lvl(j) === 1);
        assert.ok(beside, `${label(s)}: the raised half tile at ${x},${y} has no whole tile of its terrace beside it`);
      }
      // a flight of stairs stands on a whole tile (held above), and has whole tiles at its head and at its foot
      if (f.stair) {
        for (let i = 0; i < f.stair.length; i++) {
          const st = f.stair[i];
          if (st === 0) continue;
          const head = st === STAIR_N ? i - f.w : i - 1;
          const foot = st === STAIR_N ? i + f.w : i + 1;
          assert.equal(cut[head], 0, `${label(s)}: the head of the stairs at ${i % f.w},${Math.floor(i / f.w)} is a cut tile`);
          assert.equal(cut[foot], 0, `${label(s)}: the foot of the stairs at ${i % f.w},${Math.floor(i / f.w)} is a cut tile`);
        }
      }
    }
  } finally {
    RELIEF.sunken = was;
  }
  assert.ok(raisedHalves > 0, 'somewhere a terrace runs up to a slanting wall');
  console.log(`(${raisedHalves} half tiles of raised floor in ${samples.length / 2} dungeons)`);
});

test('cutting the corners clean costs no terraces: about as many rooms have one, and a room whose back corner is cut can have one', () => {
  const terraced = (f: Floor): Room[] =>
    f.rooms.filter((r) => {
      if (!f.height) return false;
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (f.tiles[y * f.w + x] === T_FLOOR && f.height[y * f.w + x] === 1) return true;
      return false;
    });
  let cutClean = 0;
  let stepped = 0;
  let atCutCorner = 0;
  for (const s of samples) {
    stepped += terraced(cutsSet(false, () => generateFloor(s.depth, s.seed))).length;
    const got = terraced(s.f);
    cutClean += got.length;
    // (a room whose back corner was taken off: its corner tile is no floor)
    for (const r of got) if (s.f.cut && s.f.tiles[r.y * s.f.w + r.x] !== T_FLOOR) atCutCorner++;
  }
  console.log(`(${cutClean} rooms with a terrace with the corners cut clean, ${stepped} with them in steps; ${atCutCorner} of them in a room whose back corner is cut)`);
  assert.ok(cutClean >= stepped * 0.85, `${cutClean} rooms with a terrace with the corners cut clean, ${stepped} without`);
  assert.ok(atCutCorner > 0, 'no room with its back corner cut has a terrace');
});

test('every whole tile of floor can still be walked to, and in a played dungeon nobody is put down in a wall', () => {
  cutsSet(true, () => {
    for (let k = 0; k < 10; k++) {
      const g = new Game((['warrior', 'ranger', 'mage'] as ClassId[])[k % 3], 300 + k * 41);
      g.depth = 1 + (k % 6);
      g.enterDungeon();
      const L = g.level;
      const f = L.floor;
      const n = f.w * f.h;
      const seen = new Uint8Array(n);
      const queue = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
      seen[queue[0]] = 1;
      for (let head = 0; head < queue.length; head++) {
        const i = queue[head];
        for (const j of [i + 1, i - 1, i + f.w, i - f.w]) {
          if (j < 0 || j >= n || seen[j] === 1 || f.tiles[j] !== T_FLOOR || (f.cut && f.cut[j] !== 0)) continue;
          seen[j] = 1;
          queue.push(j);
        }
      }
      for (let i = 0; i < n; i++) if (f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0)) assert.equal(seen[i], 1, `game seed ${300 + k * 41}: tile ${i % f.w},${Math.floor(i / f.w)} is cut off`);
      for (const m of g.monsters) assert.ok(inner(g).free(m.kind === 'bat' ? L.open : L.walk, m.x, m.y, Math.min(m.r, 0.42)), `game seed ${300 + k * 41}: a ${m.kind} is put down where no body may stand`);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// CORRIDORS STRAIGHT ACROSS THE SCREEN (game/dungeon.ts, Across and cutBands), with their own
// switch on beside the triangles': a room set off diagonally from the last, and the two joined
// corner to corner by a band of tiles between a flat wall that faces the eye and a low one. (ON
// in the game since Version 18.3: the owner was sent its picture on 7 Oct 2026 at 12:00 with
// "Want it in?", and said at 12:39 "Let’s try it out".)

function acrossSet<T>(on: boolean, run: () => T): T {
  const was = [RELIEF.cuts, RELIEF.across];
  RELIEF.cuts = true;
  RELIEF.across = on;
  try {
    return run();
  } finally {
    RELIEF.cuts = was[0];
    RELIEF.across = was[1];
  }
}
const acrossSamples: Sample[] = acrossSet(true, () => {
  const out: Sample[] = [];
  for (const depth of [1, 2, 3, 5, 8, 12]) for (let k = 0; k < 10; k++) out.push({ depth, seed: 8200 + depth * 83 + k * 37, f: generateFloor(depth, 8200 + depth * 83 + k * 37) });
  return out;
});
const inARoom = (f: Floor, x: number, y: number): boolean => f.rooms.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
/** The half tiles of floor on the far side of a floor's corridors across the screen: cut FAR, and in no room. */
function farSides(f: Floor): number[] {
  const out: number[] = [];
  if (f.cut) for (let i = 0; i < f.cut.length; i++) if (f.cut[i] === CUT_FAR && f.tiles[i] === T_FLOOR && !inARoom(f, i % f.w, Math.floor(i / f.w))) out.push(i);
  return out;
}

test('the switch for corridors across the screen is on in the game (the owner, 7 Oct 2026, 12:39, of its picture: "Let’s try it out"), and with it off a dungeon with triangles has none', () => {
  assert.equal(RELIEF.across, true, 'the switch is on');
  // (`samples` are made with it off: the triangle rooms by themselves)
  for (const s of samples.filter((_, i) => i % 3 === 0)) assert.equal(farSides(s.f).length, 0, `${label(s)}: a corridor across the screen with the switch off`);
  // (and the switch does nothing by itself: without the triangles there is nothing to build one of)
  const was = [RELIEF.cuts, RELIEF.across];
  RELIEF.cuts = false;
  RELIEF.across = true;
  try {
    for (const depth of [1, 4]) assert.equal(generateFloor(depth, 640 + depth).cut, undefined);
  } finally {
    RELIEF.cuts = was[0];
    RELIEF.across = was[1];
  }
});

test('with it on, most dungeons have a corridor straight across the screen: three whole rows of floor between a flat wall and a low one', () => {
  let withOne = 0;
  let tiles = 0;
  for (const s of acrossSamples) {
    const f = s.f;
    const cut = f.cut;
    const far = farSides(f);
    if (far.length === 0) continue;
    withOne++;
    tiles += far.length;
    if (!cut) continue;
    const at = (x: number, y: number): number => y * f.w + x;
    for (const i of far) {
      const x = i % f.w;
      const y = (i - x) / f.w;
      // toward the eye from it: three whole tiles of floor (one row each), then the half tile on the corridor's near side, its wall cut down low
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) {
        assert.equal(f.tiles[at(x + dx, y + dy)], T_FLOOR, `${label(s)}: no floor at ${x + dx},${y + dy}, in the corridor whose far side is at ${x},${y}`);
        assert.equal(cut[at(x + dx, y + dy)], 0, `${label(s)}: a half tile at ${x + dx},${y + dy}, in the middle of the corridor whose far side is at ${x},${y}`);
      }
      assert.equal(f.tiles[at(x + 2, y + 2)], T_FLOOR);
      assert.equal(cut[at(x + 2, y + 2)], CUT_NEAR_LOW, `${label(s)}: the near side of the corridor at ${x + 2},${y + 2}`);
      // behind it: wall, and behind that nothing a body could stand on
      for (const [dx, dy] of [[-1, 0], [0, -1]]) assert.equal(f.tiles[at(x + dx, y + dy)], T_WALL, `${label(s)}: no wall behind ${x},${y}`);
      assert.notEqual(f.tiles[at(x - 1, y - 1)], T_FLOOR, `${label(s)}: floor behind the wall at ${x - 1},${y - 1}`);
    }
  }
  console.log(`(${withOne} of ${acrossSamples.length} dungeons have a corridor straight across the screen: ${tiles} tiles along their far sides)`);
  assert.ok(withOne >= acrossSamples.length * 0.6, `${withOne} of ${acrossSamples.length} dungeons have one`);
});

test('a dungeon with corridors across the screen is still a tree, and all of it can be walked to', () => {
  for (const s of acrossSamples) {
    const f = s.f;
    const n = f.w * f.h;
    // every whole tile of floor is walked to from where the hero arrives, by whole tiles alone
    const whole = (i: number): boolean => f.tiles[i] === T_FLOOR && !(f.cut && f.cut[i] !== 0);
    const seen = new Uint8Array(n);
    const queue = [Math.floor(f.start.y) * f.w + Math.floor(f.start.x)];
    seen[queue[0]] = 1;
    for (let head = 0; head < queue.length; head++) {
      const i = queue[head];
      for (const j of [i + 1, i - 1, i + f.w, i - f.w]) {
        if (j < 0 || j >= n || seen[j] === 1 || !whole(j)) continue;
        seen[j] = 1;
        queue.push(j);
      }
    }
    for (let i = 0; i < n; i++) if (whole(i)) assert.equal(seen[i], 1, `${label(s)}: tile ${i % f.w},${Math.floor(i / f.w)} is cut off`);
    // no loop: what is not floor is all of one piece (it joins up diagonally too: nobody slips between two walls that touch at a corner)
    const mark = new Uint8Array(n);
    let regions = 0;
    for (let start = 0; start < n; start++) {
      if (mark[start] === 1 || f.tiles[start] === T_FLOOR) continue;
      regions++;
      const stack = [start];
      mark[start] = 1;
      while (stack.length > 0) {
        const i = stack.pop() as number;
        const x = i % f.w;
        const y = (i - x) / f.w;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) continue;
            const j = ny * f.w + nx;
            if (mark[j] === 0 && f.tiles[j] !== T_FLOOR) {
              mark[j] = 1;
              stack.push(j);
            }
          }
        }
      }
    }
    assert.equal(regions, 1, `${label(s)}: ${regions - 1} loop(s) a player can walk round`);
    // nothing stands or lies on a half tile, and no pack is put down on one
    if (f.cut) {
      for (const p of f.props) assert.equal(f.cut[p.y * f.w + p.x], 0, `${label(s)}: a ${p.kind} on a cut tile`);
      for (const p of f.packs) assert.equal(f.cut[Math.floor(p.y) * f.w + Math.floor(p.x)], 0, `${label(s)}: a pack on a cut tile`);
    }
  }
});

test('in played dungeons with corridors across the screen nobody is put down in a wall, and the playtests\' own player is never in one', () => {
  acrossSet(true, () => {
    let crossed = 0;
    for (let k = 0; k < 4; k++) {
      const g = new Game((['warrior', 'ranger', 'mage'] as ClassId[])[k % 3], 520 + k * 67);
      const bot = newBot(true);
      const c = emptyControls();
      for (const m of g.monsters) assert.ok(inner(g).free(m.kind === 'bat' ? g.level.open : g.level.walk, m.x, m.y, Math.min(m.r, 0.42)), `game seed ${520 + k * 67}: a ${m.kind} is put down where no body may stand`);
      for (let t = 0; t < 240; t += 1 / 30) {
        g.hero.life = g.hero.d.maxLife;
        botStep(g, c, bot, 1 / 30);
        g.update(1 / 30, c);
        g.events.length = 0;
        const f = g.level.floor;
        if (!f.cut) continue;
        assert.ok(g.hero.move || !inWall(f, g.hero.x, g.hero.y), `game seed ${520 + k * 67}: the hero is in a wall at ${g.hero.x.toFixed(2)},${g.hero.y.toFixed(2)}`);
        for (const m of g.monsters) if (!m.dead) assert.ok(!inWall(f, m.x, m.y), `game seed ${520 + k * 67}: a ${m.kind} is in a wall at ${m.x.toFixed(2)},${m.y.toFixed(2)}`);
        // (in a corridor across the screen: on corridor floor between two of its half tiles)
        const hx = Math.floor(g.hero.x);
        const hy = Math.floor(g.hero.y);
        if (!inARoom(f, hx, hy) && (f.cut[(hy - 1) * f.w + hx - 1] === CUT_FAR || f.cut[(hy + 1) * f.w + hx + 1] === CUT_NEAR_LOW)) crossed++;
      }
    }
    console.log(`(the playtests' own player was in a corridor across the screen for ${crossed} steps of four games)`);
    assert.ok(crossed > 0, 'in four games of four minutes the player never walked along a corridor across the screen');
  });
});
