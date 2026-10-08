// Builds the two kinds of level: the town hub and a generated dungeon.

import { RNG } from '../engine/rng';
import { TUNE } from './defs';
import { DOORS, doorTiles, doorWay, layDoors, makeDoors, pierGrid, shutGrid } from './doors';
import { makeHazards } from './traps';
import { generateFloor } from './dungeon';
import { STAIR_N, STAIR_W, stepGrid } from './height';
import { buildOpenGrid, buildWalkGrid } from './nav';
import type { Level, PropInst } from './state';
import { CUT_FAR, CUT_FAR_LOW, CUT_LEFT, CUT_NEAR, CUT_NEAR_LOW, CUT_RIGHT, SOLID_PROPS, T_FLOOR, T_PIT, T_VOID, T_WALL } from './types';
import type { Floor, HazardSpot, PackSpot, PropSpot, Room } from './types';

/**
 * A wall tile is drawn cut down low when floor lies behind it (up-screen), so walls never hide
 * the room they enclose. Walls with nothing behind them stay tall and form the backdrop.
 */
function lowWalls(f: Floor): Uint8Array {
  const low = new Uint8Array(f.w * f.h);
  // (a pit is part of the room it is in: a wall with one behind it is cut down like any other)
  const isFloor = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && (f.tiles[y * f.w + x] === T_FLOOR || f.tiles[y * f.w + x] === T_PIT);
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      if (f.tiles[y * f.w + x] !== T_WALL) continue;
      if (isFloor(x - 1, y) || isFloor(x, y - 1) || isFloor(x - 1, y - 1)) low[y * f.w + x] = 1;
    }
  }
  return low;
}

function propFromSpot(f: Floor, s: PropSpot): PropInst {
  return { kind: s.kind, tx: s.x, ty: s.y, x: s.x + 0.5, y: s.y + 0.5, solid: SOLID_PROPS.includes(s.kind), state: 0, variant: f.variant[s.y * f.w + s.x] };
}

function portalAt(x: number, y: number, active: boolean): PropInst {
  return { kind: 'portal', tx: Math.floor(x), ty: Math.floor(y), x, y, solid: false, state: active ? 1 : 0, variant: 0 };
}

function finish(f: Floor, town: boolean, portal: PropInst | null): Level {
  const n = f.w * f.h;
  const level: Level = {
    town,
    floor: f,
    walk: buildWalkGrid(f),
    open: buildOpenGrid(f),
    step: stepGrid(f),
    low: lowWalls(f),
    explored: new Uint8Array(n),
    visible: new Uint8Array(n),
    props: f.props.map((s) => propFromSpot(f, s)),
    portal,
    body: null,
    stations: [],
    doors: makeDoors(f),
    pier: pierGrid(f),
    shut: shutGrid(f),
    hazards: makeHazards(f),
  };
  // (DOORS: a shut door stops sight and shots as it holds monsters: its tile is shut in the grid they go by
  // until the door begins to open. It stays open to walking: the hero is never held by one. game.ts, `updateDoors`)
  if (level.shut) for (let i = 0; i < n; i++) if (level.shut[i] === 1) level.open[i] = 0;
  // (THE MIX: A LEVER'S GATE BEGINS DOWN. Its doorway is wall to whatever walks, flies, is shot or
  // looks, as the boss's is once it has fallen, until the lever is pulled: game.ts, `pullLever`.)
  for (const d of level.doors) {
    if (d.spot.kind !== 'gate') continue;
    for (const i of doorTiles(f, d.spot)) {
      level.walk[i] = 0;
      level.open[i] = 0;
    }
  }
  // (THE TRAPS: A SEALED DOOR is wall to whatever walks, flies, is shot or looks, the hero too, until
  // a hit from an attack carrying its word opens it: game.ts, `unseal`)
  for (const d of level.doors) {
    if (d.spot.kind !== 'worddoor') continue;
    for (const i of doorWay(f, d.spot)) {
      level.walk[i] = 0;
      level.open[i] = 0;
    }
  }
  if (portal) level.props.push(portal);
  if (town) {
    level.explored.fill(1);
    level.visible.fill(1);
  }
  return level;
}

/**
 * The town: one hall, and in it a place for each of its people (Version 14.4).
 *
 * The owner, 5 Oct 2026: "give the vendors little areas. Like a shop stall or a bazaar tent area
 * with goods laid out on a table. Maybe the martial vendor has an anvil and forge, the magic guy
 * has some jewelry and potions laid out, and the wordsmith I'm not sure about but I want him to
 * be very runic. The shady guy being the exception, he's just leaned up against a wall in the
 * shadows." And: "have the gate be embedded in the back wall like a big glowing gate".
 *
 * On the screen x runs down to the right and y down to the left, so the hall is a diamond: its
 * two back walls meet at the top, the wall at y0 - 1 runs down to the right from there and the
 * wall at x0 - 1 down to the left. A new arrival stands near the bottom, facing all of it.
 *   the gate       four tiles of the right-hand back wall, used from the floor before it
 *   the smithy     against the same wall, toward the right-hand corner: the forge, a rack of
 *                  arms, the trough; the armourer, and before him the anvil
 *   the bazaar     on the right: the tent's back, the mystic, the table of wares, on a rug
 *   the ring       on the left: the wordsmith and his slab among six standing stones, on a
 *                  circle cut in the floor (the stones stand on the eight tiles that are just
 *                  the root of five from the middle one, less the two in front: the way in)
 *   the Lexicon    in the middle;  the stash  near the bottom
 *   the stranger   by the left-hand back wall, just under the top corner, which has no fire
 */
