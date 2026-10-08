// LEDGES, STAIRS, GAPS AND PITS: the rules of height.
//
// The owner, 5 Oct 2026: "I think steps are a must include"; "And the swipe moves need to be able
// to traverse the different levels as well. I need to be able to jump up and down ledges".
// 7 Oct 2026: "Then work on ledges and stairs"; "Gaps and pits to use the swipe ability over".
//
// What is held here (game/height.ts says it in full):
//   - walking never crosses a ledge, up or down; a flight of stairs is the way, entered at its ends;
//   - nobody walks into a pit; what flies, and what is shot, crosses one;
//   - monsters find their way round by the stairs, and come to the edge when there is no way;
//   - Leap, the roll and Warp cross a ledge both ways and carry the hero over a gap; a swipe that
//     would come down in a pit ends at its edge;
//   - a level with none of this is exactly as it was (its grid of steps is null).
//   run: tsx --test tests/height.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { SKILLS, TUNE } from '../src/game/defs';
import { RELIEF } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { LANE_HELP, STAIR_HELP, STAIR_N, STAIR_W, STEP_E, STEP_N, STEP_S, STEP_W, canStep, hasRelief, levelAt, mayOverlap, stepGrid } from '../src/game/height';
import { LEDGE_HALL, makeArena, makeDungeon, makeLedgeHall, makeTown } from '../src/game/level';
import { UNREACHABLE, flowField } from '../src/game/nav';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster } from '../src/game/state';
import { T_FLOOR, T_PIT } from '../src/game/types';
import type { ClassId } from '../src/game/types';

const DT = 1 / 60;
const R = TUNE.heroRadius;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The hall with a terrace, stairs, a pit and a gap; no packs come; the hero where asked. */
function hall(cls: ClassId, x: number, y: number): Game {
  const g = Game.forPractice(cls, 5, 'ledges');
  inner(g).waveT = 1e9;
  g.hero.x = x;
  g.hero.y = y;
  return g;
}

function step(g: Game, c: Controls, seconds: number): void {
  for (let t = 0; t < seconds; t += DT) g.update(DT, c);
}

function walk(g: Game, mx: number, my: number, seconds: number): void {
  const c = emptyControls();
  c.mx = mx;
  c.my = my;
  step(g, c, seconds);
}

/** Ask for the swipe move toward a place, and let it finish. */
function swipe(g: Game, tx: number, ty: number): void {
  const c = emptyControls();
  c.evade = true;
  c.evadeX = tx;
  c.evadeY = ty;
  g.update(DT, c);
  step(g, emptyControls(), 0.8);
}

const H = LEDGE_HALL;
const T = H.terrace;

test('the hall has what it says: a terrace one level up, two flights of stairs, a pit, a gap round an island', () => {
  const f = makeLedgeHall(1).floor;
  assert.ok(hasRelief(f));
  assert.equal(levelAt(f, T.x0 + 0.5, T.y0 + 0.5), 1);
  assert.equal(levelAt(f, T.x1 + 0.5, T.y1 + 0.5), 1);
  assert.equal(levelAt(f, T.x1 + 1.5, T.y1 + 1.5), 0);
  for (const s of H.stairsN) assert.equal(f.stair![s.y * f.w + s.x], STAIR_N);
  for (const s of H.stairsW) assert.equal(f.stair![s.y * f.w + s.x], STAIR_W);
  assert.equal(f.tiles[H.pit.y0 * f.w + H.pit.x0], T_PIT);
  assert.equal(f.tiles[(H.island.y0 - 1) * f.w + H.island.x0], T_PIT);
  assert.equal(f.tiles[H.island.y0 * f.w + H.island.x1 + 1], T_PIT);
  assert.equal(f.tiles[H.island.y0 * f.w + H.island.x0], T_FLOOR);
});

test('a level with no ledge, stair or pit has no grid of steps: the town, the practice room, a dungeon laid flat', () => {
  assert.equal(makeTown(1).step, null);
  assert.equal(makeArena(1).step, null);
  // (a dungeon has terraces now, tests/relief.test.ts; with the map-maker's switch off it is the flat dungeon it was)
  RELIEF.on = false;
  try {
    for (const depth of [1, 2, 5]) assert.equal(makeDungeon(depth, 77 + depth).step, null, `dungeon ${depth}`);
  } finally {
    RELIEF.on = true;
  }
  assert.ok(makeLedgeHall(1).step !== null);
});