export const TOWN = {
  w: 28,
  h: 26,
  // floor rectangle
  x0: 6,
  y0: 6,
  x1: 21,
  y1: 19,
  // (where a new arrival stands: far enough up the hall that a phone held sideways shows the
  // gate whole, the smithy clear of the map, the tent, the Lexicon and the wordsmith's ring)
  start: { x: 15.5, y: 14.5 },
  /** The gate: the first of its tiles of wall and how many there are, and the floor before it, where it is used from. */
  gateWall: { x: 12, y: 5, n: 4 },
  // (on the screen that is straight under the middle of the arch)
  gate: { x: 14.7, y: 6.7 },
  lexicon: { x: 13, y: 12 },
  stash: { x: 12, y: 18 },
  // the smithy
  armourer: { x: 19, y: 7 },
  anvil: { x: 19, y: 8 },
  forge: { x: 20, y: 6 },
  rack: { x: 17, y: 6 },
  trough: { x: 21, y: 6 },
  // the bazaar. It stands on the grid and opens down the screen to the left (Version 14.5: until
  // then its back, the trader and the table went straight down the screen, each a tile nearer
  // than the last, which is no line of this floor's): the cloth of its back, the trader and the
  // table of wares are one behind the other along the grid, and the tent is three tiles by three
  tentBack: { x: 19, y: 11 },
  mystic: { x: 19, y: 12 },
  tentTable: { x: 19, y: 13 },
  // the wordsmith's ring
  wordsmith: { x: 9, y: 14 },
  runeSlab: { x: 9, y: 15 },
  runeStones: [[-2, -1], [-1, -2], [1, -2], [-2, 1], [2, -1], [-1, 2]] as ReadonlyArray<readonly [number, number]>,
  stranger: { x: 6, y: 7 },
};

/** A piece of town furniture (or a townsperson) standing on one tile and blocking it. */
function townProp(level: Level, kind: PropInst['kind'], tx: number, ty: number, variant = 0): PropInst {
  const p: PropInst = { kind, tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant };
  level.props.push(p);
  level.walk[ty * level.floor.w + tx] = 0;
  return p;
}

/** Something that lies flat on the town's floor and is walked over (a rug, the circle of runes). */
function townFlat(level: Level, kind: PropInst['kind'], tx: number, ty: number): PropInst {
  const p: PropInst = { kind, tx, ty, x: tx + 0.5, y: ty + 0.5, solid: false, state: 0, variant: 0 };
  level.props.push(p);
  return p;
}

/** A tile that is taken up by something wider than its own tile (the ends of the tent's table): nothing stands there, and nobody walks there. */
function townBlock(level: Level, tx: number, ty: number): void {
  level.walk[ty * level.floor.w + tx] = 0;
}

/** The safe hub between dungeons. */
export function makeTown(seed: number): Level {
  const rng = new RNG(seed ^ 0x51ed);
  const { w, h, x0, y0, x1, y1 } = TOWN;
  const tiles = new Uint8Array(w * h).fill(T_VOID);
  const variant = new Uint8Array(w * h);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y * w + x] = T_FLOOR;
  for (let y = y0 - 1; y <= y1 + 1; y++) {
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      if (tiles[y * w + x] === T_VOID) tiles[y * w + x] = T_WALL;
    }
  }
  const g = TOWN.gateWall;
  const props: PropSpot[] = [
    // a fire either side of the gate, and one in each of the two near corners; none in the top
    // corner (the stranger keeps to the dark) nor in the right-hand one (the forge is there)
    { kind: 'brazier', x: g.x - 1, y: y0 },
    { kind: 'brazier', x: g.x + g.n, y: y0 },
    { kind: 'brazier', x: x0, y: y1 },
    { kind: 'brazier', x: x1, y: y1 },
    // (none on the right: one there stood straight behind the tent, its head over the roof like a chimney)
    { kind: 'pillar', x: 10, y: 9 },
    { kind: 'pillar', x: 7, y: 10 },
    { kind: 'barrel', x: x1, y: 10 },
    { kind: 'barrel', x: x1, y: 11 },
    { kind: 'urn', x: x1 - 1, y: 10 },
    { kind: 'barrel', x: x0, y: 17 },
  ];
  const floor: Floor = {
    depth: 0,
    seed,
    w,
    h,
    tiles,
    variant,
    rooms: [{ id: 0, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, kind: 'start', path: 0 }],
    start: { ...TOWN.start },
    boss: { ...TOWN.gate },
    packs: [],
    props,
  };
  // (the gate is in the wall: the town has no portal standing on its floor)
  const level = finish(floor, true, null);
  const lex = townProp(level, 'lexicon', TOWN.lexicon.x, TOWN.lexicon.y);
  const stash = townProp(level, 'stash', TOWN.stash.x, TOWN.stash.y);
  // the smithy
  const armourer = townProp(level, 'armourer', TOWN.armourer.x, TOWN.armourer.y);
  townProp(level, 'anvil', TOWN.anvil.x, TOWN.anvil.y);
  townProp(level, 'forge', TOWN.forge.x, TOWN.forge.y);
  townProp(level, 'rack', TOWN.rack.x, TOWN.rack.y);
  townProp(level, 'trough', TOWN.trough.x, TOWN.trough.y);
  // the bazaar
  townFlat(level, 'rug', TOWN.mystic.x, TOWN.mystic.y);
  townProp(level, 'tentBack', TOWN.tentBack.x, TOWN.tentBack.y);
  const mystic = townProp(level, 'mystic', TOWN.mystic.x, TOWN.mystic.y);
  const table = townProp(level, 'tentTable', TOWN.tentTable.x, TOWN.tentTable.y);
  // (The tent's back and its table are each wider than a tile, and what lies between them is the
  // trader's own: nobody walks under the roof or behind the table. The stall is the trader's tile
  // and the eight round it: three tiles along the grid and three deep.)
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) townBlock(level, TOWN.mystic.x + dx, TOWN.mystic.y + dy);
  // the wordsmith's ring
  townFlat(level, 'runeRing', TOWN.wordsmith.x, TOWN.wordsmith.y);
  const smith = townProp(level, 'wordsmith', TOWN.wordsmith.x, TOWN.wordsmith.y);
  townProp(level, 'runeSlab', TOWN.runeSlab.x, TOWN.runeSlab.y);
  TOWN.runeStones.forEach(([dx, dy], i) => townProp(level, 'runeStone', TOWN.wordsmith.x + dx, TOWN.wordsmith.y + dy, i));
  const stranger = townProp(level, 'stranger', TOWN.stranger.x, TOWN.stranger.y);
  level.stations = [
    { kind: 'gate', x: TOWN.gate.x, y: TOWN.gate.y },
    { kind: 'lexicon', x: lex.x, y: lex.y },
    { kind: 'wordsmith', x: smith.x, y: smith.y },
    { kind: 'armourer', x: armourer.x, y: armourer.y },
    // (the mystic is spoken to across the table of wares)
    { kind: 'mystic', x: table.x, y: table.y },
    { kind: 'stash', x: stash.x, y: stash.y },
  ];
  // (the shady man's gamble: his station, once the trades are open; until then he only stands there)
  if (TUNE.tradesOpen) level.stations.push({ kind: 'stranger', x: stranger.x, y: stranger.y });
  // (the trader behind the table can be reached by nobody: the place to stand is in front of the table)
  void mystic;
  return level;
}

/** The practice room: one big lit hall with a few pillars to fight round. Nothing to find, no way out but the menu. */
export const ARENA = { w: 30, h: 30, x0: 6, y0: 6, x1: 23, y1: 23, start: { x: 15, y: 15 } };

export function makeArena(seed: number): Level {
  const rng = new RNG(seed ^ 0x2545f491);
  const { w, h, x0, y0, x1, y1 } = ARENA;
  const tiles = new Uint8Array(w * h).fill(T_VOID);
  const variant = new Uint8Array(w * h);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y * w + x] = T_FLOOR;
  for (let y = y0 - 1; y <= y1 + 1; y++) {
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      if (tiles[y * w + x] === T_VOID) tiles[y * w + x] = T_WALL;
    }
  }
  const props: PropSpot[] = [
    { kind: 'brazier', x: x0, y: y0 },
    { kind: 'brazier', x: x1, y: y0 },
    { kind: 'brazier', x: x0, y: y1 },
    { kind: 'brazier', x: x1, y: y1 },
    { kind: 'brazier', x: 14, y: y0 },
    { kind: 'brazier', x: x0, y: 14 },
    { kind: 'pillar', x: 10, y: 10 },
    { kind: 'pillar', x: 19, y: 10 },
    { kind: 'pillar', x: 10, y: 19 },
    { kind: 'pillar', x: 19, y: 19 },
  ];
  const floor: Floor = {
    depth: 0,
    seed,
    w,
    h,
    tiles,
    variant,
    rooms: [{ id: 0, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, kind: 'start', path: 0 }],
    start: { ...ARENA.start },
    boss: { ...ARENA.start },
    packs: [],
    props,
  };
  const level = finish(floor, false, null);
  level.explored.fill(1);
  return level;
}