test('the ground rises evenly up a flight of stairs, from the floor at its foot to the floor at its head', () => {
  const f = makeLedgeHall(1).floor;
  const n = H.stairsN[0];
  assert.ok(Math.abs(levelAt(f, n.x + 0.5, n.y + 0.99) - 0.01) < 1e-6, 'at its foot');
  assert.ok(Math.abs(levelAt(f, n.x + 0.5, n.y + 0.5) - 0.5) < 1e-6, 'half way');
  assert.ok(Math.abs(levelAt(f, n.x + 0.5, n.y + 0.01) - 0.99) < 1e-6, 'at its head');
  const w = H.stairsW[0];
  assert.ok(Math.abs(levelAt(f, w.x + 0.75, w.y + 0.5) - 0.25) < 1e-6);
  assert.ok(Math.abs(levelAt(f, w.x + 0.25, w.y + 0.5) - 0.75) < 1e-6);
  // (a pit and a wall have no ground)
  assert.equal(levelAt(f, H.pit.x0 + 0.5, H.pit.y0 + 0.5), 0);
});

test('a step is allowed between floor of one height, and up or down a stair by its two ends only', () => {
  const f = makeLedgeHall(1).floor;
  // on the terrace, and on the floor
  assert.ok(canStep(f, T.x0, T.y0, T.x0 + 1, T.y0));
  assert.ok(canStep(f, 16, 14, 16, 15));
  // over the ledge, either way: no
  assert.ok(!canStep(f, 12, T.y1, 12, T.y1 + 1));
  assert.ok(!canStep(f, 12, T.y1 + 1, 12, T.y1));
  assert.ok(!canStep(f, T.x1, 6, T.x1 + 1, 6));
  // the flight that goes up toward -y: from the floor at its foot, and onto the terrace at its head
  const n = H.stairsN[0];
  assert.ok(canStep(f, n.x, n.y + 1, n.x, n.y), 'foot to stair');
  assert.ok(canStep(f, n.x, n.y, n.x, n.y - 1), 'stair to head');
  assert.ok(canStep(f, n.x, n.y, n.x + 1, n.y), 'the two tiles of one flight, side by side');
  assert.ok(!canStep(f, n.x - 1, n.y, n.x, n.y), 'not from the side');
  assert.ok(!canStep(f, H.stairsN[1].x + 1, n.y, H.stairsN[1].x, n.y), 'not from the other side');
  // the flight that goes up toward -x
  const w = H.stairsW[0];
  assert.ok(canStep(f, w.x + 1, w.y, w.x, w.y));
  assert.ok(canStep(f, w.x, w.y, w.x - 1, w.y));
  assert.ok(!canStep(f, w.x, w.y - 1, w.x, w.y));
  // a pit: no
  assert.ok(!canStep(f, H.pit.x0 - 1, H.pit.y0, H.pit.x0, H.pit.y0));
  // and the rule is the same both ways, for every pair of neighbours in the hall
  for (let y = 1; y < f.h - 1; y++) {
    for (let x = 1; x < f.w - 1; x++) {
      assert.equal(canStep(f, x, y, x + 1, y), canStep(f, x + 1, y, x, y));
      assert.equal(canStep(f, x, y, x, y + 1), canStep(f, x, y + 1, x, y));
    }
  }
});

test('the grid of steps says the same, and the corner of a ledge and of a flight of stairs are solid', () => {
  const f = makeLedgeHall(1).floor;
  const g = stepGrid(f)!;
  const at = (x: number, y: number): number => g[y * f.w + x];
  assert.equal(at(16, 14), STEP_E | STEP_W | STEP_S | STEP_N);
  // the terrace's long edge: no step down the screen
  assert.equal(at(12, T.y1) & STEP_S, 0);
  assert.equal(at(12, T.y1 + 1) & STEP_N, 0);
  // a body on the floor at the corner of the terrace may not lie over the corner
  assert.ok(!mayOverlap(g, f.w, T.x1 + 1, T.y1 + 1, T.x1, T.y1));
  // a body at the foot of a flight may not lie over the stair beside the one it faces unless that is the same flight
  const n = H.stairsN[0];
  assert.ok(mayOverlap(g, f.w, n.x, n.y + 1, n.x + 1, n.y), 'the next tile of the same flight, on the diagonal');
  assert.ok(!mayOverlap(g, f.w, n.x - 1, n.y + 1, n.x, n.y), 'the corner of the flight, from beside its foot');
});