/**
 * A HALL WITH LEDGES, STAIRS, A GAP AND A PIT, built by hand (7 Oct 2026): the practice room's
 * size and place, so that everything of the practice room works in it. It is where height is
 * photographed and tried before the map-maker lays any of it in a dungeon.
 *
 *   the terrace   nine tiles along the upper-right wall from the top corner, five deep, one level
 *                 up: its long edge faces down the screen to the left, its short one to the right
 *   two flights   of stairs, each two tiles wide, standing out from those edges: one goes up to
 *                 the upper right of the screen, one to the upper left
 *   the pit       three tiles by three, out in the floor
 *   the gap       two tiles wide, cutting the near-left corner of the hall off from the rest: an
 *                 island six tiles by four, with a chest on it, that only a swipe move reaches
 */
export const LEDGE_HALL = {
  terrace: { x0: 6, y0: 6, x1: 14, y1: 10 },
  stairsN: [{ x: 9, y: 11 }, { x: 10, y: 11 }],
  stairsW: [{ x: 15, y: 8 }, { x: 15, y: 9 }],
  pit: { x0: 18, y0: 14, x1: 20, y1: 16 },
  island: { x0: 6, y0: 20, x1: 11, y1: 23 },
};

export function makeLedgeHall(seed: number): Level {
  const rng = new RNG(seed ^ 0x2545f491);
  const { w, h, x0, y0, x1, y1 } = ARENA;
  const tiles = new Uint8Array(w * h).fill(T_VOID);
  const variant = new Uint8Array(w * h);
  const height = new Int8Array(w * h);
  const stair = new Uint8Array(w * h);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y * w + x] = T_FLOOR;
  for (let y = y0 - 1; y <= y1 + 1; y++) {
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      if (tiles[y * w + x] === T_VOID) tiles[y * w + x] = T_WALL;
    }
  }
  const H = LEDGE_HALL;
  for (let y = H.terrace.y0; y <= H.terrace.y1; y++) for (let x = H.terrace.x0; x <= H.terrace.x1; x++) height[y * w + x] = 1;
  for (const s of H.stairsN) stair[s.y * w + s.x] = STAIR_N;
  for (const s of H.stairsW) stair[s.y * w + s.x] = STAIR_W;
  for (let y = H.pit.y0; y <= H.pit.y1; y++) for (let x = H.pit.x0; x <= H.pit.x1; x++) tiles[y * w + x] = T_PIT;
  // the gap round the island: two tiles of nothing along its far side and its right side
  for (let y = H.island.y0 - 2; y <= y1; y++) {
    for (let x = x0; x <= H.island.x1 + 2; x++) {
      if (y < H.island.y0 || x > H.island.x1) tiles[y * w + x] = T_PIT;
    }
  }
  const props: PropSpot[] = [
    { kind: 'brazier', x: x0, y: y0 },
    { kind: 'brazier', x: H.terrace.x1, y: y0 },
    { kind: 'brazier', x: x1, y: y0 },
    { kind: 'brazier', x: x1, y: y1 },
    { kind: 'brazier', x: x0, y: 15 },
    { kind: 'brazier', x: 16, y: y1 },
    { kind: 'brazier', x: H.island.x0, y: y1 },
    { kind: 'chest', x: 7, y: 8 },
    { kind: 'chest', x: 8, y: 22 },
    { kind: 'pillar', x: 20, y: 9 },
    { kind: 'pillar', x: 20, y: 20 },
    { kind: 'urn', x: 12, y: 6 },
    { kind: 'barrel', x: 13, y: 6 },
  ];
  const floor: Floor = {
    depth: 0,
    seed,
    w,
    h,
    tiles,
    variant,
    height,
    stair,
    rooms: [{ id: 0, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, kind: 'start', path: 0 }],
    start: { ...ARENA.start },
    boss: { ...ARENA.start },
    packs: [],
    props,
  };
  const level = finish(floor, false, null);
  level.explored.fill(1);
  return level;
}

/** The practice room's halls: the room itself, the two built by hand for trying height in, the rooms of each shape, (THE MIX) the one with a lever, its gate and a room that locks, and (THE TRAPS) the one with a spike floor, a dart wall and a sealed door. */
export type Hall = 'arena' | 'ledges' | 'steps' | 'mix' | 'traps' | `shape:${Shape}`;

/**
 * (THE MIX) FIVE ROOMS LAID BY HAND, WITH A LEVER, ITS GATE AND A ROOM THAT LOCKS: where the rules
 * of the mix are tried and photographed before the map-maker lays any of it in a dungeon
 * (`#hall=mix`). Unlike the other halls it is dark until walked, as a dungeon is.
 *
 *   the first room   ten tiles by ten: the hero begins in it
 *   the nook         five by five, up a short way from the first room's far-right side, behind a
 *                    door: the LEVER stands against its far wall
 *   the gated room   eight by eleven, down the screen to the right of the first room: THE GATE
 *                    stands in its way in, down until the lever is pulled
 *   the room that    ten by twelve, on from the gated room: a gate hangs in each of its two
 *   locks            doorways (its way in, and the way on), up until the hero is well inside
 *                    with its pack
 *   the last room    nine by six, on from that, behind a door
 */
export const MIX_HALL = {
  w: 50,
  h: 38,
  rooms: [
    { id: 0, x: 6, y: 12, w: 10, h: 10, kind: 'start', path: 0 },
    { id: 1, x: 21, y: 11, w: 8, h: 11, kind: 'normal', path: 1, gated: true },
    { id: 2, x: 8, y: 3, w: 5, h: 5, kind: 'normal', path: -1, nook: true },
    { id: 3, x: 34, y: 10, w: 10, h: 12, kind: 'elite', path: 2, locks: true },
    { id: 4, x: 35, y: 26, w: 9, h: 6, kind: 'normal', path: 3 },
  ] as Room[],
  /** The ways between them, each three tiles wide: x0, y0, x1, y1. */
  ways: [
    [16, 15, 20, 17],
    [9, 8, 11, 11],
    [29, 15, 33, 17],
    [38, 22, 40, 25],
  ] as ReadonlyArray<readonly [number, number, number, number]>,
  start: { x: 10.5, y: 16.5 },
  lever: { x: 10, y: 3, room: 1 },
  /** Where the packs of the gated room and of the room that locks stand (a test, or a playtest, sets monsters down there: a practice hall has none of its own). */
  packs: [
    { x: 25.5, y: 16.5, roomId: 1, size: 3, tier: 'normal' },
    { x: 39.5, y: 15.5, roomId: 3, size: 4, tier: 'elite' },
  ] as PackSpot[],
};

export function makeMixHall(seed: number): Level {
  const rng = new RNG(seed ^ 0x2545f491);
  const { w, h } = MIX_HALL;
  const tiles = new Uint8Array(w * h).fill(T_VOID);
  const variant = new Uint8Array(w * h);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  for (const r of MIX_HALL.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) tiles[y * w + x] = T_FLOOR;
  for (const [x0, y0, x1, y1] of MIX_HALL.ways) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y * w + x] = T_FLOOR;
  // (wall wherever nothing is and floor is beside it, corner to corner too)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (tiles[y * w + x] !== T_VOID) continue;
      let beside = false;
      for (let dy = -1; dy <= 1 && !beside; dy++) for (let dx = -1; dx <= 1 && !beside; dx++) beside = tiles[(y + dy) * w + x + dx] === T_FLOOR;
      if (beside) tiles[y * w + x] = T_WALL;
    }
  }
  const lever = MIX_HALL.lever;
  const props: PropSpot[] = [
    { kind: 'brazier', x: 6, y: 12 },
    { kind: 'brazier', x: 15, y: 21 },
    { kind: 'brazier', x: 21, y: 11 },
    { kind: 'brazier', x: 28, y: 21 },
    { kind: 'brazier', x: 8, y: 3 },
    { kind: 'brazier', x: 34, y: 10 },
    { kind: 'brazier', x: 43, y: 21 },
    { kind: 'brazier', x: 35, y: 26 },
    { kind: 'lever', x: lever.x, y: lever.y },
  ];
  const floor: Floor = {
    depth: 0,
    seed,
    w,
    h,
    tiles,
    variant,
    rooms: MIX_HALL.rooms.map((r) => ({ ...r })),
    start: { ...MIX_HALL.start },
    boss: { ...MIX_HALL.start },
    packs: MIX_HALL.packs.map((p) => ({ ...p })),
    props,
    levers: [{ ...lever }],
  };
  // (the hall shows every piece of the mix, and the doors with them: a door in every room's way in, whatever the share of rooms with one)
  const share = DOORS.share;
  DOORS.share = 1;
  floor.doors = layDoors(floor);
  DOORS.share = share;
  return finish(floor, false, null);
}

/**
 * (THE TRAPS, game/traps.ts) FOUR ROOMS LAID BY HAND, WITH TWO SPIKE FLOORS, A DART WALL AND A
 * SEALED DOOR: where the traps are tried and photographed before the map-maker lays any of them in
 * a dungeon (`#hall=traps`). Dark until walked, as a dungeon is. No plain doors: the only door is
 * the sealed one.
 *
 *   the first room   ten tiles by ten: the hero begins in it
 *   the corridor     on to the right, three wide: A SPIKE FLOOR across it, two tiles long
 *   the spike room   ten by twelve: A SPIKE FLOOR four by four in the middle of it, half a beat
 *                    behind the corridor's
 *   the dart run     down from the spike room, and then to the right along a corridor thirteen
 *                    tiles long: THE PLATE lies in it, and THE SLOT is in the wall at its far left
 *                    end, where it turns
 *   the last room    ten by nine, at the end of the dart run; up from it a short way, behind
 *   and the vault    A SEALED DOOR with the rune of FLAME, a small vault with a chest
 */