test('walking never crosses a ledge: not up it from below, not down it from above', () => {
  // from the floor, straight at the terrace's long edge
  let g = hall('warrior', 12.5, T.y1 + 2.5);
  walk(g, 0, -1, 2);
  assert.ok(g.hero.y >= T.y1 + 1 + R - 1e-6, `stopped at the foot of the ledge (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 0);
  // from the terrace, straight at its edge
  g = hall('warrior', 12.5, T.y1 - 1.5);
  walk(g, 0, 1, 2);
  assert.ok(g.hero.y <= T.y1 + 1 - R + 1e-6, `stopped at the edge (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 1);
  // and at the short edge
  g = hall('warrior', T.x1 - 0.5, 6.5);
  walk(g, 1, 0, 2);
  assert.ok(g.hero.x <= T.x1 + 1 - R + 1e-6);
});

test('a flight of stairs is the way up and the way down, and is not entered from its side', () => {
  const n = H.stairsN[0];
  // up
  let g = hall('warrior', n.x + 0.5, n.y + 2.5);
  walk(g, 0, -1, 2.5);
  assert.ok(g.hero.y < n.y - 0.5, `walked up onto the terrace (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 1);
  // and down again
  walk(g, 0, 1, 2.5);
  assert.ok(g.hero.y > n.y + 1.5, `walked down to the floor (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 0);
  // from the side, on the floor beside the flight: no
  g = hall('warrior', n.x - 1.5, n.y + 0.5);
  walk(g, 1, 0, 2);
  assert.ok(g.hero.x <= n.x - R + 1e-6, `stopped at the side of the flight (x ${g.hero.x.toFixed(2)})`);
  // the other flight, up toward -x
  const w = H.stairsW[0];
  g = hall('warrior', w.x + 2.5, w.y + 0.5);
  walk(g, -1, 0, 2.5);
  assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 1);
});

test('a hero walking at a flight of stairs a little out of line with it is moved into line and climbs it', () => {
  const a = H.stairsN[0];
  const b = H.stairsN[1];
  const f = makeLedgeHall(1).floor;
  assert.equal(b.x, a.x + 1, 'the flight is two tiles wide');
  // (in line: a hero's whole width is on the flight. Out of line by less than STAIR_HELP: helped.)
  for (const x of [b.x + 1 - R + STAIR_HELP - 0.03, b.x + 1 - 0.02, b.x + 1 + 0.1, a.x + R - STAIR_HELP + 0.03, a.x + 0.02, a.x - 0.1]) {
    const g = hall('warrior', x, a.y + 2.5);
    walk(g, 0, -1, 3);
    assert.equal(levelAt(f, g.hero.x, g.hero.y), 1, `from x ${x.toFixed(2)}: on the terrace (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
    assert.ok(g.hero.x >= a.x + R - 1e-6 && g.hero.x <= b.x + 1 - R + 1e-6, 'and came up by the stairs');
  }
  // and down them, from the terrace: a little out of line with their head
  for (const x of [b.x + 1 - R + STAIR_HELP - 0.03, a.x + R - STAIR_HELP + 0.03]) {
    const g = hall('warrior', x, a.y - 1.5);
    walk(g, 0, 1, 3);
    assert.equal(levelAt(f, g.hero.x, g.hero.y), 0, `from x ${x.toFixed(2)}: down on the floor (at ${g.hero.x.toFixed(2)}, ${g.hero.y.toFixed(2)})`);
    assert.ok(g.hero.y > a.y + 1, 'past the foot of the flight');
  }
});

test('a hero further out of line than that is not drawn onto the flight: they pass beside it, to the ledge', () => {
  const b = H.stairsN[1];
  const f = makeLedgeHall(1).floor;
  assert.ok(STAIR_HELP > LANE_HELP && LANE_HELP > R, 'the help reaches past half a hero, and further for stairs');
  // (a hair past where the stairs would have drawn them in)
  const x = b.x + 1 - R + STAIR_HELP + 0.03;
  const g = hall('warrior', x, b.y + 2.5);
  walk(g, 0, -1, 3);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), 0, 'still on the low floor');
  assert.ok(g.hero.x >= b.x + 1 + R - 1e-6, `moved clear of the flight's side (x ${g.hero.x.toFixed(2)})`);
  assert.ok(g.hero.y < b.y + 1 && g.hero.y >= b.y + R - 1e-6, `and walked on beside it to the foot of the ledge (y ${g.hero.y.toFixed(2)})`);
  // and one who is square in front of the ledge is not moved at all
  const g2 = hall('warrior', b.x + 2.5, b.y + 2.5);
  walk(g2, 0, -1, 3);
  assert.ok(Math.abs(g2.hero.x - (b.x + 2.5)) < 1e-9, 'walked straight');
});

test('a hero who clips the corner of a ledge goes round it; one who walks square at a ledge stays where they are', () => {
  const f = makeLedgeHall(1).floor;
  // the terrace's near corner (its last column, its last row), from below, with a sliver of the hero under the terrace
  const x = T.x1 + 1 + R - 0.1;
  const g = hall('warrior', x, T.y1 + 3.5);
  assert.equal(levelAt(f, T.x1 + 1.5, T.y1 + 0.5), 0, 'there is low floor beside the corner');
  walk(g, 0, -1, 2);
  assert.ok(g.hero.y < T.y1 + 1, `went on past the corner (y ${g.hero.y.toFixed(2)})`);
  assert.ok(g.hero.x >= T.x1 + 1 + R - 1e-6, `clear of it (x ${g.hero.x.toFixed(2)})`);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), 0);
  // square at the ledge: stopped, and not moved sideways
  const g2 = hall('warrior', 12.5, T.y1 + 2.5);
  walk(g2, 0, -1, 2);
  assert.ok(Math.abs(g2.hero.x - 12.5) < 1e-9);
  assert.ok(g2.hero.y >= T.y1 + 1 + R - 1e-6);
});

test('a body set down astride a ledge is not held there: it walks off it, and then the ledge is a ledge again', () => {
  const f = makeLedgeHall(1).floor;
  // (half on the terrace's last row, half on the floor under it: nothing in the game puts a hero here)
  const g = hall('warrior', 12.5, T.y1 + 1 + 0.1);
  assert.equal(levelAt(f, 12.5, T.y1 + 1 + 0.1 - R), 1);
  assert.equal(levelAt(f, 12.5, T.y1 + 1 + 0.1 + R), 0);
  walk(g, 0, 1, 0.6);
  assert.ok(g.hero.y > T.y1 + 1 + R, `walked off, down (y ${g.hero.y.toFixed(2)})`);
  walk(g, 0, -1, 1.5);
  assert.ok(g.hero.y >= T.y1 + 1 + R - 1e-6, `and cannot walk back up (y ${g.hero.y.toFixed(2)})`);
  assert.equal(levelAt(f, g.hero.x, g.hero.y), 0);
  // the other way: off it, up
  const g2 = hall('warrior', 12.5, T.y1 + 1 + 0.1);
  walk(g2, 0, -1, 0.6);
  assert.equal(levelAt(f, g2.hero.x, g2.hero.y - R), 1);
  assert.equal(levelAt(f, g2.hero.x, g2.hero.y + R), 1, `walked off, up (y ${g2.hero.y.toFixed(2)})`);
  walk(g2, 0, 1, 1.5);
  assert.ok(g2.hero.y <= T.y1 + 1 - R + 1e-6, `and cannot walk back down (y ${g2.hero.y.toFixed(2)})`);
});

test('nobody walks into a pit', () => {
  const g = hall('warrior', H.pit.x0 - 2.5, H.pit.y0 + 1.5);
  walk(g, 1, 0, 2.5);
  assert.ok(g.hero.x <= H.pit.x0 - R + 1e-6, `stopped at the brink (x ${g.hero.x.toFixed(2)})`);
});

test('each hero\'s swipe goes up a ledge and down it', () => {
  for (const cls of ['warrior', 'ranger', 'mage'] as ClassId[]) {
    // up: from the floor two tiles from the ledge, at a place on the terrace
    let g = hall(cls, 12.5, T.y1 + 2.3);
    swipe(g, 12.5, T.y1 - 1.5);
    assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 1, `${cls} is on the terrace (y ${g.hero.y.toFixed(2)})`);
    assert.equal(g.hero.move, null);
    // down
    g = hall(cls, 12.5, T.y1 - 0.2);
    swipe(g, 12.5, T.y1 + 3.5);
    assert.equal(levelAt(g.level.floor, g.hero.x, g.hero.y), 0, `${cls} is down on the floor (y ${g.hero.y.toFixed(2)})`);
    assert.ok(g.hero.y > T.y1 + 1, `${cls} y ${g.hero.y.toFixed(2)}`);
  }
});

test('each hero\'s swipe carries them over the gap to the island, and back', () => {
  const edge = H.island.x1 + 3; // the first floor on the near side of the gap
  for (const cls of ['warrior', 'ranger', 'mage'] as ClassId[]) {
    const g = hall(cls, edge + 0.5, H.island.y0 + 1.5);
    swipe(g, H.island.x1 - 2, H.island.y0 + 1.5);
    assert.ok(g.hero.x < H.island.x1 + 1 - R + 1e-6, `${cls} landed on the island (x ${g.hero.x.toFixed(2)})`);
    assert.equal(g.level.floor.tiles[Math.floor(g.hero.y) * g.level.floor.w + Math.floor(g.hero.x)], T_FLOOR);
    // (wait out the swipe's own wait, and come back)
    step(g, emptyControls(), 6);
    swipe(g, edge + 3, H.island.y0 + 1.5);
    assert.ok(g.hero.x >= edge + R - 1e-6, `${cls} came back (x ${g.hero.x.toFixed(2)})`);
  }
});

test('a swipe that would come down in a pit ends at its edge; one that reaches the far side crosses', () => {
  // the ranger's roll is 3.4 tiles: the pit is three wide, and from two tiles back it cannot be crossed
  let g = hall('ranger', H.pit.x0 - 2.0, H.pit.y0 + 1.5);
  assert.ok(SKILLS[g.hero.skills[2].id].range < 2 + 3 + R);
  swipe(g, H.pit.x1 + 4, H.pit.y0 + 1.5);
  assert.ok(g.hero.x <= H.pit.x0 - R + 1e-6, `the roll ended at the brink (x ${g.hero.x.toFixed(2)})`);
  assert.equal(g.level.floor.tiles[Math.floor(g.hero.y) * g.level.floor.w + Math.floor(g.hero.x)], T_FLOOR);
  // the warrior's leap is six: from the brink it clears the pit
  g = hall('warrior', H.pit.x0 - 0.5, H.pit.y0 + 1.5);
  swipe(g, H.pit.x1 + 3, H.pit.y0 + 1.5);
  assert.ok(g.hero.x >= H.pit.x1 + 1 + R - 1e-6, `the leap cleared it (x ${g.hero.x.toFixed(2)})`);
  // pointed INTO the pit, the leap goes no further than the brink
  g = hall('warrior', H.pit.x0 - 2.5, H.pit.y0 + 1.5);
  swipe(g, H.pit.x0 + 1.5, H.pit.y0 + 1.5);
  assert.ok(g.hero.x <= H.pit.x0 - R + 1e-6, `x ${g.hero.x.toFixed(2)}`);
});