export const TRAP_HALL = {
  w: 52,
  h: 44,
  rooms: [
    { id: 0, x: 4, y: 14, w: 10, h: 10, kind: 'start', path: 0 },
    { id: 1, x: 20, y: 13, w: 10, h: 12, kind: 'normal', path: 1 },
    { id: 2, x: 37, y: 30, w: 10, h: 9, kind: 'normal', path: 2 },
    { id: 3, x: 40, y: 21, w: 5, h: 5, kind: 'treasure', path: -1, sealed: 'fire' },
  ] as Room[],
  /** The ways between them, each three tiles wide: x0, y0, x1, y1. */
  ways: [
    [14, 17, 19, 19],
    [24, 25, 26, 33],
    [24, 31, 36, 33],
    [41, 26, 43, 29],
  ] as ReadonlyArray<readonly [number, number, number, number]>,
  start: { x: 8.5, y: 18.5 },
  hazards: [
    { kind: 'spikes', x: 16, y: 17, w: 2, h: 3, phase: 0 },
    { kind: 'spikes', x: 23, y: 17, w: 4, h: 4, phase: 1.25 },
    { kind: 'darts', x: 31, y: 32, w: 1, h: 1, slot: { x: 23, y: 32, dx: 1, dy: 0 } },
  ] as HazardSpot[],
  /** Where a pack of the spike room stands (a test, or a playtest, sets monsters down there: a practice hall has none of its own). */
  packs: [{ x: 27.5, y: 22.5, roomId: 1, size: 3, tier: 'normal' }] as PackSpot[],
};

export function makeTrapHall(seed: number): Level {
  const rng = new RNG(seed ^ 0x2545f491);
  const { w, h } = TRAP_HALL;
  const tiles = new Uint8Array(w * h).fill(T_VOID);
  const variant = new Uint8Array(w * h);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  for (const r of TRAP_HALL.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) tiles[y * w + x] = T_FLOOR;
  for (const [x0, y0, x1, y1] of TRAP_HALL.ways) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y * w + x] = T_FLOOR;
  // (wall wherever nothing is and floor is beside it, corner to corner too)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (tiles[y * w + x] !== T_VOID) continue;
      let beside = false;
      for (let dy = -1; dy <= 1 && !beside; dy++) for (let dx = -1; dx <= 1 && !beside; dx++) beside = tiles[(y + dy) * w + x + dx] === T_FLOOR;
      if (beside) tiles[y * w + x] = T_WALL;
    }
  }
  const props: PropSpot[] = [
    { kind: 'brazier', x: 4, y: 14 },
    { kind: 'brazier', x: 13, y: 23 },
    { kind: 'brazier', x: 20, y: 13 },
    { kind: 'brazier', x: 29, y: 24 },
    { kind: 'brazier', x: 20, y: 24 },
    { kind: 'brazier', x: 37, y: 30 },
    { kind: 'brazier', x: 46, y: 38 },
    { kind: 'brazier', x: 40, y: 21 },
    { kind: 'chest', x: 42, y: 22 },
    { kind: 'bones', x: 18, y: 21 },
    { kind: 'rubble', x: 34, y: 33 },
  ];
  const floor: Floor = {
    depth: 0,
    seed,
    w,
    h,
    tiles,
    variant,
    rooms: TRAP_HALL.rooms.map((r) => ({ ...r })),
    start: { ...TRAP_HALL.start },
    boss: { ...TRAP_HALL.start },
    packs: TRAP_HALL.packs.map((p) => ({ ...p })),
    props,
    hazards: TRAP_HALL.hazards.map((z) => ({ ...z, slot: z.slot ? { ...z.slot } : undefined })),
  };
  // (no plain doors: the sealed door alone, which its room has whatever the share of rooms with a door)
  const share = DOORS.share;
  DOORS.share = 0;
  floor.doors = layDoors(floor);
  DOORS.share = share;
  return finish(floor, false, null);
}

/**
 * A HALL WITH FLOOR ONE LEVEL UP AND FLOOR ONE LEVEL DOWN, built by hand (the owner, 7 Oct 2026,
 * 08:01: "Stairs should go down as well"): the practice room's size and place. It is where sunken
 * floor is photographed and tried before the map-maker lays any of it in a dungeon.
 *
 *   the terrace   in the hall's top corner, seven tiles by four, one level UP, with a flight up
 *                 to it from each of its two near edges
 *   the sunken    floor, eight tiles by seven out in the hall, one level DOWN, with floor of the
 *   floor         hall's own height all round it; a flight down into it from each of its two far
 *                 edges (a flight of stairs is seen from its foot: so one that goes down comes
 *                 toward the eye)
 */
export const STEP_HALL = {
  terrace: { x0: 6, y0: 6, x1: 12, y1: 9 },
  upN: [{ x: 9, y: 10 }, { x: 10, y: 10 }],
  upW: [{ x: 13, y: 7 }, { x: 13, y: 8 }],
  sunken: { x0: 13, y0: 14, x1: 20, y1: 20 },
  downN: [{ x: 16, y: 14 }, { x: 17, y: 14 }],
  downW: [{ x: 13, y: 17 }, { x: 13, y: 18 }],
};