test('the way a monster is shown to the hero goes round by the stairs, and there is none to the island', () => {
  const L = makeLedgeHall(1);
  const f = L.floor;
  // the hero on the terrace, at its long edge
  const hx = 12;
  const hy = T.y1;
  const withSteps = flowField(L.walk, f.w, f.h, hx, hy, 60, undefined, L.step);
  const without = flowField(L.walk, f.w, f.h, hx, hy, 60);
  const below = (T.y1 + 1) * f.w + hx; // the floor tile right under the edge
  assert.equal(without[below], 10, 'with no rule of height it would be one step');
  assert.ok(withSteps[below] > 30 && withSteps[below] !== UNREACHABLE, `round by the stairs: ${withSteps[below]}`);
  // the island: no way on foot
  const island = flowField(L.walk, f.w, f.h, H.island.x0 + 1, H.island.y0 + 1, 80, undefined, L.step);
  assert.equal(island[15 * f.w + 15], UNREACHABLE);
  assert.notEqual(island[(H.island.y0 + 2) * f.w + H.island.x0 + 3], UNREACHABLE);
});

test('a skeleton under the ledge goes round by the stairs to a hero on the terrace', () => {
  const g = hall('warrior', 12.5, T.y1 - 1.5);
  const m = inner(g).spawn('skeleton', 13.5, T.y1 + 2.5, 900, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  g.hero.invuln = 1e9;
  let onTerrace = false;
  let crossed = false;
  let wasLevel = levelAt(g.level.floor, m.x, m.y);
  const c = emptyControls();
  for (let t = 0; t < 12 && !onTerrace; t += DT) {
    const wasTile = g.level.floor.stair![Math.floor(m.y) * g.level.floor.w + Math.floor(m.x)];
    g.update(DT, c);
    const lv = levelAt(g.level.floor, m.x, m.y);
    // (its height never jumps: it changes only on a flight of stairs)
    const nowTile = g.level.floor.stair![Math.floor(m.y) * g.level.floor.w + Math.floor(m.x)];
    if (Math.abs(lv - wasLevel) > 0.3 && wasTile === 0 && nowTile === 0) crossed = true;
    wasLevel = lv;
    if (lv === 1 && nowTile === 0) onTerrace = true;
  }
  assert.ok(!crossed, 'it never went over the ledge');
  assert.ok(onTerrace, `it came up onto the terrace (it is at ${m.x.toFixed(1)}, ${m.y.toFixed(1)})`);
});

test('a skeleton cannot reach a hero on the island: it comes to the edge of the gap and no further', () => {
  const g = hall('warrior', H.island.x1 - 0.5, H.island.y0 + 1.5);
  const m = inner(g).spawn('skeleton', H.island.x1 + 6.5, H.island.y0 + 1.5, 900, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  g.hero.invuln = 1e9;
  step(g, emptyControls(), 6);
  const f = g.level.floor;
  assert.equal(f.tiles[Math.floor(m.y) * f.w + Math.floor(m.x)], T_FLOOR);
  assert.ok(m.x >= H.island.x1 + 3, `it is still on the near side (x ${m.x.toFixed(2)})`);
  assert.ok(m.x < H.island.x1 + 4.2, `and has come to the edge (x ${m.x.toFixed(2)})`);
});

test('a bat flies over the pit and up the ledge', () => {
  // over the pit
  let g = hall('warrior', H.pit.x0 - 1.5, H.pit.y0 + 1.5);
  let m = inner(g).spawn('bat', H.pit.x1 + 2.5, H.pit.y0 + 1.5, 900, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  g.hero.invuln = 1e9;
  let overPit = false;
  for (let t = 0; t < 4; t += DT) {
    g.update(DT, emptyControls());
    if (g.level.floor.tiles[Math.floor(m.y) * g.level.floor.w + Math.floor(m.x)] === T_PIT) overPit = true;
  }
  assert.ok(overPit, 'it came straight over the pit');
  assert.ok(Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 2, 'and reached the hero');
  // up the ledge
  g = hall('warrior', 12.5, T.y1 - 1.5);
  m = inner(g).spawn('bat', 12.5, T.y1 + 3.5, 900, 0, false, inner(g).rng);
  inner(g).wakeUp(m);
  g.hero.invuln = 1e9;
  step(g, emptyControls(), 3);
  assert.ok(Math.hypot(m.x - g.hero.x, m.y - g.hero.y) < 2, `it reached the hero on the terrace (${m.x.toFixed(1)}, ${m.y.toFixed(1)})`);
});

test('an arrow crosses the pit and the ledge', () => {
  // across the pit, at an archer on the far side (it stands and shoots back: a skeleton would walk off round the pit)
  let g = hall('ranger', H.pit.x0 - 1.5, H.pit.y0 + 1.5);
  let m = inner(g).spawn('archer', H.pit.x1 + 2.5, H.pit.y0 + 1.5, 900, 0, false, inner(g).rng);
  const life = m.life;
  const c = emptyControls();
  c.fire = true;
  g.hero.invuln = 1e9;
  let overPit = false;
  for (let t = 0; t < 1.5; t += DT) {
    c.aimX = m.x;
    c.aimY = m.y;
    g.update(DT, c);
    for (const p of g.projectiles) if (g.level.floor.tiles[Math.floor(p.y) * g.level.floor.w + Math.floor(p.x)] === T_PIT) overPit = true;
  }
  assert.ok(overPit, 'an arrow was in the air over the pit');
  assert.ok(m.life < life || m.dead, 'the archer across the pit was hit');
  // from the floor at an archer up on the terrace
  g = hall('ranger', 12.5, T.y1 + 3.5);
  m = inner(g).spawn('archer', 12.5, T.y1 - 1.5, 900, 0, false, inner(g).rng);
  const life2 = m.life;
  const c2 = emptyControls();
  c2.fire = true;
  c2.aimX = m.x;
  c2.aimY = m.y;
  g.hero.invuln = 1e9;
  step(g, c2, 1.5);
  assert.ok(m.life < life2 || m.dead, 'the archer on the terrace was hit');
});