export function makeStepHall(seed: number): Level {
  const rng = new RNG(seed ^ 0x2545f491);
  const { w, h, x0, y0, x1, y1 } = ARENA;
  const tiles = new Uint8Array(w * h).fill(T_VOID);
  const variant = new Uint8Array(w * h);
  const height = new Int8Array(w * h);
  const stair = new Uint8Array(w * h);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y * w + x] = T_FLOOR;
  for (let y = y0 - 1; y <= y1 + 1; y++) {
    for (let x = x0 - 1; x <= x1 + 1; x++) {
      if (tiles[y * w + x] === T_VOID) tiles[y * w + x] = T_WALL;
    }
  }
  const H = STEP_HALL;
  for (let y = H.terrace.y0; y <= H.terrace.y1; y++) for (let x = H.terrace.x0; x <= H.terrace.x1; x++) height[y * w + x] = 1;
  for (const s of H.upN) stair[s.y * w + s.x] = STAIR_N;
  for (const s of H.upW) stair[s.y * w + s.x] = STAIR_W;
  // (a flight down stands IN the sunken floor, at its far edge: its foot is sunken floor, its head the hall's)
  for (let y = H.sunken.y0; y <= H.sunken.y1; y++) for (let x = H.sunken.x0; x <= H.sunken.x1; x++) height[y * w + x] = -1;
  for (const s of H.downN) stair[s.y * w + s.x] = STAIR_N;
  for (const s of H.downW) stair[s.y * w + s.x] = STAIR_W;
  const props: PropSpot[] = [
    { kind: 'brazier', x: x0, y: y0 },
    { kind: 'brazier', x: H.terrace.x1, y: y0 },
    { kind: 'brazier', x: x1, y: y0 },
    { kind: 'brazier', x: x1, y: y1 },
    { kind: 'brazier', x: x0, y: y1 },
    { kind: 'brazier', x: x0, y: 14 },
    { kind: 'chest', x: 7, y: 7 },
    { kind: 'chest', x: 19, y: 19 },
    { kind: 'pillar', x: 22, y: 12 },
    { kind: 'pillar', x: 15, y: 19 },
    { kind: 'urn', x: 11, y: 6 },
    { kind: 'barrel', x: 12, y: 6 },
    { kind: 'barrel', x: 20, y: 15 },
    { kind: 'bones', x: 18, y: 17 },
  ];
  const floor: Floor = {
    depth: 0,
    seed,
    w,
    h,
    tiles,
    variant,
    height,
    stair,
    rooms: [{ id: 0, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, kind: 'start', path: 0 }],
    start: { ...ARENA.start },
    boss: { ...ARENA.start },
    packs: [],
    props,
  };
  // (the hero arrives on the hall's own floor, between the two)
  floor.start = { x: 11.5, y: 13.5 };
  const level = finish(floor, false, null);
  level.explored.fill(1);
  return level;
}

/**
 * TRIANGLES: rooms whose walls are not all on the slant, built by hand in the practice room's
 * place (the owner, 7 Oct 2026: "Id like see some stills of some rooms with triangles to
 * decide"; of those stills: "Triangles look pretty good I like it"). They are where a cut tile is
 * photographed and tried: bodies are held off its wall half and slide along it (game/cut.ts).
 *   square   a room as rooms are now
 *   stepped  the same with its corners taken off in steps, as the map-maker does it today
 *   cut      the same with its four corners cut clean, three tiles each
 *   eight    an eight-sided hall: the corners cut four tiles each
 *   back     a hall whose back corner is cut wide: a flat back wall that faces the eye
 *   across   two rooms and a corridor that runs straight across the screen
 *   updown   two rooms and a corridor that runs straight up and down the screen
 */
export type Shape = 'square' | 'stepped' | 'cut' | 'eight' | 'back' | 'across' | 'updown';
export const SHAPES: readonly Shape[] = ['square', 'stepped', 'cut', 'eight', 'back', 'across', 'updown'];

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export function makeShapeRoom(kind: Shape, seed: number): Level {
  const rng = new RNG(seed ^ 0x2545f491);
  const { w, h } = ARENA;
  const tiles = new Uint8Array(w * h).fill(T_VOID);
  const cut = new Uint8Array(w * h);
  const variant = new Uint8Array(w * h);
  for (let i = 0; i < variant.length; i++) variant[i] = rng.int(0, 255);
  const box = (b: Box): void => {
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) tiles[y * w + x] = T_FLOOR;
  };
  /** How far a tile is from one corner of a box, counted in steps along the grid. */
  const from = (b: Box, which: 'back' | 'front' | 'left' | 'right', x: number, y: number): number =>
    which === 'back' ? x - b.x0 + (y - b.y0) : which === 'front' ? b.x1 - x + (b.y1 - y) : which === 'left' ? x - b.x0 + (b.y1 - y) : b.x1 - x + (y - b.y0);
  /** Cut a corner of a box clean, `k` tiles: a line of half tiles, and behind them a line of half walls so that the wall is a whole tile thick. */
  const corner = (b: Box, which: 'back' | 'front' | 'left' | 'right', k: number): void => {
    for (let y = b.y0; y <= b.y1; y++) {
      for (let x = b.x0; x <= b.x1; x++) {
        const d = from(b, which, x, y);
        const i = y * w + x;
        if (d < k - 2) tiles[i] = T_VOID;
        else if (d === k - 2) {
          tiles[i] = T_WALL;
          cut[i] = which === 'back' ? CUT_NEAR : which === 'front' ? CUT_FAR_LOW : which === 'left' ? CUT_RIGHT : CUT_LEFT;
        } else if (d === k - 1) cut[i] = which === 'back' ? CUT_FAR : which === 'front' ? CUT_NEAR_LOW : which === 'left' ? CUT_LEFT : CUT_RIGHT;
      }
    }
  };
  /** Take a corner off in steps, as the map-maker does today: whole tiles. */
  const steps = (b: Box, which: 'back' | 'front' | 'left' | 'right', k: number): void => {
    for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) if (from(b, which, x, y) < k - 1) tiles[y * w + x] = T_VOID;
  };
  const props: PropSpot[] = [];
  const room: Box = { x0: 8, y0: 8, x1: 21, y1: 21 };
  if (kind === 'across' || kind === 'updown') {
    const a: Box = kind === 'across' ? { x0: 7, y0: 17, x1: 12, y1: 22 } : { x0: 7, y0: 7, x1: 12, y1: 12 };
    const b: Box = kind === 'across' ? { x0: 17, y0: 7, x1: 22, y1: 12 } : { x0: 17, y0: 17, x1: 22, y1: 22 };
    box(a);
    box(b);
    for (let y = 12; y <= 17; y++) {
      for (let x = 12; x <= 17; x++) {
        const i = y * w + x;
        if (tiles[i] === T_FLOOR) continue;
        // (across: the corridor is the tiles of one band of x + y; up and down: of one band of x - y)
        const t = kind === 'across' ? x + y - 30 : x - y;
        const lo = kind === 'across' ? -2 : -1;
        const hi = 1;
        if (t >= lo && t <= hi) tiles[i] = T_FLOOR;
        else if (t === lo - 1) {
          tiles[i] = T_FLOOR;
          cut[i] = kind === 'across' ? CUT_FAR : CUT_LEFT;
        } else if (t === hi + 1) {
          tiles[i] = T_FLOOR;
          cut[i] = kind === 'across' ? CUT_NEAR_LOW : CUT_RIGHT;
        } else if (t === lo - 2) {
          tiles[i] = T_WALL;
          cut[i] = kind === 'across' ? CUT_NEAR : CUT_RIGHT;
        } else if (t === hi + 2) {
          tiles[i] = T_WALL;
          cut[i] = kind === 'across' ? CUT_FAR_LOW : CUT_LEFT;
        }
      }
    }
    props.push({ kind: 'brazier', x: a.x0, y: a.y0 }, { kind: 'brazier', x: b.x1, y: b.y1 }, { kind: 'brazier', x: a.x0, y: a.y1 }, { kind: 'brazier', x: b.x1, y: b.y0 });
  } else {
    box(room);
    const k = kind === 'cut' ? 3 : kind === 'eight' ? 4 : 0;
    if (kind === 'stepped') for (const c of ['back', 'front', 'left', 'right'] as const) steps(room, c, 3);
    if (k > 0) for (const c of ['back', 'front', 'left', 'right'] as const) corner(room, c, k);
    if (kind === 'back') {
      corner(room, 'back', 7);
      // (against the flat wall: a chest between two fires)
      props.push({ kind: 'chest', x: 11, y: 11 }, { kind: 'brazier', x: 14, y: 9 }, { kind: 'brazier', x: 9, y: 14 });
    }
    // a fire in the middle of each straight wall (the same in every one of these rooms, so that they can be told apart by their shape alone)
    if (kind !== 'back') props.push({ kind: 'brazier', x: 15, y: 8 }, { kind: 'brazier', x: 8, y: 15 });
    props.push({ kind: 'brazier', x: 21, y: 14 }, { kind: 'brazier', x: 14, y: 21 }, { kind: 'pillar', x: 17, y: 12 }, { kind: 'pillar', x: 12, y: 17 });
  }
  // the ordinary walls: round every whole tile of floor
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (tiles[i] !== T_FLOOR || cut[i] !== 0) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (tiles[i + dy * w + dx] === T_VOID) tiles[i + dy * w + dx] = T_WALL;
    }
  }
  const floor: Floor = {
    depth: 0,
    seed,
    w,
    h,
    tiles,
    variant,
    cut,
    rooms: [{ id: 0, x: room.x0, y: room.y0, w: 14, h: 14, kind: 'start', path: 0 }],
    start: { ...ARENA.start },
    boss: { ...ARENA.start },
    packs: [],
    props,
  };
  const level = finish(floor, false, null);
  level.explored.fill(1);
  return level;
}

/** Dungeon number `depth`: one large generated level whose boss room holds the way home. */
export function makeDungeon(depth: number, seed: number): Level {
  const floor = generateFloor(depth, seed);
  // The exit portal stands in the boss room and stays dark until the boss dies.
  return finish(floor, false, portalAt(floor.boss.x, floor.boss.y, false));
}
